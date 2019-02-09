/*eslint no-inner-declarations: 2*/
/*eslint-env es6*/
<template>
  <div>
    <ul id="example-1">
      <li v-for="item in items" :key="item.id">{{ item.message }}</li>
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
import addPost from '../graphql/mutation/addPost.gql'
export default {
  name: 'post',
  layout: 'post',
  middleware: 'authenticated',
  components: {},
  data() {
    return {
      items: [{ id: '1', message: 'Foo' }, { id: '2', message: 'Bar' }],
      loading: 0,
      errors: [],
      valid: true,
      post: {
        title: 'Hello, World!',
        content: 'Welcome to Vue World!'
      }
    }
  },
  methods: {
    async register() {
      console.log(' this.title', this.title)

      this.valid = true
      console.log('valid:', this.valid)
      if (this.valid) {
        try {
          const { title, content } = this.post
          await this.$apollo.mutate({
            mutation: addPost,
            variables: { title, content }
          })
        } catch (error) {
          console.log('error :', error)
          this.loading--
          this.errors.push(error.message)
          console.log(JSON.stringify(error))
        }
      } else return false
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
