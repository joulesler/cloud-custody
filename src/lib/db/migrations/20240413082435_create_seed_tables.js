/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => knex.schema.createTable(require('../tables/master-seed').TABLE_NAME, (table) => {
  table.increments('id').primary();
  table.string('key_store_type').notNullable(); // Mapped from lib/enums/keys.SUPPORTED_KMS
  table.string('encrypted_seed', 1024).notNullable();
  table.string('encrypting_key_label').notNullable();
  table.string('encrypting_key_algo').notNullable();
  table.string('x_pub_key').notNullable();
  table.string('chain_code').notNullable();
  table.enum('key_type', Object.values(require('../../enums/keys').KEY_REFERENCE_TYPE)).notNullable();
  table.timestamp('create_date', { useTz: false }).defaultTo(knex.fn.now());
  table.timestamp('update_date', { useTz: false }).defaultTo(knex.fn.now());
});

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => knex.schema.dropTable(require('../tables/master-seed').TABLE_NAME);
