import { capitalize, typeDef as def, resolvers as res } from '../../../utils'

const makeScheme = name => {
  const capitalizeName = capitalize(name, true)
  return {
    typeDef: def(name, capitalizeName),
    resolvers: res(name, capitalizeName)
  }
}

exports.makeScheme = makeScheme
