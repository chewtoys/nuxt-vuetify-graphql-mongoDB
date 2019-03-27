import { ObjectId } from 'mongodb'

const prepare = o => {
  o._id = o._id.toString()
  return o
}

const generateQuery = args => {
  let page = 1
  let rowsPerPage = 5
  let sortBy = {}
  const keywordArray = []
  const keywordOr = {}
  const datesBtwArray = []
  const datesBtwOr = {}
  const rangeBtwArray = []
  const rangeBtwOr = {}
  const idArray = []
  const idOr = {}
  const ands = []
  let query = {}
  const keys = Object.keys(args)
  keys.forEach(key => {
    if (key === 'period') {
      const period = args[key]
      period.kind.forEach(kind => {
        const item = {}
        item[kind] = {}
        if (period.startDate) {
          item[kind].$gte = new Date(period.startDate)
        }
        if (period.endDate) {
          item[kind].$lte = new Date(period.endDate)
        }
        datesBtwArray.push(item)
      })
      datesBtwOr.$or = datesBtwArray
      ands.push(datesBtwOr)
    } else if (key === 'range') {
      const range = args[key]
      range.kind.forEach(kind => {
        const item = {}
        item[kind] = {}
        item[kind].$gte = range.min
        item[kind].$lte = range.max
        rangeBtwArray.push(item)
      })
      rangeBtwOr.$or = rangeBtwArray
      ands.push(rangeBtwOr)
    } else if (key === 'keywords') {
      const keywords = args[key]
      keywords.kind.forEach(kind => {
        keywords.keywords.forEach(key => {
          const item = {}
          item[kind] = { $regex: new RegExp(key) }
          keywordArray.push(item)
        })
      })
      keywordOr.$or = keywordArray
      ands.push(keywordOr)
    } else if (key === 'ids') {
      const ids = args[key]
      ids.forEach(key => {
        const item = {}
        item._id = ObjectId(key)
        idArray.push(item)
      })
      idOr.$or = idArray
      ands.push(idOr)
    } else if (key === 'pagination') {
      page = args[key].page
      rowsPerPage = args[key].rowsPerPage
      if (args[key].sortBy) {
        sortBy[args[key].sortBy] = args[key].descending ? -1 : 1
      } else sortBy = { created: -1 }
    }
  })
  if (ands.length > 1) {
    query = { $and: ands }
  } else if (datesBtwArray.length > 0) {
    query = datesBtwOr
  } else if (rangeBtwArray.length > 0) {
    query = rangeBtwOr
  } else if (keywordArray.length > 0) {
    query = keywordOr
  } else if (idArray.length > 0) {
    query = idOr
  }

  return { query: query, page: page, rowsPerPage: rowsPerPage, sortBy: sortBy }
}

const typeDef = (schema, capitalizeName) => {
  const fields = schema.fields
  let fieldsValue = ''
  fields.forEach(field => {
    fieldsValue += field.name + ': ' + field.type + '\n'
  })
  // console.log('fieldsValue :\n', fieldsValue)
  return `

  type ${capitalizeName} implements Searchable {
    _id:ID!
    ${fieldsValue}
    created: Date
    updated: Date
    owner: User
  }

`
}
const resolvers = (name, capitalizeName) => {
  return {
    [`${capitalizeName}`]: {
      owner: async (root, args, { mongo }) => {
        const owner = prepare(
          await mongo.collection('users').findOne({ _id: ObjectId(root.owner) })
        )
        return owner
      }
    }
  }
}

export { prepare }
export { generateQuery }

export { typeDef }
export { resolvers }
