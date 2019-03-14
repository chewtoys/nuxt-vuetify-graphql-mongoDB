import postsByTitle from '~/graphql/query/posts.gql'
import addPost from '~/graphql/mutation/addPost.gql'
import updatePost from '~/graphql/mutation/updatePost.gql'
import deletePost from '~/graphql/mutation/deletePost.gql'

const post = {
  namespaced: true,
  state: {
    posts: []
  },
  getters: {
    postList(state) {
      return state.posts
    },
    post: state => id => {
      return state.posts.find(post => post._id === id)
    }
  },
  mutations: {
    POST_LIST(state, posts) {
      state.posts = posts
    },
    ADD_POST(state, post) {
      state.posts.push(post)
    },
    DELETE_POST(state, id) {
      const index = state.posts.findIndex(post => post._id === id)
      state.posts.splice(index, 1)
    },
    UPDATE_POST(state, post) {
      state.posts = [
        ...state.posts.filter(element => element._id !== post._id),
        post
      ]
    }
  },
  actions: {
    async postList(context) {
      try {
        if (this.app.apolloProvider.defaultClient) {
          const title = 'this.post'
          const posts = await this.app.apolloProvider.defaultClient.query({
            query: postsByTitle,
            variables: { title }
          })
          context.commit('POST_LIST', posts.data.postsByTitle)
        }
      } catch (error) {
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
        console.log(JSON.stringify(error))
      }
    },
    async updatePost(context, { _id, title, content }) {
      try {
        const post = await this.app.apolloProvider.defaultClient.mutate({
          mutation: updatePost,
          variables: { _id, title, content }
        })
        context.commit('UPDATE_POST', post.data.updatePost)
      } catch (error) {
        console.log(JSON.stringify(error))
      }
    },
    async deletePost(context, { id }) {
      try {
        const result = await this.app.apolloProvider.defaultClient.mutate({
          mutation: deletePost,
          variables: { id }
        })
        if (result.data.deletePost) context.commit('DELETE_POST', id)
      } catch (error) {
        console.log('error:', error)
      }
    }
  }
}

export default post
