<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
      id="test"
      :width="200"
    >
      <v-list>
        <v-list-tile v-for="(item, i) in menus" :key="i" :to="item.to" router exact>
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title"/>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar :clipped-left="clipped" fixed app>
      <v-toolbar-side-icon @click="drawer = !drawer"/>

      <v-toolbar-title v-text="title"/>
    </v-toolbar>
    <v-content>
      <nuxt/>
    </v-content>
    <v-navigation-drawer v-model="rightDrawer" :right="right" temporary fixed>
      <v-list>
        <v-list-tile @click.native="right = !right">
          <v-list-tile-action>
            <v-icon light>compare_arrows</v-icon>
          </v-list-tile-action>
          <v-list-tile-title>Switch drawer (click me)</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-footer :fixed="fixed" app>
      <span>&copy; 2019</span>
    </v-footer>
  </v-app>
</template>

<script>
// import adminPerimeter from '~/kindergarten/perimeters/admin'
//const config = require('~/nuxt.config.js')
export default {
  data() {
    return {
      clipped: false,
      drawer: true,
      fixed: false,
      items: [
        {
          icon: 'arrow_back',
          title: 'Back',
          to: '/'
        },
        {
          icon: 'apps',
          title: 'Home',
          to: '/admin'
        },
        {
          icon: 'people',
          title: 'Users',
          to: '/admin/users'
        },
        {
          icon: 'toc',
          title: 'Post',
          to: '/admin/common/post'
        }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Admin'
    }
  },
  computed: {
    menus() {
      // const schemas = this.$store.getters['getAutoSchemas']
      // console.log('admin layout > schemas:', schemas)
      // schemas.forEach(schema => {
      //   const item = {}
      //   item.icon = 'toc'
      //   item.title = schema.name
      //   item.to = `/admin/common/${schema.name}`
      //   this.items.push(item)
      // })
      return this.$store.getters['getAdminMenu']
    }
  }
}
</script>

<style lang="stylus" scoped>
w = 50px

.v-content 
  margin w

</style>
