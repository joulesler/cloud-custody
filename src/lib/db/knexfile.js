require('dotenv').config(); // Load environment variables

const knex = require('knex')({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
  },
});

const logger = require('../logger/config');

async function createDatabase() {
  try {
    // Use public unless otherwise specified
    // await knex.raw(`CREATE DATABASE IF NOT EXISTS${process.env.DB_DATABASE}`);
    logger.info('Database created successfully');
  } catch (error) {
    logger.error('Error creating database:', error);
  } finally {
    knex.destroy();
  }
}

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: `${__dirname}/migrations`,
      tableName: 'knex_migrations',
    },
  },
  createDatabase,
};

createDatabase();
