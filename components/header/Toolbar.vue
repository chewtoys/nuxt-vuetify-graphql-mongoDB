<template>
  <v-card color="teal lighten-4" flat>
    <v-toolbar color="teal darken-1" dark>
      <v-toolbar-title>NGEMV</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-toolbar-items class="hidden-sm-and-down">
        <v-btn flat @click="goPost">Post</v-btn>
        <v-btn flat>Two</v-btn>
        <v-btn flat>Three</v-btn>
      </v-toolbar-items>
      <v-menu
        v-if="isAuthenticated"
        v-model="menu"
        :close-on-content-click="false"
        :nudge-width="200"
        offset-x
      >
        <v-btn slot="activator" color="teal darken-4" dark>Profile</v-btn>

        <v-card>
          <v-list>
            <v-list-tile avatar>
              <v-list-tile-avatar>
                <img
                  src="https://lh3.googleusercontent.com/-5uDR810w1dY/AAAAAAAAAAI/AAAAAAAAAAA/ACevoQPcSH9_4taB-SR80e0GGxxhrT4Oaw/mo/photo.jpg?sz=46"
                  alt="John"
                >
              </v-list-tile-avatar>

              <v-list-tile-content>
                <v-list-tile-title>{{ loggedInUser.name }}</v-list-tile-title>
                <v-list-tile-sub-title>Founder of Vuetify.js</v-list-tile-sub-title>
              </v-list-tile-content>

              <v-list-tile-action>
                <v-btn :class="fav ? 'red--text' : ''" icon @click="fav = !fav">
                  <v-icon>favorite</v-icon>
                </v-btn>
              </v-list-tile-action>
            </v-list-tile>
          </v-list>

          <v-divider></v-divider>

          <v-list>
            <v-list-tile>
              <v-list-tile-action>
                <v-switch v-model="message" color="purple"></v-switch>
              </v-list-tile-action>
              <v-list-tile-title>Enable messages</v-list-tile-title>
            </v-list-tile>

            <v-list-tile>
              <v-list-tile-action>
                <v-switch v-model="hints" color="purple"></v-switch>
              </v-list-tile-action>
              <v-list-tile-title>Enable hints</v-list-tile-title>
            </v-list-tile>

            <v-list-tile @click="logout">
              <v-list-tile-title>Logout</v-list-tile-title>
            </v-list-tile>
          </v-list>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn flat @click="menu = false">Cancel</v-btn>
            <v-btn color="primary" flat @click="menu = false">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>
      <v-btn v-else flat class="hidden-sm-and-down" to="/signin">SIGN IN</v-btn>
    </v-toolbar>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'toolbar',
  data() {
    return {
      fav: true,
      menu: false,
      message: false,
      hints: true
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser'])
  },
  methods: {
    logout() {
      this.$store.dispatch('logout')
    },
    goPost() {
      this.$router.push('/post')
    }
  }
}
</script>
