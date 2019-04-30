import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { ObjectId } from 'mongodb'

export const typeDef = `

  extend type Mutation {
    signin(email:String!, password:String!):AuthPayload!
    signup(email:String!, password:String!, name:String!):AuthPayload!
  }
  
  type AuthPayload {
    accessToken: String!
    user: User
  }
`
export const resolvers = {
  Mutation: {
    signin: async (root, { email, password }, { mongo, secrets }) => {
      // const Users = mongo.collection('user')
      // const user = await Users.findOne({ email })
      // if (!user) {
      //   throw new Error('Email not found')
      // }
      const Auths = mongo.collection('auth')
      const auth = await Auths.findOne({ email })
      if (!auth) {
        throw new Error('Email was not found!')
      }
      const Users = mongo.collection('user')
      const user = await Users.findOne({ _id: auth.ownerId })

      const validPassword = await bcrypt.compare(password, auth.password)
      if (!validPassword) {
        throw new Error('Password is incorrect')
      }

      await Users.updateOne(
        { _id: ObjectId(user._id) },
        { $set: { loggedIn: new Date() } }
      )

      const accessToken = jwt.sign({ _id: user._id }, secrets.JWT_SECRET)
      const authPayload = { accessToken }
      authPayload.user = user
      return authPayload
    },
    signup: async (root, { email, password, name }, { mongo, secrets }) => {
      const Users = mongo.collection('user')
      const existingUser = await Users.findOne({ email })
      if (existingUser) {
        throw new Error('Email already used')
      }
      await Users.insertOne({
        role: 'user',
        email,
        name,
        created: new Date(),
        loggedIn: new Date()
      })
      const Auths = mongo.collection('auth')
      const hash = await bcrypt.hash(password, 10)
      await Auths.insertOne({ email, password: hash })
      const user = await Users.findOne({ email })
      const accessToken = jwt.sign({ _id: user._id }, secrets.JWT_SECRET)
      const authPayload = { accessToken }
      authPayload.user = user
      return authPayload
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
