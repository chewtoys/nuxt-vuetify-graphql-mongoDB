import { makeExecutableSchema } from 'graphql-tools'
import { MongoClient, ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'
import resolvers from './resolvers'

const typeDefs = `
    type User {
      _id: String
      email: String
      token: String
    }
    type Post {
        _id: String!
        author: String!
        title: String!
        slug: String
        content: String
    }
    type Query {
      currentUser: User,
      post(id: String): Post
    }
    type Mutation {
        addPost(
            title: String,
            slug: String,
            content: String
        ): Post
        signinUser(email: String!, password: String!): User
        createUser(email: String!, password: String!): User
    }
`

export default makeExecutableSchema({
  typeDefs,
  resolvers
})

const getUser = async (authorization, secrets, mongo) => {
  const bearerLength = 'Bearer '.length
  if (authorization && authorization.length > bearerLength) {
    const token = authorization.slice(bearerLength)
    const { ok, result } = await new Promise(resolve =>
      jwt.verify(token, secrets.JWT_SECRET, (err, result) => {
        if (err) {
          resolve({
            ok: false,
            result: err
          })
        } else {
          console.log('token verified!')
          resolve({
            ok: true,
            result
          })
        }
      })
    )
    console.log('ok :', ok)
    console.log('result :', result)

    if (ok) {
      const user = await mongo
        .collection('users')
        .findOne({ _id: ObjectId(result._id) })
      return user
    } else {
      console.error(result)
      return null
    }
  }

  return null
}
let mongo
export function context(headers, secrets) {
  // Optional: Export a function to get context from the request.
  const CONNECTION_URL =
    'mongodb+srv://nuxt-user-1:' +
    encodeURIComponent('nuxt1234') +
    '@cluster0-gjlob.mongodb.net/graphql-auth-demo-1?retryWrites=true'
  const DATABASE_NAME = 'graphql-auth-demo-1'

  if (!mongo) {
    MongoClient.connect(
      CONNECTION_URL,
      { useNewUrlParser: true },
      (error, client) => {
        if (error) {
          throw error
        }
        mongo = client.db(DATABASE_NAME)
        console.log('Connected to `' + DATABASE_NAME + '`!')
      }
    )
  }

  const user = getUser(headers.authorization, secrets, mongo)
  return { headers, secrets, mongo, user }
}
