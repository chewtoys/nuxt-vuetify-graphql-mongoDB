const inquirer = require('inquirer')
const colors = require('colors')
const pad = require('pad')

const questions = [
  {
    type: 'confirm',
    name: 'store',
    message: 'store 관련 파일을 생성하겠습니까?',
    default: true
  },
  {
    type: 'confirm',
    name: 'graphql',
    message: 'graphql 관련 파일을 생성하겠습니까?',
    default: true
  },
  {
    type: 'confirm',
    name: 'frontend',
    message: 'frontend 관련 파일을 생성하겠습니까?',
    default: true
  },
  {
    type: 'confirm',
    name: 'admin',
    message: 'admin 관련 파일을 생성하겠습니까?',
    default: true
  },
  {
    type: 'input',
    name: 'module',
    message: '모듈명을 입력하세요.(중복불가)' + colors.grey('(ex: post)')
  }
]

module.exports = function(writer) {
  inquirer.prompt(questions).then(function(answers) {
    console.log('모듈 생성')
    console.log('------------------------')

    console.log(
      pad(colors.grey('Store Files: '), 30),
      answers.store ? 'Yes' : 'No'
    )
    console.log(
      pad(colors.grey('GraphQL Files: '), 30),
      answers.graphql ? 'Yes' : 'No'
    )
    console.log(
      pad(colors.grey('Frontend Files: '), 30),
      answers.frontend ? 'Yes' : 'No'
    )
    console.log(
      pad(colors.grey('Admin Files: '), 30),
      answers.admin ? 'Yes' : 'No'
    )
    console.log(
      pad(colors.grey('Module Name: '), 30),
      answers.module.toLowerCase()
    )
    writer(answers.module.toLowerCase())
  })
}
