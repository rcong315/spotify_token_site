# Spotify Authorization Token Script

This script helps you authorize your application with Spotify and obtain an access token for making API requests.

## Prerequisites

- Node.js installed on your computer
- A Spotify account
- A registered Spotify application (see setup instructions below)

## Setup Instructions

### 1. Register a Spotify Application

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Log in with your Spotify account
3. Click "Create an App"
4. Fill in the app name and description
5. Click "Create"
6. Once created, you'll see your Client ID on the dashboard
7. Click "Show Client Secret" to reveal your Client Secret
8. **IMPORTANT:** Click "Edit Settings" and add `http://localhost:8888/callback` to the Redirect URIs section
   - This step is crucial! The exact URI must match what's in your .env file
   - Make sure there are no trailing spaces or extra characters
9. Save the settings

### 2. Configure Environment Variables

1. Open the `.env` file in this project
2. Replace `your_client_id_here` with your Spotify Client ID
3. Replace `your_client_secret_here` with your Spotify Client Secret
4. Save the file

Example:
```
SPOTIFY_CLIENT_ID=abc123def456ghi789jkl
SPOTIFY_CLIENT_SECRET=mno123pqr456stu789vwx
REDIRECT_URI=http://localhost:8888/callback
PORT=8888
```

### 3. Install Dependencies

Run the following command in the project directory:

```bash
npm install
```

## Usage

1. Start the authorization server:

```bash
npm start
```

2. Your browser will automatically open to `http://localhost:8888`
3. Click the "Authorize with Spotify" button
4. Log in with your Spotify account if prompted
5. Approve the permissions requested by the application
6. You'll be redirected back to the application where you'll see your access token and refresh token

## Token Information

- **Access Token**: Use this token to make requests to the Spotify API. It expires after 1 hour.
- **Refresh Token**: Use this token to get a new access token when the current one expires.

## Refreshing Your Token

You have two options to refresh your token when it expires:

### Option 1: Using the Web Interface

Visit the following URL in your browser:

```
http://localhost:8888/refresh?refresh_token=YOUR_REFRESH_TOKEN
```

Replace `YOUR_REFRESH_TOKEN` with the refresh token you received during authorization.

### Option 2: Using the Command Line

Use the included refresh-token.js script:

```bash
node refresh-token.js YOUR_REFRESH_TOKEN
```

This will output a new access token that you can use in your API requests. This option is useful for automated scripts or when you don't want to use the web interface.

## Making API Requests

Once you have your access token, you can make requests to the Spotify API.

### Using the Example Script

This project includes an example script that demonstrates how to use your access token with the Spotify API:

```bash
node example.js YOUR_ACCESS_TOKEN
```

This script will:
- Fetch your Spotify profile information
- Get your top tracks
- Show new releases on Spotify
- Display featured playlists

It's a great way to verify that your token is working correctly and to see how to use the Spotify API.

### Using curl

You can also make API requests directly using curl:

```bash
curl -X GET "https://api.spotify.com/v1/me" -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Replace `YOUR_ACCESS_TOKEN` with the access token you received.

## Scopes

This application requests the following permissions (scopes):

### User Data
- `user-read-private`: Read access to user's subscription details
- `user-read-email`: Read access to user's email address

### Playlists
- `playlist-read-private`: Read access to user's private playlists
- `playlist-read-collaborative`: Read access to user's collaborative playlists
- `playlist-modify-public`: Create and edit public playlists
- `playlist-modify-private`: Create and edit private playlists

### Library
- `user-library-read`: Read access to user's saved tracks and albums
- `user-library-modify`: Modify user's saved tracks and albums

### Listening History
- `user-top-read`: Read access to user's top artists and tracks
- `user-read-recently-played`: Read access to user's recently played tracks

### Playback
- `user-read-playback-state`: Read access to user's player state
- `user-modify-playback-state`: Control playback on user's devices
- `user-read-currently-playing`: Read access to user's currently playing track

### Follow
- `user-follow-read`: Read access to who user follows
- `user-follow-modify`: Modify who user follows

You can modify the scopes in the `index.js` file if you need different permissions.

## Troubleshooting

- **Invalid Client Error**: Make sure your Client ID and Client Secret in the `.env` file are correct.
- **Invalid Redirect URI Error**: Ensure you've added `http://localhost:8888/callback` to your app's Redirect URIs in the Spotify Developer Dashboard.
- **Token Exchange Error**: Check that your Client Secret is correct and that your system time is accurate.
