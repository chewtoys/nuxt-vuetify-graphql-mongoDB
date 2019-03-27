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

const pick = (obj, keys, scheme) => {
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

export { pick }
export { capitalize }
export { objToKindAndValue }
export { objFromKindAndValue }
