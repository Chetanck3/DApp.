# Decentralized-Voting-System-Using-Ethereum-Blockchain

#### The Decentralized Voting System using Ethereum Blockchain is a secure and transparent solution for conducting elections. Leveraging Ethereum's blockchain technology, this system ensures tamper-proof voting records, enabling users to cast their votes remotely while maintaining anonymity and preventing fraud. Explore this innovative project for trustworthy and decentralized voting processes.
#### For a cool demo of this project watch this [YouTube video](https://www.youtube.com/watch?v=a5CJ70D2P-E).
#### For more details checkout [Project Report](https://github.com/Krish-Depani/Decentralized-Voting-System-Using-Ethereum-Blockchain/blob/main/Project%20Report%20github.pdf).
#### PS: This project is not maintained anymore.

## Features
-  Implements JWT for secure voter authentication and authorization.
-  Utilizes Ethereum blockchain for tamper-proof and transparent voting records.
-  Removes the need for intermediaries, ensuring a trustless voting process.
-  Admin panel to manage candidates, set voting dates, and monitor results.
-  Intuitive UI for voters to cast votes and view candidate information.

## Requirements
- Node.js (version – 18.14.0)
- Metamask
- Python (version – 3.9)
- FastAPI
- MySQL Database (port – 3306)

## Screenshots

