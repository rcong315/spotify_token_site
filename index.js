require('dotenv').config();
const express = require('express');
const axios = require('axios');
// Import 'open' dynamically as it's an ES Module
let open;
import('open').then(module => {
  open = module.default;
});
const crypto = require('crypto');

// Spotify API credentials from .env file
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const PORT = process.env.PORT || 8888;

// Verify credentials are set
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: Spotify credentials not found!');
  console.log('Please set your SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in the .env file.');
  console.log('You can get these from https://developer.spotify.com/dashboard');
  process.exit(1);
}

const app = express();

// Generate a random state value for security
const state = crypto.randomBytes(16).toString('hex');

// Authorization scopes - add or remove as needed
const scopes = [
  // User data
  'user-read-private',
  'user-read-email',
  
  // Playlists
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private',
  
  // Library
  'user-library-read',
  'user-library-modify',
  
  // Listening history
  'user-top-read',
  'user-read-recently-played',
  
  // Playback
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  
  // Follow
  'user-follow-read',
  'user-follow-modify'
].join(' ');

// Route to start the authorization flow
app.get('/login', (req, res) => {
  // Redirect to Spotify authorization page
  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('client_id', CLIENT_ID);
  authUrl.searchParams.append('scope', scopes);
  authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.append('state', state);
  
  res.redirect(authUrl.toString());
});

// Route to handle the callback from Spotify
app.get('/callback', async (req, res) => {
  const { code, state: returnedState, error } = req.query;
  
  // Check if there was an error or if state doesn't match
  if (error) {
    console.error('Error during authorization:', error);
    return res.send(`
      <h1>Authentication Error</h1>
      <p>${error}</p>
      <a href="/login">Try Again</a>
    `);
  }
  
  if (returnedState !== state) {
    console.error('State mismatch! Possible CSRF attack');
    return res.send(`
      <h1>Authentication Error</h1>
      <p>State verification failed. Possible CSRF attack.</p>
      <a href="/login">Try Again</a>
    `);
  }
  
  try {
    // Exchange the code for an access token
    const tokenResponse = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
      }
    });
    
    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    
    // Display the tokens to the user
    res.send(`
      <h1>Authentication Successful!</h1>
      <h2>Access Token:</h2>
      <textarea rows="5" cols="70" onclick="this.select()" readonly>${access_token}</textarea>
      
      <h2>Refresh Token:</h2>
      <textarea rows="5" cols="70" onclick="this.select()" readonly>${refresh_token}</textarea>
      
      <h2>Token Information:</h2>
      <p>Expires in: ${expires_in} seconds (${Math.floor(expires_in / 60)} minutes)</p>
      
      <h2>What's Next?</h2>
      <p>You can use this access token to make requests to the Spotify API.</p>
      <p>When the token expires, use the refresh token to get a new access token.</p>
      
      <script>
        // Copy token to clipboard when clicked
        document.querySelectorAll('textarea').forEach(el => {
          el.addEventListener('click', function() {
            this.select();
            document.execCommand('copy');
            const original = this.style.border;
            this.style.border = '2px solid green';
            setTimeout(() => {
              this.style.border = original;
            }, 1000);
          });
        });
      </script>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        textarea { width: 100%; padding: 10px; margin-bottom: 20px; }
        h1, h2 { color: #1DB954; }
      </style>
    `);
    
    // Log success message
    console.log('\x1b[32m%s\x1b[0m', 'Authentication successful!');
    console.log('Access token:', access_token);
    console.log('Refresh token:', refresh_token);
    console.log(`Token expires in: ${expires_in} seconds (${Math.floor(expires_in / 60)} minutes)`);
    
  } catch (error) {
    console.error('Error exchanging code for token:', error.response?.data || error.message);
    res.send(`
      <h1>Token Exchange Error</h1>
      <p>${error.response?.data?.error_description || error.message}</p>
      <a href="/login">Try Again</a>
    `);
  }
});

// Home route with instructions
app.get('/', (req, res) => {
  res.send(`
    <h1>Spotify Authorization</h1>
    <p>Click the button below to authorize this application with your Spotify account.</p>
    <p>This will allow the application to access your Spotify data according to the requested scopes.</p>
    <a href="/login" style="display: inline-block; background-color: #1DB954; color: white; padding: 10px 20px; text-decoration: none; border-radius: 30px; font-weight: bold;">
      Authorize with Spotify
    </a>
    <style>
      body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
      h1 { color: #1DB954; }
    </style>
  `);
});

// Start the server
app.listen(PORT, () => {
  console.log(`
  ┌───────────────────────────────────────────────┐
  │                                               │
  │   Spotify Authorization Server                 │
  │                                               │
  │   Server running at http://localhost:${PORT}     │
  │                                               │
  │   1. Make sure you've set your Spotify        │
  │      credentials in the .env file             │
  │                                               │
  │   2. Opening browser automatically...         │
  │      (If it doesn't open, go to:              │
  │       http://localhost:${PORT})                  │
  │                                               │
  └───────────────────────────────────────────────┘
  `);
  
  // Open the browser automatically
  if (open) {
    open(`http://localhost:${PORT}`);
  } else {
    // If open module is not loaded yet, wait for it
    import('open').then(module => {
      open = module.default;
      open(`http://localhost:${PORT}`);
    }).catch(err => {
      console.error('Failed to open browser:', err);
      console.log(`Please navigate to http://localhost:${PORT} manually.`);
    });
  }
});

// Add a route to refresh tokens
app.get('/refresh', async (req, res) => {
  const { refresh_token } = req.query;
  
  if (!refresh_token) {
    return res.status(400).send('Refresh token is required');
  }
  
  try {
    // Exchange the refresh token for a new access token
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      params: {
        grant_type: 'refresh_token',
        refresh_token
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
      }
    });
    
    const { access_token, expires_in } = response.data;
    
    // Display the new access token
    res.send(`
      <h1>Token Refreshed!</h1>
      <h2>New Access Token:</h2>
      <textarea rows="5" cols="70" onclick="this.select()" readonly>${access_token}</textarea>
      
      <h2>Token Information:</h2>
      <p>Expires in: ${expires_in} seconds (${Math.floor(expires_in / 60)} minutes)</p>
      
      <script>
        // Copy token to clipboard when clicked
        document.querySelectorAll('textarea').forEach(el => {
          el.addEventListener('click', function() {
            this.select();
            document.execCommand('copy');
            const original = this.style.border;
            this.style.border = '2px solid green';
            setTimeout(() => {
              this.style.border = original;
            }, 1000);
          });
        });
      </script>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        textarea { width: 100%; padding: 10px; margin-bottom: 20px; }
        h1, h2 { color: #1DB954; }
      </style>
    `);
    
  } catch (error) {
    console.error('Error refreshing token:', error.response?.data || error.message);
    res.status(500).send(`
      <h1>Token Refresh Error</h1>
      <p>${error.response?.data?.error_description || error.message}</p>
    `);
  }
});
