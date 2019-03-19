import { ObjectId } from 'mongodb'
import { prepare } from '../../../utils'
const coleectionName = 'posts'
export const typeDef = `
  extend type Query {
    post(id: String!): Post
    retrievePosts(keywords: keywordsInput, period: periodInput, range:rangeInput): [Post]
  }
  
  extend type Mutation {
    addPost(title:String!, content:String!, slug:String):Post
    updatePost(_id:String!, title:String!, content:String!, slug:String):Post
    deletePost(_id:String!): Boolean
  }

  input keywordsInput {
    kind: String
    keywords: [String]
  }

  input periodInput {
    kind: String!
    startDate: String
    endDate: String
  }

  input rangeInput {
    kind: String!
    min: Int
    max: Int
  }

  type Post {
    _id:ID!
    title: String!
    content: String
    created: Date
    updated: Date
    like: Int
    slug: String
    author: User
  }
`
export const resolvers = {
  Query: {
    post: async (root, args, { mongo, user }) => {
      const Posts = mongo.collection(coleectionName)
      return prepare(
        await Posts.findOne({
          _id: ObjectId(args.id)
        })
      )
    },
    retrievePosts: async (root, args, { mongo, user }) => {
      const Posts = mongo.collection(coleectionName)
      const keywordArray = []
      const keywordOr = {}
      const datesBtw = {}
      const rangeBtw = {}
      const ands = []
      let query = {}
      const keys = Object.keys(args)
      keys.forEach(key => {
        if (key === 'period') {
          const period = args[key]
          datesBtw[period.kind] = {}
          if (period.startDate) {
            datesBtw[period.kind].$gte = new Date(period.startDate)
          }
          if (period.endDate) {
            datesBtw[period.kind].$lte = new Date(period.endDate)
          }
          ands.push(datesBtw)
        } else if (key === 'range') {
          const range = args[key]
          rangeBtw[range.kind] = {}
          rangeBtw[range.kind].$gte = range.min
          rangeBtw[range.kind].$lte = range.max
          ands.push(rangeBtw)
        } else if (key === 'keywords') {
          const keywords = args[key]
          keywords.keywords.forEach(key => {
            const item = {}
            item[keywords.kind] = { $regex: new RegExp(key) }
            keywordArray.push(item)
          })

          keywordOr.$or = keywordArray
          ands.push(keywordOr)
        }
      })
      console.log('keywordArray :', keywordArray)
      console.log('keywordOr :', keywordOr)
      if (ands.length > 1) {
        query = { $and: ands }
      } else if (Object.keys(datesBtw).length > 0) {
        query = datesBtw
      } else if (Object.keys(rangeBtw).length > 0) {
        query = rangeBtw
      } else if (keywordArray.length > 0) {
        query = keywordOr
      }
      return (await Posts.find(query)
        .sort({ updated: -1 })
        .toArray()).map(prepare)
    }
  },
  Mutation: {
    addPost: async (root, args, { mongo, user }) => {
      if (user) {
        const Posts = mongo.collection(coleectionName)
        const post = await Posts.insertOne({
          authorId: user.email,
          title: args.title,
          content: args.content,
          like: 0,
          created: new Date(),
          updated: new Date()
        })
        return prepare(
          await Posts.findOne({
            _id: post.insertedId
          })
        )
      } else throw new Error('User is not authenticated!')
    },
    updatePost: async (root, args, { mongo, user }) => {
      if (user) {
        const Posts = mongo.collection(coleectionName)
        await Posts.updateOne(
          { _id: ObjectId(args._id) },
          {
            $set: {
              title: args.title,
              content: args.content,
              updated: new Date()
            }
          }
        )
        return prepare(
          await Posts.findOne({
            _id: ObjectId(args._id)
          })
        )
      } else throw new Error('Failed updatePost!')
    },
    deletePost: async (root, args, { mongo, user }) => {
      if (user) {
        const Posts = mongo.collection(coleectionName)
        await Posts.deleteOne({ _id: ObjectId(args._id) })
        return true
      } else throw new Error('User is not authenticated!')
    }
  },
  Post: {
    author: (post, args, { mongo }) => {
      return mongo.collection('users').findOne({ email: post.authorId })
    }
  }
}
