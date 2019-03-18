
<template>
  <div>
    <v-form ref="form">
      <v-text-field v-model="post.title" placeholder="Title" required/>
      <v-text-field label="Write contents here!" v-model="post.content" required></v-text-field>
      <v-layout justify-space-between>
        <v-btn @click="update" class="blue darken-4 white--text">Save</v-btn>
        <nuxt-link to="/">Home</nuxt-link>
      </v-layout>
    </v-form>
  </div>
</template>

<script>
export default {
  name: 'edit-post',
  props: ['post'],
  methods: {
    update() {
      this.$emit('update', {
        _id: this.post._id,
        title: this.post.title,
        content: this.post.content
      })
    }
  }
}
</script>
