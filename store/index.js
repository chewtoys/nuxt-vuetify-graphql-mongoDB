import Vuex from 'vuex'
import checkAuth from '~/middleware/check-auth'
import { capitalize } from '../utils'
import schemas from '../autoSchemas.js'
import registerStoreModule from '../store/common'
import modules from './modules'

const autoSchemas = schemas()

console.log('autoSchemas :', autoSchemas)

autoSchemas.forEach(autoSchema => {
  modules[autoSchema.name] = registerStoreModule(autoSchema, autoSchemas)
})
// console.log('modules :', modules)

export const state = () => ({
  viewer: null,
  autoSchemas: [],
  autoModule: '',
  adminMenu: [
    {
      icon: 'arrow_back',
      title: 'Back',
      to: '/'
    },
    {
      icon: 'apps',
      title: 'Home',
      to: '/admin'
    },
    {
      icon: 'people',
      title: 'Users',
      to: '/admin/users'
    }
  ]
})

export const getters = {
  getAutoSchema: state => moduleName => {
    return state.autoSchemas.find(s => s.name === moduleName)
  },
  getAutoModule: state => {
    return state.autoModule
  },
  getAutoSchemas: state => {
    return state.autoSchemas
  },
  getAdminMenu: state => {
    return state.adminMenu
  }
}

export const mutations = {
  SET_AUTO_SCHEMA: (state, payload) => {
    state.autoSchemas = [
      ...state.autoSchemas.filter(s => s.name !== payload.name),
      payload
    ]
  },
  SET_AUTO_SCHEMAS: (state, payload) => {
    state.autoSchemas = payload
    console.log('SET_AUTO_SCHEMAS :', payload)
  },
  SET_AUTO_MODULE: (state, payload) => {
    state.autoModule = payload
  },
  SET_ADMIN_MENU: (state, payload) => {
    const name = payload
    const item = {}
    item.icon = 'toc'
    item.title = capitalize(name, true)
    item.to = `/admin/common/${name}`
    // state.adminMenu.push(item)
    state.adminMenu = [
      ...state.adminMenu.filter(s => s.title !== item.title),
      item
    ]
  }
}

const actions = {
  nuxtServerInit(store, context) {
    console.log('nuxtServerInit')
    context.store = store
    autoSchemas.forEach(schema => {
      store.commit('SET_ADMIN_MENU', schema.name, true)
    })
    store.commit('SET_AUTO_SCHEMAS', autoSchemas)
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
