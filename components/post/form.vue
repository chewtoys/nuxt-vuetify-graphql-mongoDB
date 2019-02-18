
<template>
  <div>
    <v-form ref="form">
      <v-text-field v-model="stitle" placeholder="Title" required/>
      <v-text-field label="Write contents here!" v-model="scontent" required></v-text-field>
      <v-layout justify-space-between>
        <v-btn @click="register" class="blue darken-4 white--text">Save</v-btn>
        <nuxt-link to="/">Home</nuxt-link>
      </v-layout>
    </v-form>
  </div>
</template>

<script>
export default {
  name: 'edit-post',
  props: {
    _id: String,
    title: String,
    content: String,
    author: Object,
    created: String,
    isPublished: Boolean
  },
  data() {
    return {
      stitle: this.title,
      scontent: this.content
    }
  },
  methods: {
    register() {
      this.$emit('update', {
        _id: this._id,
        title: this.stitle,
        content: this.scontent
      })
    }
  }
}
</script>
