import Vuex from 'vuex'
import checkAuth from '~/middleware/check-auth'
// import pages from './modules/pages'
// import user from './modules/user'
// import post from './modules/post'
import modules from './modules'

export const state = () => ({
  viewer: null,
  autoSchemas: [],
  autoModule: ''
})

export const getters = {
  getAutoSchema: state => moduleName => {
    return state.autoSchemas.find(s => s.name === moduleName)
  },
  getAutoModule: state => {
    return state.autoModule
  }
}

export const mutations = {
  SET_AUTO_SCHEMA: (state, payload) => {
    state.autoSchemas = [
      ...state.autoSchemas.filter(s => s.name !== payload.name),
      payload
    ]
  },
  SET_AUTO_MODULE: (state, payload) => {
    state.autoModule = payload
  }
}

const actions = {
  nuxtServerInit(store, context) {
    console.log('nuxtServerInit')
    context.store = store
    checkAuth(context)
  }
}
const store = new Vuex.Store({ state, mutations, getters, actions, modules })
const createStore = () => {
  return store
  // modules: {
  //   pages,
  //   user,
  //   post
  // }
}

export default createStore
