import { capitalize, hasNormalScalar, getRefSchema } from '../../utils'

const gql = require('graphql-tag')

const makeFields = (
  moduleName,
  moduleType,
  autoSchemas,
  fieldsValue,
  depth
) => {
  const schema = getRefSchema(
    depth === 1 ? moduleName : moduleType,
    autoSchemas
  )

  // console.log('moduleName :', moduleName, depth)
  const doubleTabs = '\t\t'
  const tabs = '\t'.repeat(depth)
  const lookups = []
  if (schema.lookups) {
    schema.lookups.forEach(lookup => {
      lookups.push({
        name: lookup.$lookup.as,
        type: capitalize(lookup.$lookup.from, true)
      })
    })
  }
  // console.log('lookups :', lookups)
  const fields = schema.lookups
    ? [...schema.fields, ...lookups]
    : [...schema.fields]
  // console.log('fields :', fields)
  // if (depth === 1)
  fields.push({ name: '_id', type: 'ID' })
  fields.forEach(field => {
    // console.log('field :', field)
    if (depth === 1) {
      if (hasNormalScalar(field.type))
        fieldsValue += doubleTabs + tabs + field.name + '\n'
      else {
        fieldsValue += '' + doubleTabs + tabs + field.name + '{' + '\n'
        fieldsValue = makeFields(
          field.name,
          field.type.toLowerCase().replace('!', ''),
          autoSchemas,
          fieldsValue,
          depth + 1
        )
        fieldsValue += doubleTabs + tabs + '}' + '\n'
      }
    } else if (depth > 1) {
      if (hasNormalScalar(field.type)) {
        fieldsValue += doubleTabs + tabs + field.name + '\n'
      } else {
        fieldsValue += ''
      }
    }
  })
  // console.log('fields value > ', moduleName, fieldsValue)
  return fieldsValue
}

const generateGql = (moduleName, moduleFields, autoSchemas) => {
  // console.log('moduleName, moduleFields :', moduleName, moduleFields)
  const name = capitalize(moduleName, true)
  let fieldsValue = ''
  const depth = 1
  fieldsValue = makeFields(moduleName, '', autoSchemas, fieldsValue, depth)
  const typeString = `

  query search(
    $module: String!
    $ids: [String]
    $keywords: keywordsInput
    $period: periodInput
    $range: rangeInput
    $users: usersInput
    $pagination: paginationInput
  ) {
    search: search${name}(
      module: $module
      ids: $ids
      keywords: $keywords
      period: $period
      range: $range
      users: $users
      pagination: $pagination
    ) {
      total
      module
      items {
        _id
        updated
        created
        owner {
          email
        }
        ... on ${name} {
          ${fieldsValue}
        }
      }
    }
  }

  mutation addItem($module: String!, $payload: [updateInput]!) {
    addItem: addItem(module: $module, payload: $payload) {
      module
      item {
        _id
        updated
        created
        owner {
          email
        }
        ... on ${name} {
          ${fieldsValue}
        }
      }
    }
  }

  mutation updateItem($module: String!, $payload: [updateInput]!) {
    updateItem: updateItem(module: $module, payload: $payload) {
      module
      item {
        _id
        updated
        created
        owner {
          email
        }
        ... on ${name} {
          ${fieldsValue}
        }
      }
    }
  }

  mutation deleteItem($module: String!, $_id: String!) {
    deleteItem: deleteItem(module: $module, _id: $_id)
  }

  mutation deleteItems($module: String!, $_ids: [String]!) {
    deleteItems: deleteItems(module: $module, _ids: $_ids)
  }

`
  console.log('typeString[' + moduleName + '] : \n', typeString)
  const typeDef = gql(typeString)

  const gl = {
    [`search`]: {
      kind: 'Document',
      definitions: [typeDef.definitions[0]]
    },
    addItem: { kind: 'Document', definitions: [typeDef.definitions[1]] },
    updateItem: { kind: 'Document', definitions: [typeDef.definitions[2]] },
    deleteItem: { kind: 'Document', definitions: [typeDef.definitions[3]] },
    deleteItems: { kind: 'Document', definitions: [typeDef.definitions[4]] }
  }
  return gl
}

export { generateGql }
