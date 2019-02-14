import Cookies from 'js-cookie'
import Vuex from 'vuex'
import postsByTitle from '../graphql/query/posts.gql'
import addPost from '../graphql/mutation/addPost.gql'
import deletePost from '../graphql/mutation/deletePost.gql'
import pages from './pages'

export const state = () => ({
  viewer: null,
  accessToken: null,
  user: null,
  posts: []
})

export const getters = {
  isAuthenticated(state) {
    return Boolean(state.accessToken)
  },
  isUser(state) {
    return Boolean(state.accessToken) && Boolean(state.user)
  },
  isGuest(state) {
    return !state.accessToken
  },
  loggedInUser(state) {
    return state.user
  },
  postList(state) {
    return state.posts
  }
}

export const mutations = {
  SET_ACCESS_TOKEN(state, accessToken) {
    state.accessToken = accessToken
  },
  SET_USER(state, user) {
    state.user = user
  },
  LOGOUT(state, user) {
    state.accessToken = null
    state.user = null
    Cookies.remove('accessToken')
    Cookies.remove('user')
  },
  POST_LIST(state, posts) {
    state.posts = posts
  },
  ADD_POST(state, post) {
    state.posts.push(post)
  },
  DELETE_POST(state, id) {
    const index = state.posts.findIndex(post => post._id === id)
    state.posts.splice(index, 1)
  }
}

const actions = {
  signin(context, signin) {
    context.commit('SET_ACCESS_TOKEN', signin.accessToken)
    context.commit('SET_USER', signin.user)
    Cookies.set('accessToken', signin.accessToken, {
      expires: 1
    })
    Cookies.set('user', signin.user, { expires: 1 })
  },
  logout(context) {
    context.commit('LOGOUT')
  },
  async postList(context) {
    try {
      if (this.app.apolloProvider.defaultClient) {
        const title = 'this.post'
        const posts = await this.app.apolloProvider.defaultClient.query({
          query: postsByTitle,
          variables: { title }
        })
        console.log('posts.postsByTitle :', posts.data.postsByTitle)
        context.commit('POST_LIST', posts.data.postsByTitle)
      }
    } catch (error) {
      console.log('error :', error)
      // this.loading--
      this.errors.push(error.message)
      console.log(JSON.stringify(error))
      return null
    }
  },
  async addPost(context, { title, content }) {
    try {
      const post = await this.app.apolloProvider.defaultClient.mutate({
        mutation: addPost,
        variables: { title, content }
      })
      context.commit('ADD_POST', post.data.addPost)
    } catch (error) {
      console.log('error :', error)
      this.loading--
      this.errors.push(error.message)
      console.log(JSON.stringify(error))
    }
  },
  async deletePost(context, { id }) {
    try {
      const result = await this.app.apolloProvider.defaultClient.mutate({
        mutation: deletePost,
        variables: { id }
      })
      console.log('deletePost > result:', result)
      if (result.data.deletePost) context.commit('DELETE_POST', id)
    } catch (error) {
      console.log('error:', error)
    }
  },
  nuxtServerInit(context, { req }) {
    console.log('nuxtServerInit')
  }
}

const createStore = () => {
  return new Vuex.Store({
    state,
    mutations,
    getters,
    actions,
    modules: {
      pages
    }
  })
}

export default createStore
