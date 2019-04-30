import { createPerimeter, AccessDenied } from 'vue-kindergarten'

export default createPerimeter({
  purpose: 'admin',

  can: {
    route() {
      return this.isAdmin()
    },
    read() {
      return this.isAdmin()
    },
    update() {
      return this.isAdmin()
    },
    destroy(article) {
      return this.isAllowed('update', article)
    }
  },

  secretNotes(article) {
    try {
      this.guard('update', article)
    } catch (e) {
      if (e instanceof AccessDenied) {
        return ''
      } else {
        return ''
      }
    }
    return article.content
  },

  isAdmin() {
    return this.child && this.child.admin === true
  },

  isModerator() {
    return this.child && this.child.role === 'moderator'
  },

  isCreator(article) {
    return this.child && this.child.email === article.author.email
  },

  expose: ['secretNotes']
})
