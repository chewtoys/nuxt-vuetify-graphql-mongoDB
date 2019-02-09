import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

export const typeDef = `
  extend type Query {
    user(email: String!): User
  }

  extend type Mutation {
    signin(email:String!, password:String!):AuthPayload
    signup(email:String!, password:String!):AuthPayload
  }

  type User {
    admin: Boolean
    email: String!
    posts: [Post] # the list of Posts by this author
  } 
  
  type AuthPayload {
    accessToken: String!
    user: User
  }
`
export const resolvers = {
  Query: {
    user: (root, args, { user }) => {
      return user
    }
  },
  Mutation: {
    signin: async (root, { email, password }, { mongo, secrets }) => {
      const Users = mongo.collection('users')
      const user = await Users.findOne({ email })
      if (!user) {
        throw new Error('Email not found')
      }
      const Auths = mongo.collection('auths')
      const auth = await Auths.findOne({ email })

      const validPassword = await bcrypt.compare(password, auth.password)
      if (!validPassword) {
        throw new Error('Password is incorrect')
      }
      const AuthPayload = {}
      AuthPayload.accessToken = jwt.sign({ _id: user._id }, secrets.JWT_SECRET)
      return AuthPayload
    },
    signup: async (root, { email, password }, { mongo, secrets }) => {
      const Users = mongo.collection('users')
      const existingUser = await Users.findOne({ email })
      if (existingUser) {
        throw new Error('Email already used')
      }
      await Users.insertOne({ email })
      const Auths = mongo.collection('auths')
      const hash = await bcrypt.hash(password, 10)
      await Auths.insertOne({ email, password: hash })
      const user = await Users.findOne({ email })
      const accessToken = jwt.sign({ _id: user._id }, secrets.JWT_SECRET)
      return { accessToken }
    }
  },
  User: {
    posts: async (user, args, { mongo }) => {
      const posts = await mongo
        .collection('posts')
        .find({ authorId: user.email })
        .toArray()
      return posts
    }
  },
  AuthPayload: {
    user: (auth, args, { mongo, user }) => {
      if (user) return user
      else return null
    }
  }
}
// type User {
//   admin: Boolean
//   created: Dat!
//   updated: Date
//   fullName: String
//   groups: String
//   firstName: String
//   lastName: String
//   lastLoginDate: Date
//   isCurrent: Boolean
//   photoUrl: String
//   preferredLocale: String
//   username: String
//   email: String!
//   accessToken: String
//   posts: [Post] # the list of Posts by this author
//     }
