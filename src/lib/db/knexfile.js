require('dotenv').config(); // Load environment variables
const knex = require('knex')({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres', // Connect to 'postgres' to create other databases
  },
});

const logger = require('../logger/config');

async function createDatabase() {
  try {
    // Check if the database exists
    const databaseExists = await knex.raw(
      `SELECT 1 FROM pg_database WHERE datname = ?`,
      [process.env.DB_DATABASE]
    );

    if (databaseExists.rows.length === 0) {
      // Create the database if it doesn't exist
      await knex.raw(`CREATE DATABASE ${process.env.DB_DATABASE}`);
      logger.info(`Database '${process.env.DB_DATABASE}' created successfully`);
    } else {
      logger.info(`Database '${process.env.DB_DATABASE}' already exists`);
    }
  } catch (error) {
    logger.error('Error creating database:', error);
  } finally {
    // Destroy the knex instance after the operation
    await knex.destroy();
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
      database: process.env.DB_DATABASE || 'postgres', // Default to 'postgres' if DB_DATABASE is not set
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: `${__dirname}/migrations`,
      tableName: 'knex_migrations',
    },
    async afterCreate(conn, done) {
      await conn.query('SET search_path TO public'); // Ensure the default schema is set to 'public'
      done();
    },
  },
  createDatabase,
};