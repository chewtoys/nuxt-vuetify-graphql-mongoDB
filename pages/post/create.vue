/*eslint no-inner-declarations: 2*/
/*eslint-env es6*/
<template>
  <div>
    <v-form>
      <v-text-field v-model="post.title" placeholder="Title" required/>
      <v-text-field label="Write contents here!" v-model="post.content" required></v-text-field>
      <v-layout justify-space-between>
        <v-btn @click="register" class="blue darken-4 white--text">Save</v-btn>
        <nuxt-link to="/">Home</nuxt-link>
      </v-layout>
    </v-form>
  </div>
</template>

<script>
// import postsByTitle from '../graphql/query/posts.gql'
import { mapActions } from 'vuex'
import articlesPerimeter from '~/kindergarten/perimeters/articles'
export default {
  name: 'post',
  // middleware: 'authenticated',
  components: {},
  perimeters: [articlesPerimeter],
  routePerimeter: articlesPerimeter,
  data() {
    return {
      loading: 0,
      errors: [],
      post: {
        title: null,
        content: null
      }
    }
  },
  methods: {
    async register() {
      await this.$store.dispatch('addPost', {
        title: this.post.title,
        content: this.post.content
      })
      this.$router.push('/post')
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
