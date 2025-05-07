#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');

// Check if refresh token was provided as command line argument
const refreshToken = process.argv[2];

if (!refreshToken) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: Refresh token is required!');
  console.log('Usage: node refresh-token.js YOUR_REFRESH_TOKEN');
  process.exit(1);
}

// Spotify API credentials from .env file
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// Verify credentials are set
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: Spotify credentials not found!');
  console.log('Please set your SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in the .env file.');
  console.log('You can get these from https://developer.spotify.com/dashboard');
  process.exit(1);
}

async function refreshAccessToken() {
  try {
    // Exchange the refresh token for a new access token
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      params: {
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
      }
    });
    
    const { access_token, expires_in } = response.data;
    
    console.log('\x1b[32m%s\x1b[0m', 'Token refreshed successfully!');
    console.log('\nAccess Token:');
    console.log('\x1b[33m%s\x1b[0m', access_token);
    console.log('\nExpires in:', expires_in, 'seconds (', Math.floor(expires_in / 60), 'minutes)');
    
    // Also output in JSON format for easy parsing by scripts
    console.log('\nJSON Output (for scripts):');
    console.log(JSON.stringify({
      access_token,
      expires_in,
      token_type: 'Bearer'
    }, null, 2));
    
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Error refreshing token:');
    if (error.response && error.response.data) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

refreshAccessToken();
