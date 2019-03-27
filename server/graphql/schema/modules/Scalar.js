const { GraphQLScalarType } = require('graphql')
const { Kind } = require('graphql/language')

export const typeDef = `
  scalar Date
  scalar Any

`
export const resolvers = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      return new Date(value) // value from the client
    },
    serialize(value) {
      return value.getTime() // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10) // ast value is always in string format
      }
      return null
    }
  }),
  Any: new GraphQLScalarType({
    name: 'Any',
    description: 'Literally anything',
    serialize(value) {
      return value
    },
    parseValue(value) {
      return value
    },
    parseLiteral(ast) {
      return ast.value
    }
  })
}
