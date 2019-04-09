export default function({ store, app, req, route, params, env, redirect }) {
  // console.log('params :', params)
  // console.log('store :', store)
  // console.log('route :', route)
  if (params && params.module) {
    const module = params.module
    // console.log('loadStore > module :', module)
    store.commit('SET_AUTO_MODULE', module)
  }
}
