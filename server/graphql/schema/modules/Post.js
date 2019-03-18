import { ObjectId } from 'mongodb'
import { prepare } from '../../../utils'
const coleectionName = 'posts'
export const typeDef = `
  extend type Query {
    post(id: String!): Post
    retrievePosts(title:String, content: String, period: periodInput): [Post]
  }
  
  extend type Mutation {
    addPost(title:String!, content:String!, slug:String):Post
    updatePost(_id:String!, title:String!, content:String!, slug:String):Post
    deletePost(_id:String!): Boolean
  }

  input periodInput {
    kind: String!
    startDate: String
    endDate: String
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
      const keywords = []
      const datesBtw = {}
      let query = {}
      const keys = Object.keys(args)
      keys.forEach(key => {
        if (key === 'period') {
          const period = args[key]
          datesBtw[period.kind] = {}
          if (period.startDate) {
            datesBtw[period.kind].$gt = new Date(period.startDate)
          }
          if (period.endDate) {
            datesBtw[period.kind].$lt = new Date(period.endDate)
          }
        } else {
          const item = {}
          item[key] = { $regex: new RegExp(args[key]) }
          keywords.push(item)
        }
      })

      if (Object.keys(datesBtw).length > 0 && keywords.length > 0) {
        query = { $and: [datesBtw, { $or: keywords }] }
      } else if (Object.keys(datesBtw).length > 0) {
        query = datesBtw
      } else if (keywords.length > 0) {
        query = { $or: keywords }
      }
      // console.log('datesBtw :', datesBtw)
      // console.log('keywords :', keywords)
      // console.log('query :', query)
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
