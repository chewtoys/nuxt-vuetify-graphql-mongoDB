const prepare = o => {
  o._id = o._id.toString()
  return o
}

const generateQuery = args => {
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

  return { query: query, page: page, rowsPerPage: rowsPerPage, sortBy: sortBy }
}

exports.prepare = prepare
exports.generateQuery = generateQuery
