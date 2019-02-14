import { createPerimeter, AccessDenied } from 'vue-kindergarten'

export default createPerimeter({
  purpose: 'article',

  can: {
    route: () => true,
    read: () => true,
    update(article) {
      return this.isAdmin() || this.isCreator(article) || this.isModerator()
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
    return this.child && this.child.role === 'admin'
  },

  isModerator() {
    return this.child && this.child.role === 'moderator'
  },

  isCreator(article) {
    return this.child && this.child.email === article.author.email
  },

  expose: ['secretNotes']
})
