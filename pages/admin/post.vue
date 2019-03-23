<template>
  <div>
    <SearchBar
      v-if="showSearchBar"
      :selectKeys="searchOption.selectKeys"
      :dateKeys="searchOption.dateKeys"
      :numericKeys="searchOption.numericKeys"
      :useSearchForm="searchOption.useSearchForm"
      @search="search"
      ref="searchBar"
    />
    <v-spacer/>
    <v-toolbar flat>
      <v-toolbar-title>Posts</v-toolbar-title>
      <v-divider class="mx-2" inset vertical></v-divider>
      <v-spacer></v-spacer>
      <v-btn color="primary" dark class="mb-2" @click="deleteItems">Delete Items</v-btn>
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
                    :disabled="['id', 'owner', 'user', 'created', 'updated'].some( s => key.includes(s)) ? true : false"
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
    <v-data-table
      v-if="headers"
      :headers="headers"
      :items="posts"
      class="elevation-1"
      :loading="loading"
      :pagination.sync="pagination"
      :total-items="total"
      :rows-per-page-items="[3, 15,25,50,100,{'text':'All','value':0}]"
      v-model="selectedRows"
      select-all
      item-key="_id"
    >
      <template slot="items" slot-scope="props">
        <td>
          <v-checkbox v-model="props.selected" primary hide-details></v-checkbox>
        </td>
        <td v-for="key in headerKeys" :key="key">{{ handleItem(props.item, key, true) }}</td>
        <td class="justify-center layout px-0">
          <v-icon small class="mr-2" @click="editItem(props.item)">edit</v-icon>
          <v-icon small @click="deleteItem(props.item)">delete</v-icon>
        </td>
      </template>
      <template slot="footer">
        <tr>
          <td :colspan="headers.length+1">
            <strong>This is an extra footer</strong>
          </td>
        </tr>
        <tr>
          <td :colspan="headers.length+1">{{ this.sum() }}</td>
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
      loading: false,
      pagination: {},
      headerKeys: [],
      headers: [],
      selectedRows: [],
      editedIndex: -1,
      editedItem: {},
      defaultItem: {},
      showSearchBar: true,
      searchOption: {
        useSearchForm: ['keywords', 'period', 'range', 'ids'],
        selectKeys: [],
        dateKeys: [],
        numericKeys: []
      },
      searchPayload: {}
    }
  },
  computed: {
    addTitle() {
      return this.editedIndex === -1 ? 'Add Item' : 'Edit Item'
    },
    ...mapGetters('post', {
      total: 'total',
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
    },
    pagination: {
      async handler() {
        // console.log('handler > this.pagination :', this.pagination)
        await this.search(this.searchPayload).then(data => {
          console.log('after watching search')
        })
      },
      deep: true
    }
  },
  methods: {
    initialize() {
      this.$store.dispatch('post/retrieveGqlTypes', { name: 'Post' })
    },
    activeDialog() {
      if (this.editedIndex < 0) {
        this.defaultItem.owner = this.$store.state.user.user.email
        this.defaultItem.created = this.$moment().format('YYYY-MM-DD HH:mm:ss')
      }
    },
    editItem(item) {
      this.editedIndex = this.posts.indexOf(item)
      this.setEditItem(item)
      this.dialog = true
    },
    async deleteItem(item) {
      if (confirm('Are you sure you want to delete this item?')) {
        const oldTotal = this.total
        const delLen = 1
        await this.$store.dispatch('post/deletePost', item)
        // 현재 페이지가 1이면 계속 페이지 1
        if (this.pagination.page === 1) {
          this.pagination.page = 1
          this.pagination.totalItems -= 1
        } else {
          const rest = oldTotal - ((this.pagination.page - 1) * 3 + delLen)
          if (rest > 0) {
            // 이전 페이지들의 아이템수와  삭제할 아이템의 수를 제외한 나머지 아이템수가 0보다 크면 현재 페이지 유지
            this.pagination.totalItems -= 1
          } else {
            // 아니면 이전 페이지
            this.pagination.page = this.pagination.page - 1
          }
        }
      }
    },
    async deleteItems() {
      const _ids = _.chain(this.selectedRows)
        .map('_id')
        .value()

      const oldTotal = this.total
      const delLen = _ids.length
      await this.$store.dispatch('post/deletePosts', { _ids: _ids })

      // 현재 페이지가 1이면 계속 페이지 1
      if (this.pagination.page === 1) {
        this.pagination.page = 1
        this.pagination.totalItems -= 1
      } else {
        const rest = oldTotal - ((this.pagination.page - 1) * 3 + delLen)
        if (rest > 0) {
          // 이전 페이지들의 아이템수와  삭제할 아이템의 수를 제외한 나머지 아이템수가 0보다 크면 현재 페이지 유지
          this.pagination.totalItems -= 1
        } else {
          // 아니면 이전 페이지
          this.pagination.page = this.pagination.page - 1
        }
      }
    },
    async save() {
      const picks = ['_id', 'title', 'content', 'slug']
      if (this.editedIndex > -1) {
        await this.$store.dispatch(
          'post/updatePost',
          this.pick(this.editedItem, picks)
        )
      } else {
        // 추가하기 전
        let page = Math.floor(
          this.total / parseInt(this.pagination.rowsPerPage) + 1
        )
        page = page < 1 ? 1 : page
        const pageMod = this.total % parseInt(this.pagination.rowsPerPage)
        console.log('page :', page)
        console.log('pageMod :', pageMod)
        await this.$store.dispatch(
          'post/addPost',
          this.pick(this.editedItem, picks)
        )
        this.$refs.searchBar.reset()
        this.searchPayload = {}
        this.pagination.totalItems += 1
        this.pagination.page = 1
        // if (pageMod === 0) {
        //   // 현재 페이지에서 아이템을 추가고 페이지가 넘어갈 경우
        //   this.pagination.page = page
        // } else {
        //   // 페이지 값이 변경되지 않을 때 와치를 작동하기 위해
        //   console.log('totalItems :', this.pagination.totalItems)
        //   this.pagination.totalItems += 1
        //   this.pagination.page = page
        // }
      }
      this.close()
    },
    pick(obj, keys) {
      return keys
        .map(k => (k in obj ? { [k]: obj[k] } : {}))
        .reduce((res, o) => Object.assign(res, o), {})
    },
    close() {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },
    setHeaders() {
      const fieldObjects = this.gqlTypes.__type.fields
      fieldObjects.forEach(obj => {
        const key = _.result(obj, 'name')
        let type = _.result(obj, 'type.name')
        if (!type) {
          type = _.result(obj, 'type.ofType.name')
        }
        this.scheme.push({ key: key, type: type })
        if (type === 'ID') {
          this.searchOption.useSearchForm.push('ids')
        }
        if (type === 'String') {
          this.searchOption.selectKeys.push(key)
          this.searchOption.useSearchForm.push('keywords')
        }
        if (type === 'Date') {
          this.searchOption.dateKeys.push(key)
          this.searchOption.useSearchForm.push('period')
        }
        if (type === 'Int' || type === 'Float') {
          this.searchOption.numericKeys.push(key)
          this.searchOption.useSearchForm.push('range')
        }
        this.useSearchForm = _.uniq(this.useSearchForm)
      })
      this.headerKeys = _.chain(this.scheme)
        .map('key')
        .value()

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
      this.search(this.searchPayload)
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
      if (key === 'owner' || key === 'user') {
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
    async search(payload) {
      // console.log('search > payload :', payload)
      // console.log('search > this.pagination :', this.pagination)
      this.loading = true
      this.searchPayload = Object.assign({}, payload)
      payload.pagination = this.pagination
      await this.$store.dispatch('post/retrievePosts', payload)
      this.loading = false
    },
    resetSearchPayload() {
      this.searchPayload = {}
    },
    sum(key) {
      let total = 'Current Page Total >> '
      this.searchOption.numericKeys.forEach(key => {
        total =
          total + key.toUpperCase() + ' : ' + _.sumBy(this.posts, key) + ','
        // console.log('sum :', total)
      })
      return total.replace(/,$/, '.')
    }
  },
  created() {
    this.initialize()
  }
}
</script>

