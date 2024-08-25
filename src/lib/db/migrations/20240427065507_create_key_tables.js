/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const TABLE_NAME = require('../tables/child-keys').TABLE_NAME;
exports.up = async (knex) => {
  await knex.schema.createTable(TABLE_NAME, (table) => {
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
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => knex.schema.dropTable(require('../tables/child-keys').TABLE_NAME);
