exports = module.exports = {}
exports.iif = function(cond, value) {
  if (cond) return value
  return ''
}
exports.capitalize = function(inputString, first) {
  let ret = ''
  if (first) {
    ret = inputString.charAt(0).toUpperCase() + inputString.slice(1)
  } else ret = inputString.toUpperCase()
  return ret
}
