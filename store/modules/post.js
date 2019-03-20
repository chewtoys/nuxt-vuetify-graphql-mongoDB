import typeQuery from '~/graphql/type/type.gql'
import retrievePosts from '~/graphql/post/retrievePosts.gql'
import addPost from '~/graphql/post/addPost.gql'
import updatePost from '~/graphql/post/updatePost.gql'
import deletePost from '~/graphql/post/deletePost.gql'
import deletePosts from '~/graphql/post/deletePosts.gql'

const post = {
  namespaced: true,
  state: {
    gqlTypes: null,
    total: 0,
    posts: []
  },
  getters: {
    gqlTypes(state) {
      return state.gqlTypes
    },
    total(state) {
      return state.total
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
    SET_POSTS(state, postsPage) {
      state.total = postsPage.total
      state.posts = postsPage.posts
    },
    ADD_POST(state, post) {
      // state.posts.push(post)
      ++state.total
    },
    DELETE_POST(state, post) {
      --state.total
    },
    DELETE_POSTS(state, _ids) {
      const len = _ids.length
      state.total -= len
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
            variables: { name: name },
            fetchPolicy: 'no-cache'
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
          const postsPage = await this.app.apolloProvider.defaultClient.query({
            query: retrievePosts,
            variables: payload
          })
          context.commit('SET_POSTS', postsPage.data.retrievePosts)
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
    },
    async deletePosts(context, payload) {
      try {
        const result = await this.app.apolloProvider.defaultClient.mutate({
          mutation: deletePosts,
          variables: payload
        })
        if (result.data.deletePosts) context.commit('DELETE_POSTS', payload)
      } catch (error) {
        console.log(JSON.stringify(error))
      }
    }
  }
}

export default post
