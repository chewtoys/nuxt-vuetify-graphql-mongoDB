import Vuex from 'vuex'
import checkAuth from '~/middleware/check-auth'
// import pages from './modules/pages'
// import user from './modules/user'
// import post from './modules/post'
import modules from './modules'

export const state = () => ({
  viewer: null,
  autoSchemas: []
})

export const getters = {
  getAutoSchema: state => moduleName => {
    return state.autoSchemas.find(s => s.name === moduleName)
  }
}

export const mutations = {
  SET_AUTO_SCHEMA: (state, payload) => {
    console.log('SET_AUTO_SCHEMA', payload)
    state.autoSchemas = [
      ...state.autoSchemas.filter(s => s.name !== payload.name),
      payload
    ]
  }
}

const actions = {
  nuxtServerInit(store, context) {
    console.log('nuxtServerInit')
    context.store = store
    checkAuth(context)
  }
}

const createStore = () => {
  return new Vuex.Store({ state, mutations, getters, actions, modules })
  // modules: {
  //   pages,
  //   user,
  //   post
  // }
}

export default createStore
