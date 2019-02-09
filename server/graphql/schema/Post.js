import { ObjectId } from 'mongodb'

export const typeDef = `
  extend type Query {
    post(id: String!): Post
  }
  
  extend type Mutation {
    addPost(title:String!, content:String!, slug:String):Post
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
      const result = await Posts.findOne({ _id: ObjectId(args.id) })
      return result
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
        return post.ops[0]
      } else throw new Error('User is not authenticated!')
    }
  },
  Post: {
    author: (post, args, { mongo }) => {
      return mongo.collection('users').findOne({ email: post.authorId })
    }
  }
}
