import { parse } from 'cookie'
import Cookies from 'js-cookie'

export default function({ store, app, req }) {
  if (!store.getters.isAuthenticated) {
    const accessToken = process.server
      ? parse(req.headers.cookie || '').accessToken
      : Cookies.get('accessToken')
    if (accessToken) store.commit('SET_ACCESS_TOKEN', accessToken)
    if (!store.getters.loggedInUser) {
      const user = process.server
        ? parse(req.headers.cookie || '').user
        : Cookies.get('user')
      if (user) store.commit('SET_USER', JSON.parse(user))
    }
  }
}
