function isEmpty(obj) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) return false
  }
  return true
}

const objToKindAndValue = obj => {
  const inputs = []
  Object.keys(obj).forEach(key => {
    inputs.push({ kind: key, value: obj[key] })
  })
  // return [{ kind: '_id', value: 'dklsklsl' }]
  return inputs
}

const objFromKindAndValue = kv => {
  const inputs = []
  kv.forEach(obj => {
    inputs.push({ [`${obj.kind}`]: obj.value })
  })
  // return [{ kind: '_id', value: 'dklsklsl' }]
  return inputs
}

const capitalize = (inputString, first) => {
  let ret = ''
  if (first) {
    ret = inputString.charAt(0).toUpperCase() + inputString.slice(1)
  } else ret = inputString.toUpperCase()
  return ret
}

// if each key exists in the Object then reamin the value that is converted by using schema(arg3)
const pick = (obj, keys, scheme) => {
  // console.log('(obj, keys, scheme)  :', obj, keys, scheme)
  return keys
    .map(k => (k in obj ? { [k]: convertProperType(k, obj[k], scheme) } : {}))
    .reduce((res, o) => Object.assign(res, o), {})
}

const convertProperType = (key, value, scheme) => {
  let converted = null
  scheme.forEach(schema => {
    if (schema.key === key) {
      switch (schema.type) {
        case 'Int':
          converted = parseInt(value)
          break
        case 'ID':
        case 'String':
        default:
          converted = value
      }
    }
  })
  return converted
}

const normalScalar = ['String', 'Int', 'Float', 'ID', 'Boolean', 'Date', 'Any']
const hasNormalScalar = scalar => {
  const isNormalScalar = normalScalar.some(ns => {
    return scalar.includes(ns)
  })
  // console.log('hasNormalScalar :', scalar, isNormalScalar)
  return isNormalScalar
}

const getSchemaTypeByKey = (key, schema) => {
  let type = ''
  schema.map(field => {
    // console.log('getSchemaTypeByKey :', key, field.key)
    if (key === field.key) {
      type = field.type
      // return true
    }
  })
  // console.log('getSchemaTypeByKey :', key, type)
  return type
}

const getRefSchema = (refName, schemas) => {
  // console.log('getRefSchema :', refName, schemas)
  let refSchema = {}
  schemas.every(schema => {
    if (schema.name === refName) {
      refSchema = Object.assign({}, schema)
      return false
    }
    return true
  })
  return refSchema
}

const searchableFields = () => {
  return [
    { key: '_id', type: 'ID!' },
    { key: 'created', type: 'Date' },
    { key: 'updated', type: 'Date' }
  ]
}

const searchableFieldsString = () => {
  let fieldsString = ''
  // console.log('searchableFields : \n', searchableFields())
  searchableFields().forEach(f => {
    fieldsString += f.key + ':' + f.type + '\n'
  })
  // console.log('fieldsString : \n', fieldsString)
  return fieldsString
}

export { isEmpty }
export { pick }
export { capitalize }
export { objToKindAndValue }
export { objFromKindAndValue }
export { hasNormalScalar }
export { getSchemaTypeByKey }
export { getRefSchema }
export { searchableFields }
export { searchableFieldsString }
