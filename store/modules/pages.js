const pages = {
  namespaced: true,
  state: {
    pages: [
      {
        id: 'index',
        root: {
          label: 'page',
          type: 'container',
          nodes: [
            {
              label: 'layout1',
              type: 'layout',
              nodes: [
                {
                  label: 'flex1.1',
                  type: 'flex'
                },
                {
                  label: 'flex1.2',
                  type: 'flex',
                  comp: 'helloWorld'
                }
              ]
            },
            {
              label: 'layout2',
              type: 'layout'
            }
          ]
        }
      }
    ]
  },
  getters: {
    fullname: state => `${state.firstname} ${state.lastname}`,
    getPageById: state => id => {
      return state.pages.find(page => page.id === id).root
    }
  },
  mutations: {
    updatemail(state, email) {
      state.email = email
    }
  },
  actions: {
    emailupdate(context, email) {
      context.commit('updatemail', email)
    }
  }
}

export default pages
