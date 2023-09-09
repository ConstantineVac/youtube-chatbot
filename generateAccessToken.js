const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const readline = require('readline');
const express = require('express');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file



const app = express();
const port = 3000; // Choose the port you want to use

// Your client ID and client secret
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

// Initialize OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    `http://localhost:${port}/auth/callback`
  );

// Create a readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Callback route
app.get('/auth/callback', async (req, res) => {
    const code = req.query.code;
  
    try {
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
  
      // You now have the access token
      console.log('Access token:', tokens.access_token);
      res.send('Authorization complete. You can close this page.');
  
      // You can use the access token for your YouTube chat bot
      // Insert your bot logic here
    } catch (error) {
      console.error('Error obtaining access token:', error);
      res.status(500).send('Error obtaining access token.');
    }
  });



// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Function to initiate the OAuth2 authorization
function startAuthorization() {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/youtube.force-ssl'],
  });

  console.log('Authorize this app by visiting this URL:', authUrl);
}
  
  // Call the function to initiate the OAuth2 authorization
  startAuthorization();
