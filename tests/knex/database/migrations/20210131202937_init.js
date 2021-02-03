exports.up = function (knex) {
  return knex.schema.createTable('users', function (table) {
    table.increments('id')
    table.text('email').notNullable()
    table.text('name').notNullable()
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('users')
}
