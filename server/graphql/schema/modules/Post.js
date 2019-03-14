import { ObjectId } from 'mongodb'
import { prepare } from '../../../utils'

export const typeDef = `
  extend type Query {
    post(id: String!): Post
    postsByTitle(title:String): [Post]
  }
  
  extend type Mutation {
    addPost(title:String!, content:String!, slug:String):Post
    updatePost(_id:String!, title:String!, content:String!, slug:String):Post
    deletePost(id:String!): Boolean
  }

  type Post {
      _id:ID!
      title: String!
      content: String
      slug: String
      author: User
  }
`
export const resolvers = {
  Query: {
    post: async (root, args, { mongo, user }) => {
      const Posts = mongo.collection('posts')
      return prepare(
        await Posts.findOne({
          _id: ObjectId(args.id)
        })
      )
    },
    postsByTitle: async (root, args, { mongo, user }) => {
      const Posts = mongo.collection('posts')
      return (await Posts.find({}).toArray()).map(prepare)
    }
  },
  Mutation: {
    addPost: async (root, args, { mongo, user }) => {
      if (user) {
        const Posts = mongo.collection('posts')
        const post = await Posts.insertOne({
          authorId: user.email,
          title: args.title,
          content: args.content
        })
        return prepare(
          await Posts.findOne({
            _id: post.insertedId
          })
        )
      } else throw new Error('User is not authenticated!')
    },
    updatePost: async (root, args, { mongo, user }) => {
      console.log('updatePost > user:', user)
      if (user) {
        const Posts = mongo.collection('posts')
        await Posts.updateOne(
          { _id: ObjectId(args._id) },
          { $set: { title: args.title, content: args.content } }
        )
        return prepare(await Posts.findOne({ _id: ObjectId(args._id) }))
      } else throw new Error('Failed updatePost!')
    },
    deletePost: async (root, args, { mongo, user }) => {
      if (user) {
        const Posts = mongo.collection('posts')
        await Posts.deleteOne({ _id: ObjectId(args.id) })
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
