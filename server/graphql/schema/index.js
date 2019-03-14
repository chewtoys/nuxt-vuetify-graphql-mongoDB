import { merge } from 'lodash'
import { makeExecutableSchema } from 'graphql-tools'
import modules from './modules'

const Query = `
  type Query {
    _empty: String
  }
  type Mutation {
    _empty: String
  }
`

const resolvers = {}

export default makeExecutableSchema({
  typeDefs: [Query, ...modules.typeDefs],
  resolvers: merge(resolvers, ...modules.resolvers)
})
