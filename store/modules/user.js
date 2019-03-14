import Cookies from 'js-cookie'
import updateUser from '~/graphql/mutation/updateUser.gql'
import users from '~/graphql/query/users.gql'
import signin from '~/graphql/mutation/signin.gql'
import signup from '~/graphql/mutation/signup.gql'

const user = {
  namespaced: true,
  state: {
    accessToken: null,
    user: null,
    users: []
  },
  getters: {
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
    users(state) {
      return state.users
    }
  },
  mutations: {
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
    USER_LIST(state, users) {
      state.users = users
    },
    UPDATE_USER(state, user) {
      state.users = [
        ...state.users.filter(element => element.email !== user.email),
        user
      ]
    }
  },
  actions: {
    async signin(context, payload) {
      try {
        const result = await this.app.apolloProvider.defaultClient.mutate({
          mutation: signin,
          variables: {
            email: payload.email,
            password: payload.password
          }
        })
        context.commit('SET_ACCESS_TOKEN', result.data.signin.accessToken)
        context.commit('SET_USER', result.data.signin.user)
        Cookies.set('accessToken', result.data.signin.accessToken, {
          expires: 1
        })
        Cookies.set('user', result.data.signin.user, { expires: 1 })
      } catch (error) {
        console.log(JSON.stringify(error))
        return null
      }
    },
    async signup(context, payload) {
      try {
        const result = await this.app.apolloProvider.defaultClient.mutate({
          mutation: signup,
          variables: {
            email: payload.email,
            password: payload.password,
            name: payload.name
          }
        })
        Cookies.set('accessToken', result.data.signup.accessToken, {
          expires: 1
        })
        context.commit('SET_ACCESS_TOKEN', result.data.signup.accessToken)
        context.commit('SET_USER', result.data.signup.user)
      } catch (error) {
        console.log(JSON.stringify(error))
        return null
      }
    },
    logout(context) {
      context.commit('LOGOUT')
    },
    async userList(context) {
      try {
        if (this.app.apolloProvider.defaultClient) {
          const title = 'this.post'
          const userList = await this.app.apolloProvider.defaultClient.query({
            query: users,
            variables: { title }
          })
          context.commit('USER_LIST', userList.data.users)
        }
      } catch (error) {
        console.log(JSON.stringify(error))
        return null
      }
    },
    async updateUser(context, payload) {
      try {
        const user = await this.app.apolloProvider.defaultClient.mutate({
          mutation: updateUser,
          variables: { ...payload }
        })
        const nuser = Object.assign(payload, user.data.updateUser)
        context.commit('UPDATE_USER', nuser)
      } catch (error) {
        console.log(JSON.stringify(error))
      }
    }
  }
}

export default user
