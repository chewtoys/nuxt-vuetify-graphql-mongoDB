// import _ from 'lodash'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const resolvers = {
  Query: {
    me: (root, args, { mongo, user }) => {
      return user
    },
    posts: (root, args, { mongo, user }) => {
      const Posts = mongo.collection('posts')
      const result = Posts.find({ author: user.email }, function(err, r) {
        if (err) throw new Error('Failed add post!')
      })
      return result
    }
  }, // Query

  Mutation: {
    addPost: async (root, args, { mongo, user }) => {
      if (user) {
        const Posts = mongo.collection('posts')
        const post = await Posts.insertOne(
          { authur: user.email, title: args.title, content: args.content },
          function(err, r) {
            if (err) throw new Error('Failed add post!')
          }
        )
        return post
      } else throw new Error('User is not authenticated!')
    },
    signinUser: async (root, { email, password }, { mongo, secrets }) => {
      const Users = mongo.collection('users')
      const user = await Users.findOne({ email })
      if (!user) {
        throw new Error('Email not found')
      }
      const validPassword = await bcrypt.compare(password, user.password)
      if (!validPassword) {
        throw new Error('Password is incorrect')
      }
      user.accessToken = jwt.sign({ _id: user._id }, secrets.JWT_SECRET)
      return user
    },
    createUser: async (root, { email, password }, { mongo, secrets }) => {
      const Users = mongo.collection('users')
      const existingUser = await Users.findOne({ email })
      if (existingUser) {
        throw new Error('Email already used')
      }
      const hash = await bcrypt.hash(password, 10)
      await Users.insert({
        email,
        password: hash
      })
      const user = await Users.findOne({ email })
      user.token = jwt.sign({ _id: user._id }, secrets.JWT_SECRET)
      return user
    }
  }, // Mutation

  User: {
    posts: (root, args, { mongo, user }) =>
      mongo.collection('posts').find({ author: { email: user.email } })
  },

  Post: {
    author: (root, args, { mongo, user }) =>
      mongo.collection('users').find({ email: user.email })
  }
}

export default resolvers
