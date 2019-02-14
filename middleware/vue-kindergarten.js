import { createSandbox } from 'vue-kindergarten'
import RouteGoverness from '~/kindergarten/governesses/RouteGoverness'

import child from '~/kindergarten/child'

export default context => {
  const { route, redirect, store } = context
  route.matched.some(routeRecord => {
    const options = routeRecord.components.default.options
    const perimeter = options.routePerimeter

    if (perimeter) {
      const Governess = options.routeGoverness || RouteGoverness
      const action = options.routePerimeterAction || 'route'
      const sandbox = createSandbox(child(store), {
        governess: new Governess(context),
        perimeters: [perimeter]
      })
      return sandbox.guard(action, { redirect })
    }
  })
}
