const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const axios = require('axios');

require('dotenv').config();

const app = express();

// Middleware to parse JSON
app.use(bodyParser.json());

// Authorization middleware
const authorizeUser = (req, res, next) => {
  const token = req.query.Authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).send('<h1 align="center"> Login to Continue </h1>');
  }

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY, { algorithms: ['HS256'] });
    req.user = decodedToken;
    next(); // Proceed to the next middleware
  } catch (error) {
    return res.status(401).json({ message: 'Invalid authorization token' });
  }
};

// WebAuthn proxy routes
app.get('/init-register', async (req, res) => {
  const { voter_id } = req.query;
  try {
    const response = await axios.get(`http://127.0.0.1:8000/init-register?voter_id=${voter_id}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to initialize registration' });
  }
});

app.post('/verify-register', async (req, res) => {
  try {
    const response = await axios.post('http://127.0.0.1:8000/verify-register', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify registration' });
  }
});

app.get('/init-auth', async (req, res) => {
  const { voter_id } = req.query;
  try {
    const response = await axios.get(`http://127.0.0.1:8000/init-auth?voter_id=${voter_id}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to initialize authentication' });
  }
});

app.post('/verify-auth', async (req, res) => {
  try {
    const response = await axios.post('http://127.0.0.1:8000/verify-auth', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify authentication' });
  }
});

// Registration endpoint
app.post('/register', (req, res) => {
  const { voter_id, password, role } = req.body;

  // Send the registration request to your Python API or handle it here
  axios
    .post('http://127.0.0.1:8000/register', { voter_id, password, role })
    .then((response) => {
      res.status(response.status).json(response.data);
    })
    .catch((error) => {
      res
        .status(error.response?.status || 500)
        .json({ message: error.response?.data?.detail || 'Registration failed' });
    });
});

// Static routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/login.html'));
});

app.get('/js/login.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/js/login.js'));
});

app.get('/css/login.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/css/login.css'));
});

app.get('/css/index.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/css/index.css'));
});

app.get('/css/admin.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/css/admin.css'));
});

app.get('/assets/waleed.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/assets/waleed.jpg'));
});
app.get('/assets/furqan.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/assets/furqan.jpg'));
});
app.get('/assets/abdullah.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/assets/abdullah.jpg'));
});

app.get('/js/app.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/js/app.js'));
});

app.get('/admin.html', authorizeUser, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/admin.html'));
});

app.get('/index.html', authorizeUser, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/index.html'));
});

app.get('/dist/login.bundle.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/dist/login.bundle.js'));
});

app.get('/dist/app.bundle.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/dist/app.bundle.js'));
});

// Serve the favicon.ico file
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/favicon.ico'));
});

// Start the server
app.listen(8080, () => {
  console.log('Server listening on http://localhost:8080');
});
