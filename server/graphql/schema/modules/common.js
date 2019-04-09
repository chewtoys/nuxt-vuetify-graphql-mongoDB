import { typeDef, resolvers } from '../../../query'
import { capitalize } from '../../../../utils'

const makeSchema = schema => {
  const capitalizeName = capitalize(schema.name, true)
  return {
    typeDef: typeDef(schema, capitalizeName),
    resolvers: resolvers(schema, capitalizeName)
  }
}

exports.makeSchema = makeSchema
