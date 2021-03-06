import typeQuery from '~/graphql/type/type.gql'
// import { search } from '~/graphql/modules/common.gql'
import { generateGql } from '../../server/graphql/commonGql'

const storeModule = (autoSchema, autoSchemas) => {
  const name = autoSchema.name
  const moduleFields = autoSchema.fields
  // console.log('storeModule > name :', name)
  // console.log('storeModule > moduleFields :', moduleFields)
  const typeDef = generateGql(name, moduleFields, autoSchemas)
  return {
    namespaced: true,
    state() {
      return {
        gqlTypes: null,
        total: 0,
        items: []
      }
    },
    getters: {
      gqlTypes: state => {
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
      UPDATE_ITEM(state, payload) {
        // console.log('UPDATE_ITEM :', payload)
        // state.items = [
        //   ...state.items.filter(p => p._id !== payload.item._id),
        //   payload.item
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
        console.log('common store > search :', payload)
        payload.module = name
        try {
          if (this.app.apolloProvider.defaultClient) {
            const result = await this.app.apolloProvider.defaultClient.query({
              query: typeDef.search,
              variables: payload
            })
            context.commit('SET_ITEMS', result.data.search)
          }
        } catch (error) {
          console.log(JSON.stringify(error))
          return null
        }
      },
      async addItem(context, payload) {
        console.log('common store > add Item :', payload)
        payload = { module: name, payload: payload }
        try {
          const result = await this.app.apolloProvider.defaultClient.mutate({
            mutation: typeDef.addItem,
            variables: payload
          })
          context.commit('ADD_ITEM', result.data.addItem)
        } catch (error) {
          console.log(JSON.stringify(error))
        }
      },
      async updateItem(context, payload) {
        console.log('common store > updateItem payload :', payload)

        payload = { module: name, payload: payload }
        try {
          const result = await this.app.apolloProvider.defaultClient.mutate({
            mutation: typeDef.updateItem,
            variables: payload
          })
          context.commit('UPDATE_ITEM', result.data.updateItem)
        } catch (error) {
          console.log(JSON.stringify(error))
        }
      },
      async deleteItem(context, payload) {
        console.log('common store > deleteItem payload :', payload)

        payload = { module: name, _id: payload._id }
        try {
          const result = await this.app.apolloProvider.defaultClient.mutate({
            mutation: typeDef.deleteItem,
            variables: payload
          })
          if (result.data.deleteItem) context.commit('DELETE_ITEM', payload)
        } catch (error) {
          console.log(JSON.stringify(error))
        }
      },
      async deleteItems(context, payload) {
        console.log('common store > deleteItems payload :', payload)

        payload = { module: name, _ids: payload._ids }
        try {
          const result = await this.app.apolloProvider.defaultClient.mutate({
            mutation: typeDef.deleteItems,
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
