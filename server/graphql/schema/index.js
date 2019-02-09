import { merge } from 'lodash'
import { makeExecutableSchema } from 'graphql-tools'
import { typeDef as User, resolvers as userResolvers } from './User.js'
import { typeDef as Post, resolvers as postResolvers } from './Post.js'

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
  typeDefs: [Query, User, Post],
  resolvers: merge(resolvers, userResolvers, postResolvers)
})
