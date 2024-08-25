/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const { TABLE_NAME } = require('../tables/chain-config');

exports.up = async (knex) => {
  await knex.schema.createTable(TABLE_NAME, (table) => {
    table.increments('id').primary();
    table.string('chain_name').notNullable();
    table.string('public_chain_identifier'); // Chain Id for ethereum
    table.string('transaction_type'); // EVM, BTC
    table.enum('key_algo', Object.keys(require('../../enums/keys').KEY_ALGO)).notNullable();
    table.integer('seed_length').notNullable();
    table.timestamp('create_date', { useTz: false }).defaultTo(knex.fn.now());
    table.timestamp('update_date', { useTz: false }).defaultTo(knex.fn.now());
  });

  await knex(TABLE_NAME).insert([
    {
      id: 4,
      chain_name: 'ethereum_mainet',
      public_chain_identifier: '1',
      key_algo: 'SECP256K1',
      create_date: '2024-04-30 06:17:54.517871',
      update_date: '2024-04-30 06:17:54.517871',
      seed_length: 64,
      transaction_type: 'EVM',
    },
    {
      id: 1,
      chain_name: 'BTC',
      public_chain_identifier: '0',
      key_algo: 'SECP256K1',
      create_date: '2024-04-28 17:12:44.591555',
      update_date: '2024-04-28 17:12:44.591555',
      seed_length: 64,
      transaction_type: 'BTC',
    },
    {
      id: 6,
      chain_name: 'goerli',
      public_chain_identifier: '5',
      key_algo: 'SECP256K1',
      create_date: '2024-05-12 07:24:57.730059',
      update_date: '2024-05-12 07:24:57.730059',
      seed_length: 64,
      transaction_type: 'EVM',
    },
    {
      id: 5,
      chain_name: 'sepolia',
      public_chain_identifier: '11155111',
      key_algo: 'SECP256K1',
      create_date: '2024-05-12 07:13:28.267971',
      update_date: '2024-05-12 07:13:28.267971',
      seed_length: 64,
      transaction_type: 'EVM',
    },
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => knex.schema.dropTable(require('../tables/chain-config').TABLE_NAME);
