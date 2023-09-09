const express = require('express');
const { google } = require('googleapis');
const readline = require('readline');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file

const fs = require('fs');       // Import the 'fs' module for file operations
const os = require('os');
const { auth } = require('googleapis/build/src/apis/abusiveexperiencereport');

const songFilePath = './song.txt'; // Specify the path to your text file  (Windows)

// const songFilePath = '/root/Documents/my_metadata.txt'; // Specify the path to your text file   (Linux Format)

// // Expand the tilde to the user's home directory
// const expandedFilePath = songFilePath.replace(/^~/, os.homedir());

const app = express();
const port = 3000; // Choose the port you want to use

// Set your OAuth2 credentials
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

// Initialize OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  `http://localhost:${port}/auth/callback`
);

// Set your access token here
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
oAuth2Client.setCredentials({ access_token: ACCESS_TOKEN });

// Function to send a message to the livestream chat
async function sendMessage(message) {
  try {
    const youtube = google.youtube({
      version: 'v3',
      auth: oAuth2Client,
    });

    const response = await youtube.liveChatMessages.insert({
      part: 'snippet',
      resource: {
        snippet: {
          liveChatId: process.env.LIVE_CHAT_ID, // Replace with your liveChatId
          type: 'textMessageEvent',
          textMessageDetails: {
            messageText: message,
          },
        },
      },
    });

    console.log('Message sent:', message);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}


// Pokemon Game
let pokemonList;
const gameState = {
    currentGameInProgress: false,
    currentPokemonName: null,
    currentClueIndex: 0,            // Initialize currentClueIndex to 0
};


// Function to handle incoming messages
function handleChatMessage(message, auth, authorDisplayName) {
  if (message === '!hello') {
    sendMessage(`Hi, @${authorDisplayName} 👋🏻`, auth);
  } else if (message === '!social') {
      const socialLinks = [
        {
            platform: 'LinkTree',
            link: 'https://linktree.com/constantinevac',
        },
        {
            platform: 'Twitch',
            link: 'https://www.twitch.tv/constantinevac98',
        },
        // Add more social platforms and links as needed
      ];
      
        // Send the messages one by one with line breaks
        socialLinks.forEach((linkData) => {
          const formattedMessage = `📲 Here's is Constantines's ${linkData.platform} profile: ${linkData.link}`;
          sendMessage(formattedMessage, auth);
        });
  } else if (message === '!song'){
      // Check if !song has already been processed in the current interval
      // Read the content of the text file
      fs.readFile(songFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading the song file:', err);
          sendMessage('Sorry, there was an error reading the song file. 🥺', auth);
          return;
        }

        // Split the file content into lines
        const lines = data.split('\n').map((line) => line.trim());

        // Check if there are at least two lines of content (name and album)
        if (lines.length >= 2) {
          const name = lines[0];
          const album = lines[2]; // Adjust the index to skip the empty line
          sendMessage(`🎶Currently Playing: ${name},\n💿Album: ${album}!`, auth);
        } else {
          sendMessage('Sorry, the song information is incomplete in the file.🥺', auth);
        }
      });
  } else if (message === '!startgame') {
      // Start the game only if no game is currently in progress
      if (!gameState.currentGameInProgress) {
        gameState.currentGameInProgress = true; // Set game state to "in progress"
        startGame(auth);
      } else {
        // Inform the user that a game is already in progress
        sendMessage('⛔A game is already in progress. Please wait for it to finish.⛔', auth);
        return;
      }
  } else if (message.toLowerCase().startsWith('!guess')) {
      // Check if the message is a guess and a game is in progress
      if (gameState.currentPokemonName && gameState.currentGameInProgress) {
        // Extract the Pokémon name from the message
        const guess = message.toLowerCase().replace('!guess', '').trim();
        checkGuess(guess, auth, authorDisplayName, gameState); 
      } else if (!gameState.currentGameInProgress) {
        // Inform the user that they can't guess because no game is in progress
        sendMessage('There is currently no game in progress. Type !startgame to start a new game🕹️.', auth);
      }
  }else if (message === '!points'){
    displayTopUsers(auth);
  } else if (message === '!commands') {
    sendMessage('Bot Commands: !song, !startgame, !guess, !points, !social', auth);
  } else {
    return;
  } 
}


