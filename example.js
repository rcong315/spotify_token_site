#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');

// Check if access token was provided as command line argument
const accessToken = process.argv[2];

if (!accessToken) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: Access token is required!');
  console.log('Usage: node example.js YOUR_ACCESS_TOKEN');
  console.log('You can get an access token by running the authorization server (npm start)');
  process.exit(1);
}

// Example API endpoints to demonstrate
const endpoints = [
  {
    name: 'Your Profile',
    url: 'https://api.spotify.com/v1/me',
    description: 'Get detailed profile information about the current user'
  },
  {
    name: 'Your Top Tracks',
    url: 'https://api.spotify.com/v1/me/top/tracks?limit=5',
    description: 'Get your top 5 tracks'
  },
  {
    name: 'New Releases',
    url: 'https://api.spotify.com/v1/browse/new-releases?limit=5',
    description: 'Get the newest releases on Spotify'
  },
  {
    name: 'Featured Playlists',
    url: 'https://api.spotify.com/v1/browse/featured-playlists?limit=5',
    description: 'Get featured playlists on Spotify'
  }
];

// Function to make API request
async function makeApiRequest(endpoint) {
  console.log('\n\x1b[36m%s\x1b[0m', `Fetching ${endpoint.name}...`);
  console.log(endpoint.description);
  console.log('API URL:', endpoint.url);
  
  try {
    const response = await axios({
      method: 'get',
      url: endpoint.url,
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('\x1b[32m%s\x1b[0m', 'Success!');
    
    // Format and display the response based on the endpoint
    if (endpoint.url.includes('/me') && !endpoint.url.includes('/top/')) {
      // User profile
      const { display_name, email, country, product, followers } = response.data;
      console.log('\nProfile Information:');
      console.log('- Display Name:', display_name);
      if (email) console.log('- Email:', email);
      if (country) console.log('- Country:', country);
      if (product) console.log('- Subscription:', product);
      if (followers) console.log('- Followers:', followers.total);
    } 
    else if (endpoint.url.includes('/top/tracks')) {
      // Top tracks
      const tracks = response.data.items;
      console.log('\nYour Top Tracks:');
      tracks.forEach((track, index) => {
        console.log(`${index + 1}. "${track.name}" by ${track.artists.map(a => a.name).join(', ')}`);
      });
    }
    else if (endpoint.url.includes('/new-releases')) {
      // New releases
      const albums = response.data.albums.items;
      console.log('\nNew Releases:');
      albums.forEach((album, index) => {
        console.log(`${index + 1}. "${album.name}" by ${album.artists.map(a => a.name).join(', ')}`);
      });
    }
    else if (endpoint.url.includes('/featured-playlists')) {
      // Featured playlists
      const playlists = response.data.playlists.items;
      console.log('\nFeatured Playlists:');
      playlists.forEach((playlist, index) => {
        console.log(`${index + 1}. "${playlist.name}" - ${playlist.description}`);
      });
    }
    
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Error making API request:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Status: ${error.response.status}`);
      console.error('Error details:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('\nYour access token may have expired. Try refreshing it with:');
        console.log('node refresh-token.js YOUR_REFRESH_TOKEN');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from the server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
  }
}

// Main function to run all examples
async function runExamples() {
  console.log('\x1b[35m%s\x1b[0m', '=== Spotify API Examples ===');
  console.log('Using access token:', accessToken.substring(0, 10) + '...');
  
  // Run each example sequentially
  for (const endpoint of endpoints) {
    await makeApiRequest(endpoint);
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n\x1b[35m%s\x1b[0m', '=== All examples completed ===');
}

runExamples().catch(error => {
  console.error('Unhandled error:', error);
});
