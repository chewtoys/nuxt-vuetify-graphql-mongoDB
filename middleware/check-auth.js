import { parse } from 'cookie'
import Cookies from 'js-cookie'

export default function({ store, app, req }) {
  if (!store.getters['sign/isAuthenticated']) {
    const accessToken = process.server
      ? parse(req.headers.cookie || '').accessToken
      : Cookies.get('accessToken')
    if (accessToken) store.commit('sign/SET_ACCESS_TOKEN', accessToken)
    if (!store.getters['sign/loggedInUser']) {
      const user = process.server
        ? parse(req.headers.cookie || '').user
        : Cookies.get('user')
      if (user) store.commit('sign/SET_USER', JSON.parse(user))
    }
  }
}
