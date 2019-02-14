/*eslint no-inner-declarations: 2*/
/*eslint-env es6*/
<template>
  <div>
    <ul id="example-1">
      <li v-for="post in posts" :key="post._id" v-show="$isAllowed('read')">
        {{ post.title }}
        <v-btn v-if="$article.isAllowed('update', post)">수정</v-btn>
        <v-btn v-if="$article.isAllowed('update', post)" @click="deletePost(post._id)">삭제</v-btn>
        <p>{{ $article.secretNotes(post) }}</p>
      </li>
    </ul>
    <v-layout justify-space-between>
      <v-btn class="blue darken-4 white--text">
        <nuxt-link to="/post/create">Write Post</nuxt-link>
      </v-btn>
      <nuxt-link to="/">Home</nuxt-link>
    </v-layout>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import articlesPerimeter from '~/kindergarten/perimeters/articles'
export default {
  name: 'post',
  perimeters: [articlesPerimeter],
  routePerimeter: articlesPerimeter,
  data() {
    return {
      post: {
        title: null,
        content: null
      }
    }
  },
  methods: {
    deletePost(id) {
      this.$store.dispatch('deletePost', {
        id
      })
    },
    ...mapActions(['postList', 'addPost'])
  },
  computed: {
    ...mapGetters({
      posts: 'postList'
    })
  },
  // absolute url must be sopported: Network Error: GraphQL
  // async fetch({ store, params }) {
  //   await store.dispatch('postList')
  // }
  mounted() {
    this.postList()
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
