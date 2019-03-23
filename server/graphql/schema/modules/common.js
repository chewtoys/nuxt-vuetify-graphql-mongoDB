import { capitalize, typeDef as def, resolvers as res } from '../../../utils'

const makeSchema = schema => {
  const capitalizeName = capitalize(schema.name, true)
  return {
    typeDef: def(schema, capitalizeName),
    resolvers: res(schema.name, capitalizeName)
  }
}

exports.makeSchema = makeSchema