// Function to listen to chat messages
async function listenToChat() {
  try {
    const youtube = google.youtube({
      version: 'v3',
      auth: oAuth2Client,
    });

    const response = await youtube.liveChatMessages.list({
      liveChatId: process.env.LIVE_CHAT_ID, // Replace with your liveChatId
      part: 'snippet,authorDetails',
    });

    const messages = response.data.items;
    
    if (messages && messages.length > 0) {
      // Get the most recent chat message
      const latestMessage = messages[messages.length - 1].snippet.textMessageDetails.messageText;
      const authorDetails = messages[messages.length - 1].authorDetails;
      //console.log(authorDetails);
      const authorDisplayName = authorDetails.displayName;
      //console.log(authorDisplayName);

      // Check if the message starts with the !song command
      if (latestMessage.startsWith('!song')) {
        // Handle the !song command here
        handleChatMessage(latestMessage);
      }
      // Check if the message starts with the !hello command
      if (latestMessage.startsWith('!hello')) {
        // Handle the !hello command here
        handleChatMessage(latestMessage, auth, authorDisplayName);
      }

      // Check if the message starts with the !social command
      if (latestMessage.startsWith('!social')) {
        // Handle the !social command here
        handleChatMessage(latestMessage, auth, authorDisplayName);
      }

      // Check if the message starts with the !startgame command
      if (latestMessage.startsWith('!startgame')) {
        // Handle the !startgame command here
        handleChatMessage(latestMessage, auth, authorDisplayName);
      }

      // Check if the message starts with the !guess command
      if (latestMessage.startsWith('!guess')) {
        // Handle the !guess command here
        handleChatMessage(latestMessage, auth, authorDisplayName);
      }

      // Check if the message starts with the !guess command
      if (latestMessage.startsWith('!points')) {
        // Handle the !points command here
        handleChatMessage(latestMessage, auth);
      }

      // Check if the message starts with the !commands command
      if (latestMessage.startsWith('!commands')) {
        // Handle the !commands command here
        handleChatMessage(latestMessage, auth);
      }
    }
  } catch (error) {
    console.error('Error fetching chat messages:', error);
  }
}

//let userScores = {}; // Initialize an empty object to store user scores

// Read the user scores from a JSON file (e.g., 'userScores.json')
fs.readFile('./databank/userScores.json', 'utf8', (err, data) => {
  if (!err) {
      userScores = JSON.parse(data);
  }
});

// Read the JSON file and set up the game
fs.readFile('./databank/pokemonclues.json', 'utf8', (err, data) => {
  if (err) {
      console.error('Error reading JSON file:', err);
      return;
  }

  // Parse the JSON content
  const pokemonData = JSON.parse(data);

  // Access the Pokémon list
  pokemonList = pokemonData.pokemon;
  //console.log(pokemonList);
});



// Start game
function startGame(auth) {
// Reset game state
gameState.currentPokemonName = getRandomPokemon().name;
gameState.currentClueIndex = 0; // Initialize currentClueIndex to 0

// Provide the first clue
const initialClue = getClue(gameState.currentPokemonName, gameState.currentClueIndex);
sendMessage( `🕹️ Let's play Guess Who's the Pokémon! Here's your 🔍first clue: ${initialClue}`, auth);
}

function getRandomPokemon() {
const randomIndex = Math.floor(Math.random() * pokemonList.length);
return pokemonList[randomIndex]; // Return the full Pokemon object
}

