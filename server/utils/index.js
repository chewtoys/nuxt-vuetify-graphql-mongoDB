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
  console.log('keys :', keys)
  console.log('args.ids :', args.ids)
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
  console.log(('idArray :', idArray))
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

const capitalize = (inputString, first) => {
  let ret = ''
  if (first) {
    ret = inputString.charAt(0).toUpperCase() + inputString.slice(1)
  } else ret = inputString.toUpperCase()
  return ret
}

const typeDef = (name, capitalizeName) => {
  return `
  extend type Query {
    ${name}(id: String!): ${capitalizeName}
    retrieve${capitalizeName}s(ids:[String], keywords: keywordsInput, period: periodInput, range:rangeInput, pagination:paginationInput): WithPage
  }
  
  extend type Mutation {
    add${capitalizeName}(payload:${name}Input):${capitalizeName}
    update${capitalizeName}(payload:${name}Input):${capitalizeName}
    delete${capitalizeName}(_id:String!): Boolean
    delete${capitalizeName}s(_ids:[String]!): Boolean
  }

  input ${name}Input {
    _id:String
    title: String
    content: String
    slug: String
    like: Int
  }

  type ${capitalizeName} implements Searchable {
    _id:ID!
    title: String!
    content: String
    slug: String
    like: Int
    created: Date
    updated: Date
    owner: User
  }

  type WithPage {
    total: Int!
    ${name}s: [${capitalizeName}]
  }
`
}
const resolvers = (name, capitalizeName) => {
  return {
    Query: {
      [`${name}`]: async (root, args, { mongo, user }) => {
        const collection = mongo.collection(name)
        return prepare(
          await collection.findOne({
            _id: ObjectId(args.id)
          })
        )
      },
      [`retrieve${capitalizeName}s`]: async (root, args, { mongo, user }) => {
        const collection = mongo.collection(name)

        const { query, sortBy, page, rowsPerPage } = generateQuery(args)

        const total = await collection.find(query).count()
        const items = (await collection
          .find(query)
          .sort(sortBy)
          .skip(page > 0 ? (page - 1) * rowsPerPage : 0)
          .limit(rowsPerPage)
          .toArray()).map(prepare)

        return { total: total, posts: items }
      }
    },
    Mutation: {
      [`add${capitalizeName}`]: async (root, args, { mongo, user }) => {
        if (user) {
          const collection = mongo.collection(name)
          const payload = args.payload
          const query = {
            owner: user._id,
            like: 0,
            created: new Date(),
            updated: new Date()
          }
          Object.keys(payload).forEach(key => {
            query[key] = payload[key]
          })
          const item = await collection.insertOne(query)
          return prepare(
            await collection.findOne({
              _id: item.insertedId
            })
          )
        } else throw new Error('User is not authenticated!')
      },
      [`update${capitalizeName}`]: async (root, args, { mongo, user }) => {
        if (user) {
          const collection = mongo.collection(name)
          const payload = args.payload
          const query = { updated: new Date() }
          Object.keys(payload).forEach(key => {
            if (key !== '_id') query[key] = payload[key]
          })
          await collection.updateOne(
            { _id: ObjectId(args.payload._id) },
            { $set: query }
          )
          return prepare(
            await collection.findOne({
              _id: ObjectId(args.payload._id)
            })
          )
        } else throw new Error('Failed updatePost!')
      },
      [`delete${capitalizeName}`]: async (root, args, { mongo, user }) => {
        if (user) {
          const collection = mongo.collection(name)
          await collection.deleteOne({ _id: ObjectId(args._id) })
          return true
        } else throw new Error('User is not authenticated!')
      },
      [`delete${capitalizeName}s`]: async (root, args, { mongo, user }) => {
        if (user) {
          const collection = mongo.collection(name)
          const conditions = []
          args._ids.forEach(_id => {
            conditions.push(ObjectId(_id))
          })
          console.log('conditions :', conditions)
          await collection.deleteMany({ _id: { $in: conditions } })
          return true
        } else throw new Error('User is not authenticated!')
      }
    },
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

exports.prepare = prepare
exports.generateQuery = generateQuery
exports.capitalize = capitalize

exports.typeDef = typeDef
exports.resolvers = resolvers
