export const typeDef = `
  
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

`
