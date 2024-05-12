/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => knex.schema.createTable(require('../tables/chain-config').TABLE_NAME, (table) => {
  table.increments('id').primary();
  table.string('chain_name').notNullable();
  table.string('public_chain_identifier'); // Chain Id for ethereum 
  table.string('transaction_type'); // EVM, BTC
  table.enum('key_algo', Object.keys(require('../../enums/keys').KEY_ALGO)).notNullable();
  table.integer('seed_length').notNullable();
  table.timestamp('create_date', { useTz: false }).defaultTo(knex.fn.now());
  table.timestamp('update_date', { useTz: false }).defaultTo(knex.fn.now());
});

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => knex.schema.dropTable(require('../tables/chain-config').TABLE_NAME);
