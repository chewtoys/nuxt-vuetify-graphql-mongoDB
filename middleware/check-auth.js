import { parse } from 'cookie'
import Cookies from 'js-cookie'

export default function({ store, app, req }) {
  if (!store.getters['user/isAuthenticated']) {
    const accessToken = process.server
      ? parse(req.headers.cookie || '').accessToken
      : Cookies.get('accessToken')
    if (accessToken) store.commit('user/SET_ACCESS_TOKEN', accessToken)
    if (!store.getters['user/loggedInUser']) {
      const user = process.server
        ? parse(req.headers.cookie || '').user
        : Cookies.get('user')
      if (user) store.commit('user/SET_USER', JSON.parse(user))
    }
  }
}
