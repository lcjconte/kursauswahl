require('dotenv').config();
const { Pool, Client } = require('pg')
const connectionString = process.env.DATABASE_URL
console.log(connectionString);

const pool = new Pool({
  connectionString,
  ssl: {rejectUnauthorized: false}
})

module.exports = pool