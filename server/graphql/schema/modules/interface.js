import { prepare, generateQuery } from '../../../utils'

export const typeDef = `
  
  interface Searchable{
    _id: ID!
    created: Date
    updated: Date
    owner: User
  }

  extend type Query {
    search(ids:[String], keywords: keywordsInput, period: periodInput, range:rangeInput, pagination:paginationInput): [Searchable]
  }

`

export const resolvers = {
  Query: {
    search: async (root, args, { mongo, user }) => {
      console.log('root :', root)
      console.log('args :', args)
      const collection = mongo.collection('post')

      const { query, sortBy, page, rowsPerPage } = generateQuery(args)

      // const total = await collection.find(query).count()
      const items = (await collection
        .find(query)
        .sort(sortBy)
        .skip(page > 0 ? (page - 1) * rowsPerPage : 0)
        .limit(rowsPerPage)
        .toArray()).map(prepare)

      return items
    }
  },
  Searchable: {
    __resolveType(obj, ctx, info) {
      let typeName = ''
      if (obj.content) {
        typeName = 'Post'
      }
      return typeName
    }
  }
}
