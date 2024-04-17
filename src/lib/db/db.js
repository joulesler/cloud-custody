const knex = require('knex');
const knexConfig = require('./knexfile');

// Create a connection pool
const db = knex(knexConfig.development);

async function migrate() {
  // Run migrations
  await db.migrate.latest();
}

module.exports = {
  db,
  migrate,
};
