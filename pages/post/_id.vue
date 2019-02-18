/*eslint no-inner-declarations: 2*/
/*eslint-env es6*/
<template>
  <div>
    <div v-if="post">
      <p>{{ post.title }}</p>
      <p>{{ post.content }}</p>
      <v-layout justify-space-between>
        <v-btn class="blue darken-4 white--text">
          <nuxt-link :to="{name: 'post-edit-id', params: {id: this.$route.params.id}}">수정</nuxt-link>
        </v-btn>
        <nuxt-link to="/">Home</nuxt-link>
      </v-layout>
    </div>
  </div>
</template>

<script>
import articlesPerimeter from '~/kindergarten/perimeters/articles'
export default {
  name: 'post-view',
  perimeters: [articlesPerimeter],
  routePerimeter: articlesPerimeter,
  data() {
    return {}
  },
  methods: {
    deletePost(id) {
      this.$store.dispatch('deletePost', {
        id
      })
    }
  },
  computed: {
    post() {
      return this.$store.getters.post(this.$route.params.id)
    }
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
