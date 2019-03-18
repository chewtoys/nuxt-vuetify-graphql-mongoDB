const program = require('commander')
const createModules = require('./utils').createModules

const list = require('./lib/list')
const order = require('./lib/order')
const create = require('./lib/create')

program
  .command('list')
  .alias('ls')
  .description('List coffe menu')
  .action(function() {
    list()
  })

program
  .command('order')
  .alias('o')
  .description('Order a coffee')
  .action(function() {
    order()
  })

program
  .command('create')
  .alias('c')
  .description('모듈 생성')
  .action(function() {
    create(createModules)
  })

program.parse(process.argv)
