/*eslint no-inner-declarations: 2*/
/*eslint-env es6*/
<template>
  <div>
    <post-form
      :_id="post._id"
      :title="post.title"
      :content="post.content"
      v-on:update="register($event, post)"
    ></post-form>
  </div>
</template>

<script>
// import postsByTitle from '../graphql/query/posts.gql'
import { mapActions } from 'vuex'
import articlesPerimeter from '~/kindergarten/perimeters/articles'
import postForm from '@/components/post/form'
export default {
  name: 'post',
  // middleware: 'authenticated',
  components: { postForm },
  perimeters: [articlesPerimeter],
  routePerimeter: articlesPerimeter,
  data() {
    return {
      loading: 0,
      errors: []
    }
  },
  computed: {
    post() {
      console.log(' post :', this.$store.getters.post(this.$route.params.id))
      return this.$store.getters.post(this.$route.params.id)
    }
  },
  methods: {
    async register({ _id, title, content }) {
      console.log('register  :', _id, title, content)
      await this.$store.dispatch('updatePost', {
        _id: _id,
        title: title,
        content: content
      })
      this.$router.push('/post/' + this.$route.params.id)
    },
    ...mapActions(['addPost'])
  }
}
</script>

<style scoped>
.register-card {
  max-width: 340px;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 2px 1px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
}
.submit-button {
  width: 100%;
}
.error {
  margin-bottom: 10px;
}
</style>
