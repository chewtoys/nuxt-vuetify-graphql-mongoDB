import Vuex from 'vuex'
import checkAuth from '~/middleware/check-auth'
// import pages from './modules/pages'
// import user from './modules/user'
// import post from './modules/post'
import modules from './modules'

export const state = () => ({
  viewer: null
})

export const getters = {}

export const mutations = {}

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
