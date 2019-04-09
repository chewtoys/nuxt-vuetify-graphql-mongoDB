const getSchemas = autoSchemas => {
  // console.log('getSchemas :', autoSchemas)

  const files = requestContext('.', false, /\.js$/)
  const schemas = { typeDefs: [], resolvers: [] }
  files.keys().forEach(key => {
    if (key === 'index.js') {
      console.log('This is index.js')
    } else if (key === 'common.js') {
      autoSchemas.forEach(schema => {
        schemas.typeDefs.push(files(key).makeSchema(schema).typeDef)
        schemas.resolvers.push(files(key).makeSchema(schema).resolvers)
      })
    } else {
      schemas.typeDefs.push(files(key).typeDef)
      schemas.resolvers.push(files(key).resolvers)
    }
  })
  return schemas
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
  return getSchemas(names)
}

export default modules
