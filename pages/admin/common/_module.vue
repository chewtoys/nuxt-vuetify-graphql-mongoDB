<template>
  <div>
    <v-layout row wrap column>
      <SearchBar
        v-if="showSearchBar"
        :selectKeys="searchOption.selectKeys"
        :dateKeys="searchOption.dateKeys"
        :numericKeys="searchOption.numericKeys"
        :selectUserKeys="searchOption.selectUserKeys"
        :useSearchForm="searchOption.useSearchForm"
        @search="search"
        ref="searchBar"
      />
    </v-layout>
    <v-layout row wrap>
      <v-toolbar flat>
        <v-toolbar-title>{{module}}</v-toolbar-title>
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
                      :disabled="pickEditableFields.disable.some( s => key.includes(s)) ? true : false"
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
    </v-layout>
    <v-data-table
      v-if="headers"
      :headers="headers"
      :items="items"
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
import { objToKindAndValue, pick, capitalize } from '~/utils'
// import registerStoreModule from '~/store/common/'
// import { mapGetters } from 'vuex'
import adminPerimeter from '~/kindergarten/perimeters/admin'
import SearchBar from '@/components/plugins/SearchBar'

let moduleName = 'none'

export default {
  name: 'admin-commom',
  layout: 'admin',
  routePerimeter: adminPerimeter,
  components: {
    SearchBar
  },
  data() {
    return {
      module: '',
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
        useSearchForm: [],
        selectKeys: [],
        dateKeys: [],
        numericKeys: [],
        selectUserKeys: []
      },
      pickEditableFields: {
        editable: ['_id', 'title', 'content', 'slug', 'like'],
        disable: ['id', 'owner', 'user', 'created', 'updated']
      },
      searchPayload: {},
      timezone: 'Asia/Seoul',
      timeformat: 'YYYY-MM-DD HH:mm:ss'
    }
  },
  computed: {
    addTitle() {
      return this.editedIndex === -1 ? 'Add Item' : 'Edit Item'
    },
    // ...mapGetters('post', {
    //   total: 'total',
    //   items: 'items',
    //   gqlTypes: 'gqlTypes'
    // }),
    total() {
      return this.$store.getters[`${moduleName}/total`]
    },
    items() {
      return this.$store.getters[`${moduleName}/items`]
    },
    gqlTypes() {
      return this.$store.getters[`${moduleName}/gqlTypes`]
    }
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
          console.log('after search in watch')
        })
      },
      deep: true
    }
  },
  methods: {
    async initialize() {
      await this.$store.dispatch(moduleName + '/retrieveGqlTypes', {
        name: capitalize(moduleName, true)
      })
    },
    activeDialog() {
      if (this.editedIndex < 0) {
        this.defaultItem.owner = this.$store.state.user.user.email
        this.defaultItem.created = this.$moment().format(this.timeformat)
      }
    },
    editItem(item) {
      this.editedIndex = this.items.indexOf(item)
      this.setEditItem(item)
      this.dialog = true
    },
    async deleteItem(item) {
      if (confirm('Are you sure you want to delete this item?')) {
        const oldTotal = this.total
        const delLen = 1
        await this.$store.dispatch(moduleName + '/deleteItem', item)
        // 현재 페이지가 1이면 계속 페이지 1
        if (this.pagination.page === 1) {
          this.pagination.page = 1
          this.pagination.totalItems -= delLen
        } else {
          const rest = oldTotal - ((this.pagination.page - 1) * 3 + delLen)
          if (rest > 0) {
            // 이전 페이지들의 아이템수와  삭제할 아이템의 수를 제외한 나머지 아이템수가 0보다 크면 현재 페이지 유지
            this.pagination.totalItems -= delLen
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
      await this.$store.dispatch(moduleName + '/deleteItems', {
        _ids: _ids
      })

      // 현재 페이지가 1이면 계속 페이지 1
      if (this.pagination.page === 1) {
        this.pagination.page = 1
        this.pagination.totalItems -= delLen
      } else {
        const rest = oldTotal - ((this.pagination.page - 1) * 3 + delLen)
        if (rest > 0) {
          // 이전 페이지들의 아이템수와  삭제할 아이템의 수를 제외한 나머지 아이템수가 0보다 크면 현재 페이지 유지
          this.pagination.totalItems -= delLen
        } else {
          // 아니면 이전 페이지
          this.pagination.page = this.pagination.page - 1
        }
      }
    },
    async save() {
      if (this.editedIndex > -1) {
        let newItem = pick(
          this.editedItem,
          this.pickEditableFields.editable,
          this.scheme
        )
        newItem = objToKindAndValue(newItem)
        await this.$store.dispatch(moduleName + '/updateItem', newItem)
        this.pagination.totalItems += 1
      } else {
        let newItem = pick(
          this.editedItem,
          this.pickEditableFields.editable,
          this.scheme
        )
        newItem = objToKindAndValue(newItem)
        await this.$store.dispatch(moduleName + '/addItem', newItem)
        this.$refs.searchBar.reset()
        this.searchPayload = {}
        this.pagination.totalItems += 1
        this.pagination.page = 1
      }
      this.close()
    },
    close() {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },
    setHeaders() {
      this.gqlTypes.__type.fields.forEach(obj => {
        let type = _.result(obj, 'type.name')
        if (!type) type = _.result(obj, 'type.ofType.name')

        const key = _.result(obj, 'name')
        this.scheme.push({ key: key, type: type })
        switch (type) {
          case 'ID':
            this.searchOption.useSearchForm.push('ids')
            break
          case 'String':
            this.searchOption.selectKeys.push(key)
            this.searchOption.useSearchForm.push('keywords')
            break
          case 'Date':
            this.searchOption.dateKeys.push(key)
            this.searchOption.useSearchForm.push('period')
            break
          case 'Int':
          case 'Flot':
            this.searchOption.numericKeys.push(key)
            this.searchOption.useSearchForm.push('range')
            break
          case 'User':
            this.searchOption.selectUserKeys.push(key)
            this.searchOption.useSearchForm.push('users')
            break
          default:
        }
      })
      console.log('this.scheme :', this.scheme)

      this.searchOption.useSearchForm = _.uniq(this.searchOption.useSearchForm)

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
      if (fromnow) return this.$moment.tz(date, this.timezone).fromNow()
      else return this.$moment.tz(date, this.timezone).format(this.timeformat)
    },
    async search(payload) {
      this.loading = true
      this.searchPayload = Object.assign({}, payload)
      payload.pagination = this.pagination
      await this.$store.dispatch(moduleName + '/search', payload)
      this.loading = false
    },
    resetSearchPayload() {
      this.searchPayload = {}
    },
    sum(key) {
      let total = 'Current Page Total >> '
      this.searchOption.numericKeys.forEach(key => {
        total =
          total + key.toUpperCase() + ' : ' + _.sumBy(this.items, key) + ','
        // console.log('sum :', total)
      })
      return total.replace(/,$/, '.')
    }
  },
  fetch(ctx) {
    //   console.log('ctx.params:', ctx.params)
    //   if (ctx) {
    //     ctx.store.commit('SET_AUTO_MODULE', ctx.params.module)
    //     moduleName = ctx.params.module
    //   } else {
    //     // const store = this.$store
    //   }
    //   let schemas = null
    //   const autoSchemas = ctx.env.autoSchemas
    //   autoSchemas.every(schema => {
    //     if (schema.name === moduleName) {
    //       ctx.store.commit('SET_AUTO_SCHEMA', schema)
    //       return false
    //     }
    //     return true
    //   })
    //   return schemas
  },
  created() {
    // const store = this.$store

    // console.log('moduleName :', moduleName)
    // console.log('store.getters :', store.getters)
    // console.log('store.state :', store.state)
    // this.total = this.$store.getters['post/total']
    // this.items = this.$store.getters['post/items']
    this.module = moduleName
    this.initialize()
  },
  beforeCreate() {
    moduleName = this.$store.getters['getAutoModule']
    this.module = moduleName
    // const store = this.$store
    // // console.log('store.getters :', store.getters)
    // moduleName = store.getters['getAutoModule']
    // this.module = moduleName
    // const autoSchema = store.getters.getAutoSchema(moduleName)
    // // console.log('beforeCreate > this Module autoSchema :', autoSchema)
    // if (!(store && store.state && store.getters[moduleName + '/gqlTypes'])) {
    //   store.registerModule(moduleName, registerStoreModule(autoSchema), {
    //     preserveState: false
    //   })
    // }
  },
  destory() {
    // this.$store.unregisterModule(moduleName)
  }
}
</script>

