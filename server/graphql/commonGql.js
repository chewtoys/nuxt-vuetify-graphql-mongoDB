import { capitalize } from '../../utils'

const gql = require('graphql-tag')

const generateGql = (moduleName, moduleFields) => {
  const name = capitalize(moduleName, true)
  let fieldsValue = ''
  moduleFields.forEach(field => {
    fieldsValue += field.name + '\n'
  })
  const typeDef = gql`

  query search(
    $module: String!
    $ids: [String]
    $keywords: keywordsInput
    $period: periodInput
    $range: rangeInput
    $users: usersInput
    $pagination: paginationInput
  ) {
    search: search(
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

  const gl = {
    search: { kind: 'Document', definitions: [typeDef.definitions[0]] },
    addItem: { kind: 'Document', definitions: [typeDef.definitions[1]] },
    updateItem: { kind: 'Document', definitions: [typeDef.definitions[2]] },
    deleteItem: { kind: 'Document', definitions: [typeDef.definitions[3]] },
    deleteItems: { kind: 'Document', definitions: [typeDef.definitions[4]] }
  }
  return gl
}

export { generateGql }
