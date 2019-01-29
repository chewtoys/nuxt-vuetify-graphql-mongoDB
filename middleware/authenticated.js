export default function({ store: { state }, route: { params }, redirect }) {
  if (!state.accessToken) {
    return redirect('/signup')
  }
}
