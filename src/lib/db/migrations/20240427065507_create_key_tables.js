/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const TABLE_NAME = require('../tables/child-keys').TABLE_NAME;
exports.up = async (knex) => {
  knex.schema.createTable(TABLE_NAME, (table) => {
    table.increments('id').primary();
    table.boolean('is_child').notNullable().defaultTo(false);
    table.string('derivation_path');
    table.integer('master_seed_id').unsigned().references('id').inTable('master_seed')
      .nullable();
    table.string('public_key').notNullable();
    table.string('address');
    table.timestamp('create_date', { useTz: false }).defaultTo(knex.fn.now());
    table.timestamp('update_date', { useTz: false }).defaultTo(knex.fn.now());
  });

  knex(TABLE_NAME).insert([
    {
      id: 4,
      chain_name: 'ethereum_mainet',
      public_chain_identifier: '1',
      key_algo: 'SECP256K1',
      create_date: '2024-04-30 06:17:54.517871',
      update_date: '2024-04-30 06:17:54.517871',
      seed_length: 64,
      transaction_type: 'EVM'
    },
    {
      id: 1,
      chain_name: 'BTC',
      public_chain_identifier: '0',
      key_algo: 'SECP256K1',
      create_date: '2024-04-28 17:12:44.591555',
      update_date: '2024-04-28 17:12:44.591555',
      seed_length: 64,
      transaction_type: 'BTC'
    },
    {
      id: 6,
      chain_name: 'goerli',
      public_chain_identifier: '5',
      key_algo: 'SECP256K1',
      create_date: '2024-05-12 07:24:57.730059',
      update_date: '2024-05-12 07:24:57.730059',
      seed_length: 64,
      transaction_type: 'EVM'
    },
    {
      id: 5,
      chain_name: 'sepolia',
      public_chain_identifier: '11155111',
      key_algo: 'SECP256K1',
      create_date: '2024-05-12 07:13:28.267971',
      update_date: '2024-05-12 07:13:28.267971',
      seed_length: 64,
      transaction_type: 'EVM'
    }
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => knex.schema.dropTable(require('../tables/child-keys').TABLE_NAME);
