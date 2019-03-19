import { ObjectId } from 'mongodb'
import { prepare } from '../../../utils'
const coleectionName = 'posts'
export const typeDef = `
  extend type Query {
    post(id: String!): Post
    retrievePosts(keywords: keywordsInput, period: periodInput, range:rangeInput, pagination:paginationInput): PostPage
  }
  
  extend type Mutation {
    addPost(title:String!, content:String!, slug:String):Post
    updatePost(_id:String!, title:String!, content:String!, slug:String):Post
    deletePost(_id:String!): Boolean
  }

  input paginationInput {
    page: Int!
    rowsPerPage: Int!
    sortBy: String
    descending: Boolean
    totalItems: Int
  }

  input keywordsInput {
    kind: [String]!
    keywords: [String]
  }

  input periodInput {
    kind: [String]!
    startDate: String
    endDate: String
  }

  input rangeInput {
    kind: [String]!
    min: Int!
    max: Int!
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
      const Posts = mongo.collection(coleectionName)
      return prepare(
        await Posts.findOne({
          _id: ObjectId(args.id)
        })
      )
    },
    retrievePosts: async (root, args, { mongo, user }) => {
      const Posts = mongo.collection(coleectionName)

      let page = 1
      let rowsPerPage = 5
      const sortBy = {}
      const keywordArray = []
      const keywordOr = {}
      const datesBtwArray = []
      const datesBtwOr = {}
      const rangeBtwArray = []
      const rangeBtwOr = {}
      const ands = []
      let query = {}
      const keys = Object.keys(args)
      keys.forEach(key => {
        if (key === 'period') {
          const period = args[key]
          period.kind.forEach(kind => {
            const item = {}
            item[kind] = {}
            if (period.startDate) {
              item[kind].$gte = new Date(period.startDate)
            }
            if (period.endDate) {
              item[kind].$lte = new Date(period.endDate)
            }
            datesBtwArray.push(item)
          })
          datesBtwOr.$or = datesBtwArray
          ands.push(datesBtwOr)
        } else if (key === 'range') {
          const range = args[key]
          range.kind.forEach(kind => {
            const item = {}
            item[kind] = {}
            item[kind].$gte = range.min
            item[kind].$lte = range.max
            rangeBtwArray.push(item)
          })
          rangeBtwOr.$or = rangeBtwArray
          ands.push(rangeBtwOr)
        } else if (key === 'keywords') {
          const keywords = args[key]
          keywords.kind.forEach(kind => {
            keywords.keywords.forEach(key => {
              const item = {}
              item[kind] = { $regex: new RegExp(key) }
              keywordArray.push(item)
            })
          })
          keywordOr.$or = keywordArray
          ands.push(keywordOr)
        } else if (key === 'pagination') {
          page = args[key].page
          rowsPerPage = args[key].rowsPerPage
          sortBy[args[key].sortBy] = args[key].descending ? -1 : 1
        }
      })

      if (ands.length > 1) {
        query = { $and: ands }
      } else if (datesBtwArray.length > 0) {
        query = datesBtwOr
      } else if (rangeBtwArray.length > 0) {
        query = rangeBtwOr
      } else if (keywordArray.length > 0) {
        query = keywordOr
      }

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
