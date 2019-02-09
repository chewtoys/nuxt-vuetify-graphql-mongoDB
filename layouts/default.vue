<template>
  <div>
    <v-card color="grey lighten-4" flat>
      <v-toolbar color="grey darken-1" dark>
        <v-toolbar-title>NGEMV</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn icon>
          <v-icon>search</v-icon>
        </v-btn>
        <v-btn flat class="hidden-sm-and-down" to="/signin">SIGN IN</v-btn>
        <v-menu v-model="menu" :close-on-content-click="false" :nudge-width="200" offset-x>
          <v-btn slot="activator" color="indigo" dark>Menu as Popover</v-btn>

          <v-card>
            <v-list>
              <v-list-tile avatar>
                <v-list-tile-avatar>
                  <img src="https://cdn.vuetifyjs.com/images/john.jpg" alt="John">
                </v-list-tile-avatar>

                <v-list-tile-content>
                  <v-list-tile-title>John Leider</v-list-tile-title>
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
            </v-list>

            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn flat @click="menu = false">Cancel</v-btn>
              <v-btn color="primary" flat @click="menu = false">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-toolbar>
    </v-card>
    <nuxt/>
  </div>
</template>


<script>
export default {
  data() {
    return {
      clipped: false
    }
  }
}
</script>

<style>
html {
  font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}
*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}
.button--green {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #3b8070;
  color: #3b8070;
  text-decoration: none;
  padding: 10px 30px;
}
.button--green:hover {
  color: #fff;
  background-color: #3b8070;
}
.button--grey {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #35495e;
  color: #35495e;
  text-decoration: none;
  padding: 10px 30px;
  margin-left: 15px;
}
.button--grey:hover {
  color: #fff;
  background-color: #35495e;
}
</style>
