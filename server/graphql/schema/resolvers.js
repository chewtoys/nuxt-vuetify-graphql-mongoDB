import _ from 'lodash'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const posts = [
  {
    author: '123',
    title: 'Bài 1',
    slug: 'bai-1',
    content: '<strong>Nội dung bài 1</strong>'
  },
  {
    author: '345',
    title: 'Bài 2',
    slug: 'bai-2',
    content: '<strong>Nội dung bài 2</strong>'
  }
]

// const TEMP_USER = {
//   _id: '1',
//   email: 'spencer@handlebarlabs.com'
// }

const resolvers = {
  Query: {
    currentUser: (root, args, context) => {
      return context.user
    },
    post: (obj, args) => {
      console.log(args)
      const result = _.find(posts, { author: args.author })
      console.log(result)
      return result
    }
  }, // Query

  Mutation: {
    addPost: async (root, args, { mongo, user }) => {
      const author = await user
      const email = author.email
      if (user) {
        const Posts = mongo.collection('posts')
        await Posts.insertOne(
          { authur: email, title: args.title, content: args.content },
          function(err, r) {
            if (err) throw new Error('Failed add post!')
            // console.log('addPost > result:', r)
            const post = {
              authur: email,
              title: args.title,
              content: args.content
            }
            return post
          }
        )
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
  } // Mutation
}

export default resolvers
