<template>
  <div>
    <SearchBar
      v-if="showSearchBar"
      :selectKeys="searchOption.selectKeys"
      :dateKeys="searchOption.dateKeys"
      :useSearchForm="searchOption.useSearchForm"
      @search="search"
    />
    <v-spacer/>
    <v-toolbar flat>
      <v-toolbar-title>Posts</v-toolbar-title>
      <v-divider class="mx-2" inset vertical></v-divider>
      <v-spacer></v-spacer>
      <v-dialog v-model="dialog" max-width="500px">
        <v-btn slot="activator" color="primary" dark class="mb-2">Add Item</v-btn>
        <v-card>
          <v-card-title>
            <span class="headline">{{ addTitle }}</span>
          </v-card-title>
          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12 sm12 md12 v-for="key in headerKeys" :key="key">
                  <v-textarea
                    v-if="key==='content'"
                    v-model="editedItem[key]"
                    :label="key.toUpperCase()"
                    box
                    auto-grow
                  ></v-textarea>
                  <v-text-field
                    v-else
                    v-model="editedItem[key]"
                    :label="key.toUpperCase()"
                    :disabled="['id', 'author', 'user', 'created', 'updated'].some( s => key.includes(s)) ? true : false"
                  ></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click="close">Cancel</v-btn>
            <v-btn color="blue darken-1" flat @click="save">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-toolbar>
    <v-data-table v-if="headers" :headers="headers" :items="posts" class="elevation-1">
      <template slot="items" slot-scope="props">
        <td v-for="key in headerKeys" :key="key">{{ handleItem(props.item, key, true) }}</td>
        <td class="justify-center layout px-0">
          <v-icon small class="mr-2" @click="editItem(props.item)">edit</v-icon>
          <v-icon small @click="deleteItem(props.item)">delete</v-icon>
        </td>
      </template>
      <template slot="footer">
        <tr>
          <td :colspan="headers.length">
            <strong>This is an extra footer</strong>
          </td>
        </tr>
        <tr>
          <td>total</td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import adminPerimeter from '~/kindergarten/perimeters/admin'
import SearchBar from '@/components/plugins/SearchBar'
export default {
  name: 'admin-post',
  layout: 'admin',
  routePerimeter: adminPerimeter,
  components: {
    SearchBar
  },
  data() {
    return {
      dialog: false,
      headerKeys: [],
      headers: [{ text: 'Name', value: 'name' }],
      editedIndex: -1,
      editedItem: { name: '' },
      defaultItem: { name: '' },
      showSearchBar: true,
      searchOption: {
        useSearchForm: ['keywords', 'period'],
        selectKeys: ['title', 'content'],
        dateKeys: ['created', 'updated']
      },
      sumKeys: ['like']
    }
  },
  computed: {
    addTitle() {
      return this.editedIndex === -1 ? 'Add Item' : 'Edit Item'
    },
    ...mapGetters('post', {
      posts: 'posts',
      gqlTypes: 'gqlTypes'
    })
  },
  watch: {
    dialog(val) {
      if (val) this.activeDialog()
      val || this.close()
    },
    gqlTypes() {
      this.setHeaders()
    }
  },
  methods: {
    initialize() {
      //retrieveGqlTypes
      this.gqlTypes = this.$store.dispatch('post/retrieveGqlTypes', { name: 'Post' })

      // if (!this.posts || this.posts.length === 0) {
      //   this.$store.dispatch('post/retrievePosts')
      // } else {
      //   this.$store.dispatch('post/retrievePosts').then(this.setHeaders())
      // }
    },
    activeDialog() {
      console.log('activeDialog > this.editedIndex :', this.editedIndex)
      if (this.editedIndex < 0) {
        this.defaultItem.author = this.$store.state.user.user.email
        this.defaultItem.created = this.$moment().format('YYYY-MM-DD HH:mm:ss')
      }
    },
    editItem(item) {
      this.editedIndex = this.posts.indexOf(item)
      this.setEditItem(item)
      this.dialog = true
    },
    deleteItem(item) {
      if (confirm('Are you sure you want to delete this item?')) {
        this.$store.dispatch('post/deletePost', item)
      }
    },
    close() {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },
    save() {
      if (this.editedIndex > -1) {
        this.$store.dispatch('post/updatePost', this.editedItem)
      } else {
        this.$store.dispatch('post/addPost', this.editedItem)
      }
      this.close()
    },
    setHeaders() {
      this.gqlTypes.__type.fields
      const headers = []
      if (this.posts && this.posts.length) {
        const post = this.posts[0]
        const keys = Object.keys(post).filter(
          key => !key.includes('__typename')
        )
        keys.forEach(key => {
          const item = {
            text: key.toUpperCase().replace('_', ''),
            value: key,
            align: 'center'
          }
          headers.push(item)
        })
        this.headerKeys = keys
        const action = {
          text: 'ACTION',
          value: 'action',
          align: 'right',
          sortable: false
        }
        headers.push(action)
        this.headers = headers
      }
    },
    setEditItem(item) {
      const keys = Object.keys(item).filter(key => !key.includes('__typename'))
      let editItem = {}
      keys.forEach(key => {
        editItem[key] = this.handleItem(item, key)
      })
      this.editedItem = editItem
    },
    handleItem(item, key, table) {
      if (key === 'author' || key === 'user') {
        return this.handleUser(item[key])
      } else {
        if (key === 'content' || key === '_id')
          return this.handleTruncate(item[key], table)
        else if (key === 'created' || key === 'updated')
          return this.handleDate(item[key], table)
        else return item[key]
      }
    },
    handleUser(user) {
      return user.email
    },
    handleTruncate(content, table) {
      const num = 14
      if (table && content.length > num) {
        return content.slice(0, num) + '...'
      } else {
        return content
      }
    },
    handleDate(date, fromnow) {
      if (fromnow) return this.$moment.tz(date, 'Asia/Seoul').fromNow()
      // const days = this.$moment().diff(date, 'days')
      // if (days < 7) return this.$moment.tz(date, 'Asia/Seoul').fromNow()
      else
        return this.$moment.tz(date, 'Asia/Seoul').format('YYYY-MM-DD HH:mm:ss')
    },
    search(payload) {
      console.log('search > payload :', payload)
      this.$store.dispatch('post/retrievePosts', payload)
    }
  },
  created() {
    this.initialize()
  }
}
</script>

