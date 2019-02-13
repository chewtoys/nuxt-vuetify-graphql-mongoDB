import { createSandbox } from 'vue-kindergarten'
import RouteGoverness from '~/kindergarten/governesses/RouteGoverness'

import child from '~/kindergarten/child'

export default context => {
  const { route, redirect, store } = context
  route.matched.some(routeRecord => {
    // console.log('routeRecord :', routeRecord)
    const options = routeRecord.components.default.options
    const perimeter = options.routePerimeter
    const Governess = options.routeGoverness || RouteGoverness
    const action = options.routePerimeterAction || 'route'

    if (perimeter) {
      const sandbox = createSandbox(child(store), {
        governess: new Governess(context),

        perimeters: [perimeter]
      })
      // console.log('action :', action)
      // console.log('sandbox :', sandbox)
      return sandbox.guard(action, { redirect })
    }
    // console.log('context :', context)
    // redirect(route.path)
  })
}
