import Vuex from 'vuex'

import pages from './pages'

export const state = () => ({
  viewer: null,
  accessToken: null
})

export const getters = {
  isAuthenticated(state) {
    return Boolean(state.accessToken)
  },
  isGuest(state) {
    return !state.accessToken
  }
}

export const mutations = {
  SET_ACCESS_TOKEN(state, accessToken) {
    state.accessToken = accessToken
  }
}
const createStore = () => {
  return new Vuex.Store({
    state,
    mutations,
    getters,
    modules: {
      pages
    }
  })
}

export default createStore
