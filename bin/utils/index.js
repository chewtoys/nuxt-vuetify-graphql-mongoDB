const fs = require('fs')
const path = require('path')
const ejs = require('ejs')

const fileExists = path => fs.existsSync(path)

const dirs = [
  {
    type: 'store',
    srcDir: 'bin/templates/store',
    distDir: 'store/modules/',
    srfiles: ['js']
  }
  // graphql: {
  //   dir: 'server/graphql/modules/',
  //   files: ['js']
  // },
  // frontend: {
  //   dir: 'pages/',
  //   files: ['js']
  // },
  // admin: {
  //   dir: 'pages/admin/',
  //   files: ['js']
  // }
]

//  Directories
// 'store/modules/'
// 'server/graphql/modules/'
// 'pages/'
// 'pages/admin/'

// Files
// store/modules/Post.js/
// server/graphql/modules/Post.js
const ejsHelpers = require('./ejs-helpers.js')
const basepath = __dirname.split('bin')[0]

const writeToPath = (srcFile, distFile) => moduleName => {
  const str = fs.readFileSync(srcFile, 'utf8')

  const content = ejs.render(str, {
    file: { name: moduleName },
    _: ejsHelpers
  })
  fs.writeFile(distFile, content, err => {
    if (err) throw err
    console.log('Created file: ', distFile)
    console.log('')
    return true
  })
}

function createModules(moduleName, moduleTypes) {
  // const storeFile = path.join(basepath, moduleName + '.js')
  // const graphqlFile = path.join(basepath, moduleName + '.js')

  // const files = [storeFile, graphqlFile]
  dirs.forEach(item => {
    const srcPath = path.join(basepath, item.srcDir)
    const distPath = path.join(basepath, item.distDir)
    const srcFile = path.join(srcPath, 'store.ejs')
    const distFile = path.join(distPath, moduleName + '.js')
    if (fileExists(distFile)) {
      console.log('파일이 존재합니다. : ', distFile)
    } else {
      console.log('파일이 존재하지 않습니다. srcFile : ', srcFile)
      console.log('파일이 존재하지 않습니다. distFile : ', distFile)
      writeToPath(srcFile, distFile)(moduleName)
    }
  })
}

module.exports = {
  createModules: createModules
}
