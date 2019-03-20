import { ObjectId } from 'mongodb'
import { prepare, generateQuery } from '../../../utils'
const collectionName = 'posts'
export const typeDef = `
  extend type Query {
    post(id: String!): Post
    retrievePosts(keywords: keywordsInput, period: periodInput, range:rangeInput, pagination:paginationInput): PostPage
  }
  
  extend type Mutation {
    addPost(title:String!, content:String!, slug:String):Post
    updatePost(_id:String!, title:String!, content:String!, slug:String):Post
    deletePost(_id:String!): Boolean
    deletePosts(_ids:[String]!): Boolean
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

  type PostPage {
    total: Int!
    posts: [Post]
  }
`
export const resolvers = {
  Query: {
    post: async (root, args, { mongo, user }) => {
      const Posts = mongo.collection(collectionName)
      return prepare(
        await Posts.findOne({
          _id: ObjectId(args.id)
        })
      )
    },
    retrievePosts: async (root, args, { mongo, user }) => {
      const Posts = mongo.collection(collectionName)

      const { query, sortBy, page, rowsPerPage } = generateQuery(args)

      const total = await Posts.find(query).count()
      const posts = (await Posts.find(query)
        .sort(sortBy)
        .skip(page > 0 ? (page - 1) * rowsPerPage : 0)
        .limit(rowsPerPage)
        .toArray()).map(prepare)

      return { total: total, posts: posts }
    }
  },
  Mutation: {
    addPost: async (root, args, { mongo, user }) => {
      if (user) {
        const Posts = mongo.collection(collectionName)
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
        const Posts = mongo.collection(collectionName)
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
        const Posts = mongo.collection(collectionName)
        await Posts.deleteOne({ _id: ObjectId(args._id) })
        return true
      } else throw new Error('User is not authenticated!')
    },
    deletePosts: async (root, args, { mongo, user }) => {
      if (user) {
        const Posts = mongo.collection(collectionName)
        const conditions = []
        args._ids.forEach(_id => {
          conditions.push(ObjectId(_id))
        })
        console.log('conditions :', conditions)
        await Posts.deleteMany({ _id: { $in: conditions } })
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
