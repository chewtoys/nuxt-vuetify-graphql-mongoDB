import { ObjectId } from 'mongodb'
import { prepare, generateQuery, capitalize } from '../../../utils'

const collectionName = 'post'
const collectionNameFirstLetterCap = capitalize(collectionName, true)

export const typeDef = `
  extend type Query {
    ${collectionName}(id: String!): ${collectionNameFirstLetterCap}
    retrieve${collectionNameFirstLetterCap}s(keywords: keywordsInput, period: periodInput, range:rangeInput, pagination:paginationInput): WithPage
  }
  
  extend type Mutation {
    add${collectionNameFirstLetterCap}(payload:${collectionName}Input):${collectionNameFirstLetterCap}
    update${collectionNameFirstLetterCap}(payload:${collectionName}Input):${collectionNameFirstLetterCap}
    delete${collectionNameFirstLetterCap}(_id:String!): Boolean
    delete${collectionNameFirstLetterCap}s(_ids:[String]!): Boolean
  }

  input ${collectionName}Input {
    _id:String
    title: String
    content: String
    slug: String
    like: Int
  }

  type ${collectionNameFirstLetterCap} {
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
    ${collectionName}s: [${collectionNameFirstLetterCap}]
  }
`
export const resolvers = {
  Query: {
    [`${collectionName}`]: async (root, args, { mongo, user }) => {
      const collection = mongo.collection(collectionName)
      return prepare(
        await collection.findOne({
          _id: ObjectId(args.id)
        })
      )
    },
    [`retrieve${collectionNameFirstLetterCap}s`]: async (
      root,
      args,
      { mongo, user }
    ) => {
      const collection = mongo.collection(collectionName)

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
    [`add${collectionNameFirstLetterCap}`]: async (
      root,
      args,
      { mongo, user }
    ) => {
      if (user) {
        const collection = mongo.collection(collectionName)
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
    [`update${collectionNameFirstLetterCap}`]: async (
      root,
      args,
      { mongo, user }
    ) => {
      if (user) {
        const collection = mongo.collection(collectionName)
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
    [`delete${collectionNameFirstLetterCap}`]: async (
      root,
      args,
      { mongo, user }
    ) => {
      if (user) {
        const collection = mongo.collection(collectionName)
        await collection.deleteOne({ _id: ObjectId(args._id) })
        return true
      } else throw new Error('User is not authenticated!')
    },
    [`delete${collectionNameFirstLetterCap}s`]: async (
      root,
      args,
      { mongo, user }
    ) => {
      if (user) {
        const collection = mongo.collection(collectionName)
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
  [`${collectionNameFirstLetterCap}`]: {
    owner: async (root, args, { mongo }) => {
      const owner = prepare(
        await mongo.collection('users').findOne({ _id: ObjectId(root.owner) })
      )
      return owner
    }
  }
}
