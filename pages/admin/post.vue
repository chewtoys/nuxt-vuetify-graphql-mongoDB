<template>
  <div>
    <SearchBar
      v-if="showSearchBar"
      :selectKeys="searchOption.selectKeys"
      :dateKeys="searchOption.dateKeys"
      :numericKeys="searchOption.numericKeys"
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
          <td :colspan="headers.length">total >> {{ this.sum() }}</td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import _ from 'lodash'
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
      scheme: [],
      dialog: false,
      headerKeys: [],
      headers: [],
      editedIndex: -1,
      editedItem: { name: '' },
      defaultItem: { name: '' },
      showSearchBar: true,
      searchOption: {
        useSearchForm: ['keywords', 'period', 'range'],
        selectKeys: [],
        dateKeys: [],
        numericKeys: []
      }
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
      this.$store.dispatch('post/retrieveGqlTypes', { name: 'Post' })
    },
    activeDialog() {
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
      const fieldObjects = this.gqlTypes.__type.fields
      fieldObjects.forEach( obj => {
        const key = _.result( obj, 'name')
        let type = _.result( obj, 'type.name')
        if(!type){
          type = _.result( obj, 'type.ofType.name')
        }
        this.scheme.push({key: key, type:type})
        if(type === 'String') {
          this.searchOption.selectKeys.push(key)
          this.useSearchForm.push('keywords')
        }
        if(type === 'Date') {
          this.searchOption.dateKeys.push(key)
          this.useSearchForm.push('period') 
        }
        if(type === 'Int' || type === 'Float') {
          this.searchOption.numericKeys.push(key)
          this.useSearchForm.push('range') 
        }
        this.useSearchForm = _.uniq(this.useSearchForm)
      })
      this.headerKeys = _.chain(this.scheme).map('key').value()

      const headers = []
      this.headerKeys.forEach(key => {
        const item = {
          text: key.toUpperCase().replace('_', ''),
          value: key,
          align: 'center'
        }
        headers.push(item)
      })
      const action = {
        text: 'ACTION',
        value: 'action',
        align: 'right',
        sortable: false
      }
      headers.push(action)
      this.headers = headers
      this.$store.dispatch('post/retrievePosts')
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
    },
    sum(key) {
      let total = ''
      this.searchOption.numericKeys.forEach( key => {
        total = total + key + ' : ' + _.sumBy(this.posts, key) + ','
        console.log('total :', total)
        console.log('this.posts :', this.posts)
        console.log('key :', key)
      })
      return total.replace(/,$/,".")
    }
  },
  created() {
    this.initialize()
  }
}
</script>

