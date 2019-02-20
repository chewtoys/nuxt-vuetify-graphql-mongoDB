import { HeadGoverness } from 'vue-kindergarten'

export default class RouteGoverness extends HeadGoverness {
  guard(action, { redirect }) {
    // console.log('RouteGoverness > ', this.isNotAllowed(action))
    if (this.isNotAllowed(action)) {
      redirect('/')
    }
  }
}