![Login Page](https://github.com/Krish-Depani/Decentralized-Voting-System-Using-Ethereum-Blockchain/blob/main/public/login%20ss.png)

![Admin Page](https://github.com/Krish-Depani/Decentralized-Voting-System-Using-Ethereum-Blockchain/blob/main/public/admin%20ss.png)

![Voter Page](https://github.com/Krish-Depani/Decentralized-Voting-System-Using-Ethereum-Blockchain/blob/main/public/index%20ss.png)

## Installation

1. Open a terminal.

2. Clone the repository by using the command
        
        git clone https://github.com/Chetanck3/DApp..git

3. Download and install [Ganache](https://trufflesuite.com/ganache/).

4. Create a workspace named <b>developement</b>, in the truffle projects section add `truffle-config.js` by clicking `ADD PROJECT` button.

5. Download [Metamask](https://metamask.io/download/) extension for the browser.

6. Now create wallet (if you don't have one), then import accounts from ganache.

7. Add network to the metamask. ( Network name - Localhost 7575, RPC URl - http://localhost:7545, Chain ID - 1337, Currency symbol - ETH)

8. Open MySQL and create database named <b>voter_db</b>. (DON'T USE XAMPP)

9. In the database created, create new table named <b>voters</b> in the given format and add some values.

               -- Create the database
        CREATE DATABASE voter_db;
        
        -- Use the database
        USE voter_db;
        
        -- Create the voters table (for general user data like voter_id, role, password)
        CREATE TABLE voters (
            voter_id VARCHAR(36) PRIMARY KEY NOT NULL,
            role ENUM('admin', 'user') NOT NULL,
            password VARCHAR(255) NOT NULL
        );
        
        -- Create a table to store fingerprint (WebAuthn) credentials
        CREATE TABLE fingerprint_data (
            voter_id VARCHAR(36) PRIMARY KEY NOT NULL,
            credential_id BLOB NOT NULL,
            public_key BLOB NOT NULL,
            sign_count INT NOT NULL,
            FOREIGN KEY (voter_id) REFERENCES voters(voter_id) ON DELETE CASCADE
        );
        
        -- Insert sample data for testing
        INSERT INTO voters (voter_id, role, password)
        VALUES ('0', 'admin', 'admin123');
        
        -- Example of inserting WebAuthn credentials (replace with actual data)
        INSERT INTO fingerprint_data (voter_id, credential_id, public_key, sign_count)
        VALUES 
        ('0', 
          UNHEX('a3b5e3d6f8a1234b5678c9e3ff4a23d324fa56b789c0d1234e9f12ab34c5f6789'), -- Example of a credential_id (Hex format)
          UNHEX('3045022100a8b7e4f5b84a7f06c8b09a7a5e7b0f9b799762df3b8e8504922b93a64823a3b02202c1e41d745c1c78617e1f7b9d2be6bc3725a36c76b7a90d789ed1d6d44264323'), -- Example of a public_key (Hex format)
          0);
        
        -- Delete a specific user's fingerprint data by voter_id
        DELETE FROM fingerprint_data WHERE voter_id = '0';
        
        -- Example to delete a specific user's fingerprint data and the user record from the voters table
        DELETE FROM fingerprint_data WHERE voter_id = '0';
        DELETE FROM voters WHERE voter_id = '0';
        
        -- Delete all users from the table
        SET SQL_SAFE_UPDATES = 0;
        DELETE FROM voters;
        SET SQL_SAFE_UPDATES = 1;
        
        -- Select all voters
        SELECT * FROM voters;
        
        -- Select all fingerprint data
        SELECT * FROM fingerprint_data;

    
   <br>

        +--------------------------------------+-------+-----------+
        | voter_id                             | role  | password  |
        +--------------------------------------+-------+-----------+
        |                                      |       |           |
        +--------------------------------------+-------+-----------+

12. Install truffle globally
    
        npm install -g truffle

14. Go to the root directory of repo and install node modules

        npm install

15. Install python dependencies

        pip install fastapi mysql-connector-python pydantic python-dotenv uvicorn uvicorn[standard] PyJWT

## Usage

#### Note: Update the database credentials in the `./Database_API/.env` file.

1. Open terminal at the project directory

2. Open Ganache and it's <b>development</b> workspace.

3. open terminal in project's root directory and run the command

        truffle console
   then compile the smart contracts with command

        compile
   exit the truffle console

5. Bundle app.js with browserify
    
        browserify ./src/js/app.js -o ./src/dist/app.bundle.js

2. Start the node server server
    
        node index.js

3. Navigate to `Database_API` folder in another terminal
    
        cd Database_API
    then start the database server by following command

        python -m uvicorn main:app --reload --host 127.0.0.1

4. In a new terminal migrate the truffle contract to local blockchain
    
        truffle migrate

You're all set! The Voting app should be up and running now at http://localhost:8080/.<br>
For more info about usage checkout [YouTube video](https://www.youtube.com/watch?v=a5CJ70D2P-E).

## Code Structure

    ├── blockchain-voting-dapp            # Root directory of the project.
        ├── build                         # Directory containing compiled contract artifacts.
        |   └── contracts                 
        |       ├── Migrations.json       
        |       └── Voting.json           
        ├── contracts                     # Directory containing smart contract source code.
        |   ├── 2_deploy_contracts.js     
        |   ├── Migrations.sol            
        |   └── Voting.sol                
        ├── Database_API                  # API code for database communication.
        |   └── main.py                   
        ├── migrations                    # Ethereum contract deployment scripts.
        |   └── 1_initial_migration.js    
        ├── node_modules                  # Node.js modules and dependencies.
        ├── public                        # Public assets like favicon.
        |   └── favicon.ico               
        ├── src                           
        |   ├── assets                    # Project images.
        |   |   └── eth5.jpg              
        |   ├── css                       # CSS stylesheets.
        |   |   ├── admin.css             
        |   |   ├── index.css             
        |   |   └── login.css             
        |   ├── dist                      # Compiled JavaScript bundles.
        |   |   ├── app.bundle.js         
        |   |   └── login.bundle.js       
        |   ├── html                      # HTML templates.
        |   |   ├── admin.html            
        |   |   ├── index.html            
        |   |   └── login.html            
        |   └── js                        # JavaScript logic files.
        |       ├── app.js                
        |       └── login.js              
        ├── index.js                      # Main entry point for Node.js application.
        ├── package.json                  # Node.js package configuration.
        ├── package-lock.json             # Lockfile for package dependencies.
        ├── README.md                     # Project documentation.
        └── truffle-config.js                    # Truffle configuration file.

## License

The code in this repository is licensed under the MIT License. This means that you are free to use, modify, and distribute the code, as long as you include the original copyright and license notice. For more information about LICENSE please click [here](https://github.com/Krish-Depani/Decentralized-Voting-System-Using-Ethereum-Blockchain/blob/main/LICENSE).

## If you like this project, please give it a 🌟.
## Thank you 😊.