function getClue(pokemonName, currentIndex) {
// Find the Pokémon in the list by name
const foundPokemon = pokemonList.find((p) => p.name === pokemonName);
console.log(foundPokemon)
// console.log(currentIndex)
// console.log(foundPokemon.clues)
if (foundPokemon) {
    // Check if the current clue index is within the bounds of the clues array
    if (gameState.currentClueIndex >= 0 && gameState.currentClueIndex < foundPokemon.clues.length - 1) {
        return foundPokemon.clues[gameState.currentClueIndex];
    } else if (gameState.currentClueIndex == 1) {
        return foundPokemon.clues[gameState.currentClueIndex];
    } else {
        return "No more clues remaining.🥺"
    }
} else {
    return "Pokémon not found in the list.🤐";
}
}


function checkGuess(guess, auth, authorDisplayName, gameState) {
  const { currentPokemonName, currentClueIndex } = gameState;
  const foundPokemon = pokemonList.find((p) => p.name === currentPokemonName);
  const username = authorDisplayName;

  // Load existing user scores from the JSON file
  let userScores = {};

  try {
      const userScoresData = fs.readFileSync('userScores.json', 'utf8');
      userScores = JSON.parse(userScoresData);
  } catch (err) {
      console.error('Error reading user scores:', err);
  }

  if (guess.toLowerCase() === currentPokemonName.toLowerCase()) {
      // Correct guess
      if (!userScores[username]) {
          userScores[username] = 0; // Initialize score if not exists
      }

      // Award points based on the number of tries
      if (currentClueIndex === 0) {
          userScores[username] += 5;
      } else if (currentClueIndex === 1) {
          userScores[username] += 2;
      }

      // Inform the user of their score
      sendMessage(`🎊Congratulations, @${username}! You guessed it and earned ${currentClueIndex === 0 ? 5 : 2} points.🎊`, auth);
      // End the game
      gameState.currentPokemonName = null;
      gameState.currentGameInProgress = false;
  } else if (currentClueIndex < foundPokemon.clues.length - 1) {
      // Incorrect guess, but more clues are available
      gameState.currentClueIndex++;
      const nextClue = getClue(currentPokemonName, gameState.currentClueIndex);
      gameState.currentGameInProgress = true;
      sendMessage(`Sorry, @${username}, that's not correct🥺. Keep guessing! 🔍Next clue: ${nextClue}`, auth);
  } else {
      // Incorrect guess and no more clues available
      if (userScores[username] === undefined) {
          userScores[username] = 0; // Initialize score if not exists
      }

      if (userScores[username] > 0) {
          userScores[username] -= 1; // Deduct 1 point unless the user's score is 0
      }
      gameState.currentGameInProgress = false;
      // Inform the user of their score
      sendMessage(`Sorry, @${username}, that's not correct. You lost 1 point... 🥺`, auth);
      sendMessage(`⭕Game over! The correct answer was ${currentPokemonName}.`, auth);
  }

  // Save the updated scores back to the JSON file
  fs.writeFile('./databank/userScores.json', JSON.stringify(userScores), 'utf8', (err) => {
      if (err) {
          console.error('Error saving user scores:', err);
      }
  });
}


// Game Leaderboard
// Function to display the top 10 users with the most points
function displayTopUsers(auth) {
  // Read the user scores JSON file
  fs.readFile('./databank/userScores.json', 'utf8', (err, data) => {
      if (err) {
          console.error('Error reading user scores:', err);
          return;
      }

      try {
          const userScores = JSON.parse(data);

          // Sort users by points in descending order
          const sortedUsers = Object.entries(userScores).sort((a, b) => b[1] - a[1]);

          // Take the top 10 users or fewer if there are fewer than 10 users
          const topUsers = sortedUsers.slice(0, 10);

          // Generate a message with the top users
          const topUsersMessage = `Top 10 Users:\n${topUsers.map(([username, points], index) => `${index + 1}. @${username} (${points} points)`).join('\n')}`;

          // Send the message to the channel
          sendMessage(topUsersMessage, auth);
      } catch (parseError) {
          console.error('Error parsing user scores JSON:', parseError);
      }
  });
}



// Start listening to chat messages
setInterval(listenToChat, 5000); // Polling every 5 seconds


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});















