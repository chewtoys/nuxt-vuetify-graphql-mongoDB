import Vuex from 'vuex'

import pages from './pages'

const createStore = () => {
  return new Vuex.Store({
    modules: {
      pages
    }
  })
}

export default createStore
