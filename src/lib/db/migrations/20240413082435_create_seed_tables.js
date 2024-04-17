/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => knex.schema.createTable('master_seed', (table) => {
  table.increments('id').primary();
  table.string('encrypted_seed').notNullable();
  table.string('encoding_key_label').notNullable();
  table.string('encoding_key_algo').notNullable();
  table.string('x_pub_key').notNullable();
  table.string('chain_code').notNullable();
  table.string('key_type').notNullable();
  table.timestamp('create_date', { useTz: false }).defaultTo(knex.fn.now());
  table.timestamp('update_date', { useTz: false }).defaultTo(knex.fn.now());
});

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => knex.schema.dropTable('master_seed');
