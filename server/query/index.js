import { ObjectId } from 'mongodb'
import { hasNormalScalar, capitalize } from '../../utils'

const prepare = o => {
  if (o && o._id) o._id = o._id.toString()
  return o
}

const generateQuery = args => {
  let page = 1
  let rowsPerPage = 5
  let sortBy = {}
  const keywordArray = []
  const keywordOr = {}
  const userArray = []
  const userOr = {}
  const datesBtwArray = []
  const datesBtwOr = {}
  const rangeBtwArray = []
  const rangeBtwOr = {}
  const idArray = []
  const idOr = {}
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
    } else if (key === 'users') {
      const users = args[key]
      users.kind.forEach(kind => {
        users.users.forEach(key => {
          const item = {}
          item[`${kind}.email`] = { $regex: new RegExp(key) }
          userArray.push(item)
        })
      })
      // console.log('userArray :', userArray)
      userOr.$or = userArray
      ands.push(userOr)
    } else if (key === 'ids') {
      const ids = args[key]
      ids.forEach(key => {
        const item = {}
        item._id = ObjectId(key)
        idArray.push(item)
      })
      idOr.$or = idArray
      ands.push(idOr)
    } else if (key === 'pagination') {
      page = args[key].page
      rowsPerPage = args[key].rowsPerPage
      if (args[key].sortBy) {
        sortBy[args[key].sortBy] = args[key].descending ? -1 : 1
      } else sortBy = { created: -1 }
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
  } else if (userArray.length > 0) {
    query = userOr
  } else if (idArray.length > 0) {
    query = idOr
  }

  return { query: query, page: page, rowsPerPage: rowsPerPage, sortBy: sortBy }
}

const typeDef = (schema, capitalizeName) => {
  const fields = schema.fields
  let fieldsValue = ''
  fields.forEach(field => {
    fieldsValue += field.name + ': ' + field.type + '\n'
  })

  if (schema.lookups) {
    schema.lookups.forEach(lookup => {
      fieldsValue +=
        lookup.$lookup.as + ': ' + capitalize(lookup.$lookup.from, true) + '\n'
    })
  }
  // console.log('fieldsValue :\n', fieldsValue)
  return `

  type ${capitalizeName} implements Searchable {
    _id:ID!
    ${fieldsValue}
    created: Date
    updated: Date
  }


  extend type Query {
    search${capitalizeName}(module:String!, ids:[String], keywords: keywordsInput, period: periodInput, range:rangeInput, users: usersInput, pagination:paginationInput): Page
  }


`
}
const resolvers = (schema, capitalizeName) => {
  // if schema type(type:Thing!) is not contained in String, Int, Float, Date, Boolean
  // generate resolver for its name('thing') using by schema additionForAdd(root.thingId) and its name collection('thing')
  /* 
    thing: async (root, args, {mongo}) => {
      const thing = prepare(
        await mongo
          .collection('thing')
          .findOne({_id: ObjectId(root.thingId)})
        )
      return thing
    )}

    [
            {
              $match: query
            },
            {
              $lookup: {
                from: 'users',
                localField: 'ownerId',
                foreignField: '_id',
                as: 'user'
              }
            },
            {
              $lookup: {
                from: 'category3',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'category3'
              }
            },
            {
              $lookup: {
                from: 'category2',
                localField: 'categoryiii.ascendantId',
                foreignField: '_id',
                as: 'category2'
              }
            },
            {
              $lookup: {
                from: 'category1',
                localField: 'categoryii.ascendantId',
                foreignField: '_id',
                as: 'category1'
              }
            },
            {
              $addFields: {
                owner: { $arrayElemAt: ['$user', 0] },
                category3: { $arrayElemAt: ['$category3', 0] },
                category2: { $arrayElemAt: ['$category2', 0] },
                category1: { $arrayElemAt: ['$category1', 0] }
              }
            },
            { $project: { user: 0 } }
          ]
  */

  let resolverItems = {}
  resolverItems = {}
  resolverItems.Query = {
    [`search${capitalizeName}`]: async (root, args, { mongo, user }) => {
      const collection = mongo.collection(args.module)

      const { query, sortBy, page, rowsPerPage } = generateQuery(args)

      const ownerLookup = [
        {
          $lookup: {
            from: 'user',
            localField: 'ownerId',
            foreignField: '_id',
            as: 'user'
          }
        }
      ]
      if (schema.lookups) {
        schema.lookups.map(lookup => {
          delete lookup.$lookup.pick
        })
      }
      const aggrItems = schema.lookups
        ? [...ownerLookup, ...schema.lookups]
        : [...ownerLookup]

      const addFields = {
        $addFields: {
          owner: { $arrayElemAt: ['$user', 0] }
        }
      }
      if (schema.lookups) {
        schema.lookups.forEach(lookup => {
          addFields.$addFields[lookup.$lookup.as] = {
            $arrayElemAt: ['$' + lookup.$lookup.as, 0]
          }
        })
      }
      aggrItems.push(addFields)

      const project = { $project: { user: 0 } }
      aggrItems.push(project)

      const match = { $match: query }
      aggrItems.push(match)

      console.log('aggregation aggrItems :', aggrItems)

      const total = await collection.find(query).count()
      const retItems = (await collection
        // Reference 검색만 제외하고 검색
        // reference lookup 하고 unwind
        .aggregate(aggrItems)
        // .find(query)
        .sort(sortBy)
        .skip(page > 0 ? (page - 1) * rowsPerPage : 0)
        .limit(rowsPerPage)
        .toArray()).map(prepare)
      console.log('aggregation retItems :', retItems)
      return { total: total, module: args.module, items: retItems }
    }
  }

  // if (capitalizeName !== 'User') {
  //   resolverItems[`${capitalizeName}`] = {
  //     owner: async (root, args, { mongo }) => {
  //       const owner = prepare(
  //         await mongo.collection('user').findOne({
  //           _id: ObjectId(root.ownerId)
  //         })
  //       )
  //       return owner
  //     }
  //   }
  // }

  schema.fields.forEach(field => {
    if (!hasNormalScalar(field.type)) {
      const resolverItem = async (root, args, { mongo }) => {
        const collectionName = field.type
          .toLowerCase()
          .replace('!', '')
          .replace('[', '')
          .replace(']', '')
        const queryFieldName = field.name + 'Id'
        console.log('resolverItem :', collectionName, queryFieldName)
        let item = null
        if (field.type.includes('[')) {
          item = (await mongo
            .collection(collectionName)
            .find({
              _id: ObjectId(root[queryFieldName])
            })
            .toArray()).map(prepare)
        } else {
          item = prepare(
            await mongo.collection(collectionName).findOne({
              _id: ObjectId(root[queryFieldName])
            })
          )
        }
        return item
      }

      if (resolverItems[capitalizeName] === undefined)
        resolverItems[capitalizeName] = {}
      resolverItems[capitalizeName][field.name] = resolverItem
    }
  })
  console.log('resolverItems', resolverItems)
  return resolverItems
}

export { prepare }
export { generateQuery }

export { typeDef }
export { resolvers }
