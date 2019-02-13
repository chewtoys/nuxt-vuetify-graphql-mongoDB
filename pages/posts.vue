/*eslint no-inner-declarations: 2*/
/*eslint-env es6*/
<template>
  <div>
    <ul id="example-1">
      <li v-for="post in posts" :key="post._id">{{ post.title }}</li>
    </ul>
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
import postsByTitle from '../graphql/query/posts.gql'
import articlesPerimeter from '~/kindergarten/perimeters/articles'
import RouteGoverness from '~/kindergarten/governesses/RouteGoverness'
export default {
  name: 'posts',
  // middleware: 'authenticated',
  components: {},
  routePerimeter: articlesPerimeter,
  routePerimeterAction: 'read',
  routeGoverness: RouteGoverness,
  data() {
    return {
      loading: 0,
      errors: [],
      posts: [],
      post: {
        title: null,
        content: null
      }
    }
  },
  methods: {
    register: () => {
      return null
    }
  },
  async asyncData({ app, params, error }) {
    try {
      const title = 'this.post'
      const posts = await app.apolloProvider.defaultClient.query({
        query: postsByTitle,
        variables: { title }
      })
      console.log('posts.postsByTitle :', posts.data.postsByTitle)
      return { posts: posts.data.postsByTitle }
    } catch (error) {
      console.log('error :', error)
      // this.loading--
      this.errors.push(error.message)
      console.log(JSON.stringify(error))
      return null
    }
  },
  mounted() {}
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
