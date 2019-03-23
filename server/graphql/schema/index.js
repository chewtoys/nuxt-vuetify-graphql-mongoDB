import { merge } from 'lodash'
import { makeExecutableSchema } from 'graphql-tools'
import modules from './modules'
const schemes = modules(['post'])

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
  typeDefs: [Query, ...schemes.typeDefs],
  resolvers: merge(resolvers, ...schemes.resolvers),
  resolverValidationOptions: {
    requireResolversForResolveType: false
  }
})
