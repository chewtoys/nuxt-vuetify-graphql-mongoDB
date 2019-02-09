import { MongoClient } from 'mongodb'
import schema from './graphql/schema'
import { context } from './graphql/context'
import api from './api'

const express = require('express')
// const { graphqlExpress, graphiqlExpress, graphqlConnect } = require('graphql-server-express')
const graphqlHTTP = require('express-graphql')
const bodyParser = require('body-parser')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const config = require('../nuxt.config.js')
const app = express()
let mongo = null

app.use(
  '/graphql',
  bodyParser.json(),
  graphqlHTTP(async function(req, res, params) {
    return {
      schema: schema,
      graphiql: true,
      rootValue: {},
      context: await context(req.headers, { JWT_SECRET: 'tokenis' }, mongo),
      formatError: e => {
        const query = params.query
        const variables = params.variables
        console.log('Error!', e, query, JSON.stringify(variables, null, 2))
        return e
      }
    }
  })
)

// Import API Routes
app.use('/api', api)

// Import and Set Nuxt.js options
config.dev = !(process.env.NODE_ENV === 'production')

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const {
    host = process.env.HOST || '127.0.0.1',
    port = process.env.PORT || 3000
  } = nuxt.options.server

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  // Give nuxt middleware to express
  app.use(nuxt.render)

  const CONNECTION_URL =
    'mongodb+srv://nuxt-user-1:' +
    encodeURIComponent('nuxt1234') +
    '@cluster0-gjlob.mongodb.net/graphql-auth-demo-1?retryWrites=true'
  const DATABASE_NAME = 'graphql-auth-demo-1'

  if (!mongo) {
    MongoClient.connect(
      CONNECTION_URL,
      { useNewUrlParser: true },
      (error, client) => {
        if (error) {
          throw error
        }
        mongo = client.db(DATABASE_NAME)
        console.log('Connected to `' + DATABASE_NAME + '`!')
        // Listen the server
        app.listen(port, host)
        consola.ready({
          message: `Server listening on http://${host}:${port}`,
          badge: true
        })
      }
    )
  }
}
start()
