const loginForm = document.getElementById('loginForm');
const fingerprintButton = document.querySelector("[data-login-fingerprint]");

// Password login
loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const voter_id = document.getElementById('voter-id').value;
  const password = document.getElementById('password').value;
  const token = voter_id;

  const headers = {
    'method': "GET",
    'Authorization': `Bearer ${token}`,
  };

  fetch(`http://127.0.0.1:8000/login?voter_id=${voter_id}&password=${password}`, { headers })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Login failed');
      }
    })
    .then(data => {
      if (data.role === 'admin') {
        localStorage.setItem('jwtTokenAdmin', data.token);
        window.location.replace(`http://127.0.0.1:8080/admin.html?Authorization=Bearer ${localStorage.getItem('jwtTokenAdmin')}`);
      } else if (data.role === 'user') {
        localStorage.setItem('jwtTokenVoter', data.token);
        window.location.replace(`http://127.0.0.1:8080/index.html?Authorization=Bearer ${localStorage.getItem('jwtTokenVoter')}`);
      }
    })
    .catch(error => {
      console.error('Login failed:', error.message);
    });
});

// Fingerprint login (WebAuthn) - Using Voter ID
fingerprintButton.addEventListener('click', async () => {
  const voter_id = document.getElementById('voter-id').value;

  try {
    // Step 1: Get challenge using voter_id
    const initResponse = await fetch(`http://127.0.0.1:8000/init-auth?voter_id=${voter_id}`);
    const options = await initResponse.json();

    // Step 2: Authenticate with WebAuthn
    const authJSON = await startAuthentication(options);

    // Step 3: Verify on server
    const verifyResponse = await fetch('http://127.0.0.1:8000/verify-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(authJSON),
    });

    const verifyData = await verifyResponse.json();
    if (verifyData.verified) {
      alert('Fingerprint login successful!');
      // Redirect logic here...
      const token = verifyData.token; // Assuming the server sends the token upon successful authentication
      localStorage.setItem('jwtTokenVoter', token);
      window.location.replace(`http://127.0.0.1:8080/index.html?Authorization=Bearer ${token}`);
    } else {
      alert('Fingerprint login failed.');
    }
  } catch (error) {
    console.error('Error during fingerprint login:', error);
  }
});

// Register form
const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const voter_id = document.getElementById('register-voter-id').value;
  const password = document.getElementById('register-password').value;

  fetch('http://127.0.0.1:8000/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ voter_id, password }),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Registration failed');
      }
    })
    .then((data) => {
      console.log('Registration successful:', data.message);
      alert('User registered successfully!');
    })
    .catch((error) => {
      console.error(error.message);
      alert('Registration failed!');
    });
});
