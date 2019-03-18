import typeQuery from '~/graphql/type/type.gql'
import retrievePosts from '~/graphql/post/retrievePosts.gql'
import addPost from '~/graphql/post/addPost.gql'
import updatePost from '~/graphql/post/updatePost.gql'
import deletePost from '~/graphql/post/deletePost.gql'

const post = {
  namespaced: true,
  state: {
    gqlTypes: null,
    posts: []
  },
  getters: {
    gqlTypes(state) {
      return state.gqlTypes
    },
    posts(state) {
      return state.posts
    },
    post: state => _id => {
      return state.posts.find(p => p._id === _id)
    }
  },
  mutations: {
    SET_GQL_TYPES(state, gqlTypes) {
      state.gqlTypes = gqlTypes
    },
    SET_POSTS(state, posts) {
      state.posts = posts
    },
    ADD_POST(state, post) {
      state.posts.push(post)
    },
    DELETE_POST(state, post) {
      const index = state.posts.findIndex(p => p._id === post._id)
      state.posts.splice(index, 1)
    },
    UPDATE_POST(state, post) {
      state.posts = [...state.posts.filter(p => p._id !== post._id), post]
    }
  },
  actions: {
    async retrieveGqlTypes(context, { name }) {
      try {
        if (this.app.apolloProvider.defaultClient) {
          const gqlTypes = await this.app.apolloProvider.defaultClient.query({
            query: typeQuery,
            variables: { name: name }
          })
          context.commit('SET_GQL_TYPES', gqlTypes.data)
        }
      } catch (error) {
        console.log(JSON.stringify(error))
        return null
      }
    },
    async retrievePosts(context, payload) {
      try {
        if (this.app.apolloProvider.defaultClient) {
          const posts = await this.app.apolloProvider.defaultClient.query({
            query: retrievePosts,
            variables: payload
          })
          context.commit('SET_POSTS', posts.data.retrievePosts)
        }
      } catch (error) {
        console.log(JSON.stringify(error))
        return null
      }
    },
    async addPost(context, payload) {
      try {
        const post = await this.app.apolloProvider.defaultClient.mutate({
          mutation: addPost,
          variables: payload
        })
        context.commit('ADD_POST', post.data.addPost)
      } catch (error) {
        console.log(JSON.stringify(error))
      }
    },
    async updatePost(context, payload) {
      try {
        const post = await this.app.apolloProvider.defaultClient.mutate({
          mutation: updatePost,
          variables: payload
        })
        context.commit('UPDATE_POST', post.data.updatePost)
      } catch (error) {
        console.log(JSON.stringify(error))
      }
    },
    async deletePost(context, payload) {
      try {
        const result = await this.app.apolloProvider.defaultClient.mutate({
          mutation: deletePost,
          variables: payload
        })
        if (result.data.deletePost) context.commit('DELETE_POST', payload)
      } catch (error) {
        console.log(JSON.stringify(error))
      }
    }
  }
}

export default post
