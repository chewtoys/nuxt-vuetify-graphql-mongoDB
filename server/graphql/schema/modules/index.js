const getSchemes = names => {
  const files = requestContext('.', false, /\.js$/)
  const schemes = { typeDefs: [], resolvers: [] }
  files.keys().forEach(key => {
    if (key === 'index.js') {
      console.log('This is index.js')
    } else if (key === 'common.js') {
      names.forEach(name => {
        schemes.typeDefs.push(files(key).makeScheme(name).typeDef)
        schemes.resolvers.push(files(key).makeScheme(name).resolvers)
      })
    } else {
      schemes.typeDefs.push(files(key).typeDef)
      schemes.resolvers.push(files(key).resolvers)
    }
  })
  return schemes
}

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

const modules = names => {
  console.log('names :', names)
  return getSchemes(names)
}

export default modules
