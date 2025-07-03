// Load environment variables from .env file
require('dotenv').config({ path: __dirname + '/.env' })

const {value, sum, OpenMovieDatabase} = require('@aryankeluskar/first-package')

async function testMovieAPI() {
  console.log(value);

  console.log(sum(12, 18));

  console.log('API Key:', process.env.movieKey);
  
  if (!process.env.movieKey) {
    console.log('No key found');
    return;
  }

  const open = new OpenMovieDatabase(process.env.movieKey)

  try {
    // Fix: Pass parameters as an object with 't' for title
    const movieData = await open.get({ t: "The Imitation Game" });
    console.log('Movie data:', movieData);
  } catch (error) {
    console.error('Error fetching movie data:', error);
  }
}

// Run the async function
testMovieAPI();
