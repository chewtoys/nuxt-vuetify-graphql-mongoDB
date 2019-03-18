<template>
  <div>
    <post-form :post="post" @update="update($event)"></post-form>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import articlesPerimeter from '~/kindergarten/perimeters/articles'
import postForm from '@/components/form/post'
export default {
  name: 'post',
  components: { postForm },
  perimeters: [articlesPerimeter],
  routePerimeter: articlesPerimeter,
  computed: {
    post() {
      return this.$store.getters['post/post'](this.$route.params.id)
    }
  },
  methods: {
    async update(payload) {
      await this.$store.dispatch('post/updatePost', payload)
      this.$router.push('/post/' + this.$route.params.id)
    },
    ...mapActions('post', ['addPost'])
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
