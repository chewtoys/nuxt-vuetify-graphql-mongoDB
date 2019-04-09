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
      type: 'cat',
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
      additionWhenAdd: ['specificationId']
    },
    {
      name: 'product',
      fields: [
        { name: 'name', type: 'String!' },
        { name: 'inventory', type: 'Inventory!' },
        { name: 'price', type: 'Int!' },
        { name: 'category', type: 'Category3!' },
        { name: 'currency', type: 'String!' }
      ],
      type: 'cat',
      frontType: 'product',
      canActions: ['add', 'delete']
    }, //   name: 'specification', // { name: 'supplier', type: 'String' } // if it is not specified, admin can have action ui of all cases of add, delete // { name: 'manufacture', type: 'String' }, // { name: 'brand', type: 'String' }, // { name: 'category', type: 'Category' }, // { name: 'specification', type: 'specification' }, // { // create/all/type // product, profile
    //   fields: [
    //     { name: 'name', type: 'String!' },
    //     { name: 'type', type: 'String!' } // text, image
    //   ],
    //   type: 'cat'
    // },
    // {
    //   name: 'generalSpecs',
    //   fields: [
    //     { name: 'imgUrl', type: 'String' },
    //     { name: 'weight', type: 'String' },
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
      type: 'cat'
    },
    {
      name: 'category2',
      fields: [
        { name: 'name', type: 'String!' },
        { name: 'description', type: 'String' },
        { name: 'ascendant', type: 'Category1' }
      ],
      type: 'cat'
    },
    {
      name: 'category3',
      fields: [
        { name: 'name', type: 'String!' },
        { name: 'description', type: 'String' },
        { name: 'ascendant', type: 'Category2' }
      ],
      type: 'cat'
    }
  ]
}

export default schemas
