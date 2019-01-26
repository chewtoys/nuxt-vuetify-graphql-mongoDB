import pages from '~/store/pages'

describe('getters', () => {
  it('filteredProducts', () => {
    // mock state
    const state = {
      pages: [
        {
          id: 'index',
          root: {
            label: 'page',
            type: 'container',
            nodes: [{ label: 'indexLayout', type: 'layout' }]
          }
        },
        {
          id: 'login',
          root: {
            label: 'page',
            type: 'container',
            nodes: [{ label: 'loginLayout', type: 'layout' }]
          }
        }
      ]
    }

    // get the result from the getter
    const result = pages.getters.getPageById(state)('login')
    expect(result).toEqual(state.pages[1].root)
  })
})
