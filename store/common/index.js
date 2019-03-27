import typeQuery from '~/graphql/type/type.gql'
import {
  search,
  addItem,
  updateItem,
  deleteItem,
  deleteItems
} from '~/graphql/modules/common.gql'

const storeModule = name => {
  console.log('storeModule > name :', name)
  return {
    namespaced: true,
    state: {
      gqlTypes: null,
      total: 0,
      items: []
    },
    getters: {
      gqlTypes(state) {
        return state.gqlTypes
      },
      total(state) {
        return state.total
      },
      items(state) {
        return state.items
      },
      item: state => _id => {
        return state.items.find(p => p._id === _id)
      }
    },
    mutations: {
      SET_GQL_TYPES(state, gqlTypes) {
        state.gqlTypes = gqlTypes
      },
      SET_ITEMS(state, postsPage) {
        state.total = postsPage.total
        state.items = postsPage.items
      },
      ADD_ITEM(state, post) {
        // state.items.push(post)
        // ++state.total
      },
      DELETE_ITEM(state, post) {
        // --state.total
      },
      DELETE_ITEMS(state, _ids) {
        // state.total -= _ids.length
      },
      UPDATE_ITEM(state, updated) {
        // state.items = [
        //   ...state.items.filter(p => p._id !== post._id),
        //   updated.item
        // ]
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
      async search(context, payload) {
        payload.module = name
        try {
          if (this.app.apolloProvider.defaultClient) {
            const postsPage = await this.app.apolloProvider.defaultClient.query(
              {
                query: search,
                variables: payload
              }
            )
            context.commit('SET_ITEMS', postsPage.data.search)
          }
        } catch (error) {
          console.log(JSON.stringify(error))
          return null
        }
      },
      async addItem(context, payload) {
        console.log('add Item :', payload)
        payload = { module: name, payload: payload }
        try {
          const post = await this.app.apolloProvider.defaultClient.mutate({
            mutation: addItem,
            variables: payload
          })
          context.commit('ADD_ITEM', post.data.addItem)
        } catch (error) {
          console.log(JSON.stringify(error))
        }
      },
      async updateItem(context, payload) {
        console.log('updateItem payload :', payload)

        payload = { module: name, payload: payload }
        try {
          const post = await this.app.apolloProvider.defaultClient.mutate({
            mutation: updateItem,
            variables: payload
          })
          context.commit('UPDATE_ITEM', post.data.updateItem)
        } catch (error) {
          console.log(JSON.stringify(error))
        }
      },
      async deleteItem(context, payload) {
        console.log('deleteItem payload :', payload)

        payload = { module: name, _id: payload._id }
        try {
          const result = await this.app.apolloProvider.defaultClient.mutate({
            mutation: deleteItem,
            variables: payload
          })
          if (result.data.deleteItem) context.commit('DELETE_ITEM', payload)
        } catch (error) {
          console.log(JSON.stringify(error))
        }
      },
      async deleteItems(context, payload) {
        console.log('deleteItems payload :', payload)

        payload = { module: name, _ids: payload._ids }
        try {
          const result = await this.app.apolloProvider.defaultClient.mutate({
            mutation: deleteItems,
            variables: payload
          })
          if (result.data.deleteItems) context.commit('DELETE_ITEMS', payload)
        } catch (error) {
          console.log(JSON.stringify(error))
        }
      }
    }
  }
}

export default storeModule
