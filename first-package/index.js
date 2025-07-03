const value = 42

function sum(a, b) {
  return a + b
}

const axios = require('axios')

class OpenMovieDatabase {
  constructor(apiKey) {
    this.apiKey = apiKey
  }

  async get(parameters) {
    try {
      const { data } = await axios({
        method: 'GET',
        url: 'http://www.omdbapi.com',
        params: { apikey: this.apiKey, ...parameters },
      })
      return data
    } catch (error) {
      console.log(error.response)
      throw error.response.data
    }
  }
}   

module.exports = {
  value,
  sum,
  OpenMovieDatabase
}