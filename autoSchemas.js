const schemas = () => {
  return [
    {
      name: 'post',
      fields: [
        { name: 'title', type: 'String!' },
        { name: 'content', type: 'String' },
        { name: 'slug', type: 'String' },
        { name: 'like', type: 'Int' }
      ],
      generate: {
        admin: true,
        store: true,
        gql: true,
        typedef: true,
        resolver: true
      },
      frontType: 'article',
      initCollection: true
    },
    {
      name: 'inventory',
      fields: [
        { name: 'name', type: 'String!' },
        { name: 'description', type: 'String' },
        { name: 'amount', type: 'Int!' }
      ],
      type: 'cat',
      initCollection: true
    },
    {
      name: 'product',
      fields: [
        { name: 'name', type: 'String!' },
        { name: 'price', type: 'Int!' },
        { name: 'currency', type: 'String!' }
      ],
      type: 'cat',
      frontType: 'product',
      initCollection: true,
      lookups: [
        // lookups 에 있는 필드는 fields에서 제거 // 프론트 화면 타입 // collection 데이터 모두 삭제 // name은 필수
        {
          $lookup: {
            from: 'inventory',
            localField: 'inventoryId',
            foreignField: '_id',
            as: 'inventory',
            pick: 'true'
          }
        },
        {
          $lookup: {
            from: 'category3',
            localField: 'category3Id',
            foreignField: '_id',
            as: 'category3',
            pick: 'true'
          }
        },
        {
          $lookup: {
            from: 'category2',
            localField: 'category3.ascendantId',
            foreignField: '_id',
            as: 'category2'
          }
        },
        {
          $lookup: {
            from: 'category1',
            localField: 'category2.ascendantId',
            foreignField: '_id',
            as: 'category1'
          }
        }
      ]
    }, //     { name: 'weight', type: 'String' }, //     { name: 'imgUrl', type: 'String' }, //   fields: [ // add/updateItem에서 사용여부 //   name: 'generalSpecs', // { // }, //   type: 'cat' //   ], //     { name: 'type', type: 'String!' } // text, image //     { name: 'name', type: 'String!' }, //   fields: [ //   name: 'specification', // { name: 'supplier', type: 'String' } // if it is not specified, admin can have action ui of all cases of add, delete // { name: 'manufacture', type: 'String' }, // { name: 'brand', type: 'String' }, // { name: 'category', type: 'Category' }, // { name: 'specification', type: 'specification' }, // { // create/all/type // product, profile
    //     { name: 'height', type: 'String' },
    //     { name: 'size', type: 'String' },
    //     { name: 'sizeUnit', type: 'String' },
    //     { name: 'color', type: 'String' },
    //     { name: 'dimention', type: 'String' },
    //     { name: 'etc', type: 'String' }
    //   ],
    //   type: 'cat'
    // },
    // {
    //   name: 'technicalSpecs',
    //   fields: [
    //     { name: 'imgUrl', type: 'String' },
    //     { name: 'bettery', type: 'String' },
    //     { name: 'series', type: 'String' },
    //     { name: 'power', type: 'String' },
    //     { name: 'etc', type: 'String' }
    //   ],
    //   type: 'cat'
    // },
    {
      name: 'category1',
      fields: [
        { name: 'name', type: 'String!' },
        { name: 'description', type: 'String' }
      ],
      type: 'cat',
      initCollection: true
    },
    {
      name: 'category2',
      fields: [
        { name: 'name', type: 'String!' },
        { name: 'description', type: 'String' },
        { name: 'ascendant', type: 'Category1' }
      ],
      type: 'cat',
      initCollection: true
    },
    {
      name: 'category3',
      fields: [
        { name: 'name', type: 'String!' },
        { name: 'description', type: 'String' },
        { name: 'ascendant', type: 'Category2' }
      ],
      type: 'cat',
      initCollection: true
    }
  ]
}

export default schemas
