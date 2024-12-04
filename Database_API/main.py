import dotenv
import os
import mysql.connector
from fastapi import FastAPI, HTTPException, status, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from webauthn import (
    generate_authentication_options,
    generate_registration_options,
    verify_authentication_response,
    verify_registration_response,
)
import jwt
from mysql.connector import errorcode

# Load environment variables
dotenv.load_dotenv()

# Initialize the FastAPI app
app = FastAPI()

# Define the allowed origins for CORS
origins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow requests from frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Connect to the MySQL database
try:
    cnx = mysql.connector.connect(
        user=os.environ['MYSQL_USER'],
        password=os.environ['MYSQL_PASSWORD'],
        host=os.environ['MYSQL_HOST'],
        database=os.environ['MYSQL_DB'],
    )
    cursor = cnx.cursor()
    print("Connected to the database successfully!")
except mysql.connector.Error as err:
    if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
        print("Something is wrong with your username or password")
    elif err.errno == errorcode.ER_BAD_DB_ERROR:
        print("Database does not exist")
    else:
        print(err)

# WebAuthn Registration Endpoints
@app.get("/init-register")
async def init_register(email: str):
    options = generate_registration_options(
        rp_name="MyApp",
        rp_id="example.com",
        user_id=email,
        user_name=email,
        authenticator_attachment="platform",
    )
    return options

@app.post("/verify-register")
async def verify_register(response: dict = Body(...)):
    try:
        result = verify_registration_response(response)
        if result.verified:
            # Save WebAuthn credentials to fingerprint_data table
            cursor.execute(
                "INSERT INTO fingerprint_data (voter_id, credential_id, public_key, sign_count) VALUES (%s, %s, %s, %s)",
                (response["user_id"], result.credential_id, result.public_key, result.sign_count)
            )
            cnx.commit()
            return {"verified": True}
        else:
            raise HTTPException(status_code=400, detail="Verification failed")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# WebAuthn Authentication Endpoints
@app.get("/init-auth")
async def init_auth(email: str):
    # Fetch fingerprint data (WebAuthn credentials) from the database
    cursor.execute("SELECT * FROM fingerprint_data WHERE voter_id = %s", (email,))
    user_fingerprint_data = cursor.fetchone()

    if user_fingerprint_data:
        options = generate_authentication_options(
            credentials=[{
                "id": user_fingerprint_data[1],  # credential_id
                "publicKey": user_fingerprint_data[2],  # public_key
                "signCount": user_fingerprint_data[3]  # sign_count
            }]
        )
        return options
    else:
        raise HTTPException(status_code=400, detail="No fingerprint data found")

@app.post("/verify-auth")
async def verify_auth(response: dict = Body(...)):
    try:
        # Fetch fingerprint data (WebAuthn credentials) from the database
        cursor.execute("SELECT * FROM fingerprint_data WHERE voter_id = %s", (response["user_id"],))
        user_fingerprint_data = cursor.fetchone()

        if not user_fingerprint_data:
            raise HTTPException(status_code=400, detail="No fingerprint data found")

        result = verify_authentication_response(response)
        if result.verified:
            return {"verified": True}
        else:
            raise HTTPException(status_code=400, detail="Authentication failed")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Authentication middleware (password-based)
async def authenticate(request: Request):
    try:
        api_key = request.headers.get('authorization').replace("Bearer ", "")
        cursor.execute("SELECT * FROM voters WHERE voter_id = %s", (api_key,))
        if api_key not in [row[0] for row in cursor.fetchall()]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Forbidden"
            )
    except:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Forbidden"
        )

# Define the POST endpoint for login (password-based)
@app.get("/login")
async def login(request: Request, voter_id: str, password: str):
    role = await get_role(voter_id, password)

    # Assuming authentication is successful, generate a token
    token = jwt.encode(
        {'voter_id': voter_id, 'role': role},
        os.environ['SECRET_KEY'],
        algorithm='HS256'
    )

    return {'token': token, 'role': role}

# Function to get the role of the user
async def get_role(voter_id, password):
    try:
        cursor.execute(
            "SELECT password, role FROM voters WHERE voter_id = %s", (voter_id,)
        )
        user = cursor.fetchone()
        if user and user[0] == password:  # Compare plain-text passwords
            return user[1]  # Return the user's role
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid voter ID or password"
            )
    except mysql.connector.Error as err:
        print(err)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error"
        )

# Define the POST endpoint for registration
@app.post("/register")
async def register_user(user_data: dict = Body(...)):
    # Extract user details
    voter_id = user_data.get("voter_id")
    password = user_data.get("password")
    role = user_data.get("role", "user")  # Default role is 'user'

    try:
        # Check if the user already exists
        cursor.execute("SELECT voter_id FROM voters WHERE voter_id = %s", (voter_id,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="User already exists.")

        # Insert the new user into the database (store plaintext password)
        cursor.execute(
            "INSERT INTO voters (voter_id, password, role) VALUES (%s, %s, %s)",
            (voter_id, password, role),
        )
        cnx.commit()

        return {"message": "User registered successfully."}
    except mysql.connector.Error as err:
        print(err)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error"
        )
