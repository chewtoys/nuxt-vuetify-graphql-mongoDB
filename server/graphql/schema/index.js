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

const makeSchemaWith = autoSchemas => {
  const schemas = modules(autoSchemas)
  return makeExecutableSchema({
    typeDefs: [Query, ...schemas.typeDefs],
    resolvers: merge(resolvers, ...schemas.resolvers),
    resolverValidationOptions: {
      requireResolversForResolveType: false
    }
  })
}

export default makeSchemaWith
