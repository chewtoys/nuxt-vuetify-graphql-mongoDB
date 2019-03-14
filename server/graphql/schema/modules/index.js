// const glob = require('glob')
const modules = { typeDefs: [], resolvers: [] }
// export default async function modulesd() {
//   await glob('server/graphql/schema/modules/*.js', null, function(er, files) {
//     // files is an array of filenames.
//     // If the `nonull` option is set, and nothing
//     // was found, then files is ["**/*.js"]
//     // er is an error object or null.
//     console.log('files :', files)
//     files.forEach(file => {
//       const module = require('./' +
//         file.replace('server/graphql/schema/modules/', ''))
//       console.log('module :', module)
//       modules.typeDefs.push(module.typeDef)
//       modules.resolvers.push(module.resolvers)
//     })
//   })()
//   return modules
// }

const files = requestContext('.', false, /\.js$/)
files.keys().forEach(key => {
  if (key === 'index.js') return
  modules.typeDefs.push(files(key).typeDef)
  modules.resolvers.push(files(key).resolvers)
})

function requestContext(directory, recursive, regExp) {
  const dir = require('node-dir')
  const path = require('path')

  // Assume absolute path by default
  let basepath = directory

  if (directory[0] === '.') {
    // Relative path
    basepath = path.join(__dirname, directory)
  } else if (!path.isAbsolute(directory)) {
    // Module path
    basepath = require.resolve(directory)
  }
  const keys = dir
    .files(basepath, { sync: true, recursive: recursive || false })
    .filter(function(file) {
      return file.match(regExp || /\.(json|js)$/)
    })
    .map(function(file) {
      return path.join('.', file.slice(basepath.length + 0))
    })

  const context = function(key) {
    return require(context.resolve(key))
  }

  context.resolve = function(key) {
    return path.join(basepath, key)
  }

  context.keys = function() {
    return keys
  }

  return context
}

export default modules
