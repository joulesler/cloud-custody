/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const KEY_ENUM  = require('../../enums/keys')

exports.up = (knex) => knex.schema.createTable('chain_key_map', (table) => {
  table.increments('id').primary();
  table.integer('chain_id').unsigned().references('id').inTable('chain_config')
    .onDelete('CASCADE');
  table.integer('master_key_id').unsigned().references('id').inTable('master_seed')
    .onDelete('CASCADE');
  table.enum('chainType', Object.keys(KEY_ENUM.KEY_REFERENCE_TYPE))
  table.timestamp('create_date', { useTz: false }).defaultTo(knex.fn.now());
  table.timestamp('update_date', { useTz: false }).defaultTo(knex.fn.now());
});

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => knex.schema.dropTable('chain_key_map');
