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
        <v-dialog
          v-model="dialog"
          fullscreen
          transition="dialog-bottom-transition"
          :overlay="false"
        >
          <v-btn slot="activator" color="primary" dark class="mb-2">Add Item</v-btn>
          <v-card v-if="editedItem">
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
                    <div v-else-if="!isNormalScalr(key) && key !== 'owner'">
                      <v-text-field
                        v-if="pickEditableFields.editable.some( s => key.includes(s)) ? true : false"
                        v-model="editedItem[key]"
                        :label="key.toUpperCase()"
                        :disabled="true"
                      ></v-text-field>
                      <ReferencePopup
                        v-if="pickEditableFields.editable.some( s => key.includes(s)) ? true : false"
                        :refKey="key"
                        :refType="getOnlyLowerStringType(key)"
                        :refObject="originEditedItem[key]"
                        @selectedRef="selectedRef"
                        @closeRef="closeRef"
                      />
                    </div>
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
      :rows-per-page-items="[3, 15,25,50,100,{'text':'All','value':10000}]"
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
import {
  isEmpty,
  objToKindAndValue,
  pick,
  capitalize,
  getSchemaTypeByKey,
  hasNormalScalar
} from '~/utils'
// import registerStoreModule from '~/store/common/'
// import { mapGetters } from 'vuex'
import adminPerimeter from '~/kindergarten/perimeters/admin'
import SearchBar from '@/components/common/SearchBar'
import ReferencePopup from '@/components/common/ReferencePopup'

let moduleName = 'none'

export default {
  name: 'admin-commom',
  layout: 'admin',
  routePerimeter: adminPerimeter,
  components: {
    SearchBar,
    ReferencePopup
  },
  data() {
    return {
      module: '',
      moduleSchema: [],
      dialog: false,
      dialog2: false,
      loading: false,
      pagination: {},
      headerKeys: [],
      headers: [],
      selectedRows: [],
      editedIndex: -1,
      originEditedItem: {},
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
        editable: ['_id'],
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
    hasEmpty(obj) {
      return isEmpty(obj)
    },
    activeDialog() {
      console.log('activeDialog :', this.editedIndex)
      if (this.editedIndex < 0) {
        this.defaultItem.owner = this.$store.state.sign.user.name
        this.defaultItem.created = this.$moment().format(this.timeformat)
      }
      console.log('defaultItem :', this.defaultItem)
    },
    close() {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.originEditedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
        console.log('close > this.editedItem :', this.editedItem)
        console.log('close > this.originEditedItem :', this.originEditedItem)
      }, 300)
    },
    setHeaders() {
      this.moduleSchema = []
      this.gqlTypes.__type.fields.forEach(obj => {
        let type = _.result(obj, 'type.name')
        if (!type) type = _.result(obj, 'type.ofType.name')

        const key = _.result(obj, 'name')
        this.moduleSchema.push({ key: key, type: type })
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
      this.searchOption.useSearchForm = _.uniq(this.searchOption.useSearchForm)
      console.log('moduleSchema :', this.moduleSchema)

      this.headerKeys = []
      this.headerKeys = _.chain(this.moduleSchema)
        .map('key')
        .value()

      // console.log('headerkeys :', this.headerKeys)

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
    isNormalScalr(key) {
      return hasNormalScalar(getSchemaTypeByKey(key, this.moduleSchema))
    },
    getType(key) {
      return getSchemaTypeByKey(key, this.moduleSchema)
    },
    getOnlyLowerStringType(key) {
      return this.getType(key)
        .toLowerCase()
        .replace('!', '')
    },
    retrieveRefList(key) {
      console.log('retrieveRefList > key:', key)
    },
    selectedRef(key, id) {
      console.log('selectedRef :', key, id)
      this.editedItem[key] = id
    },
    closeRef() {
      this.originEditedItem = {}
    },
    editItem(item) {
      this.editedIndex = this.items.indexOf(item)
      this.setEditItem(item)
      this.dialog = true
    },
    async save() {
      if (this.editedIndex > -1) {
        let newItem = pick(
          this.editedItem,
          this.pickEditableFields.editable,
          this.moduleSchema
        )
        console.log('newItem 1:', newItem)

        newItem = objToKindAndValue(newItem)
        console.log('newItem 2:', newItem)

        newItem.map(item => {
          if (!this.isNormalScalr(item.kind))
            return (item.kind = item.kind + 'Id')
        })
        console.log('newItem 3:', newItem)

        await this.$store.dispatch(moduleName + '/updateItem', newItem)
        this.pagination.totalItems += 1
      } else {
        console.log('this.editedItem :', this.editedItem)

        let newItem = pick(
          this.editedItem,
          this.pickEditableFields.editable,
          this.moduleSchema
        )
        console.log('nreItem 1:', newItem)

        newItem = objToKindAndValue(newItem)
        console.log('nreItem 2:', newItem)
        newItem.map(item => {
          if (!this.isNormalScalr(item.kind))
            return (item.kind = item.kind + 'Id')
        })
        console.log('nreItem 3:', newItem)

        await this.$store.dispatch(moduleName + '/addItem', newItem)
        this.$refs.searchBar.reset()
        this.searchPayload = {}
        this.pagination.totalItems += 1
        this.pagination.page = 1
      }
      this.close()
    },
    setEditItem(item) {
      const keys = Object.keys(item).filter(key => !key.includes('__typename'))
      let editItem = {}
      // console.log('setEditItem :', item)
      keys.forEach(key => {
        editItem[key] = this.handleItem(item, key)
        this.originEditedItem[key] = item[key]
      })
      this.editedItem = editItem
      console.log('editedItem :', this.editedItem)
      console.log('originEditedItem :', this.originEditedItem)
    },

    // The funcfion is called for two cases
    // first is from setEditItem function
    // second is from datatable for show list with detail
    // two cases show different values by the isDatatable of argument
    handleItem(item, key, isDataTable) {
      const type = this.moduleSchema.find(schema => schema.key === key).type
      const isNormalType = hasNormalScalar(type)
      console.log('handleItem : ', key, type)
      if (type === 'User') {
        return this.handleUser(item[key])
      } else if (type === 'String')
        return this.handleTruncate(item[key], isDataTable)
      else if (type === 'Date') return this.handleDate(item[key])
      else if (isNormalType) return item[key]
      else return this.handleObject(item[key], isDataTable)
    },
    handleObject(obj, isDataTable) {
      return isDataTable ? obj.name : obj._id
    },
    handleUser(user) {
      console.log('handleUser > user:', user)
      return user.name
    },
    handleTruncate(content, isDataTable) {
      const num = 14
      if (isDataTable && content.length > num) {
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
  created() {
    this.module = moduleName
    // this makes editable(add, update) fields array with moduleSchema
    const autoSchema = this.$store.getters['getAutoSchema'](moduleName)
    const autoSchemaFieldKeys = _.chain(autoSchema.fields)
      .map('name')
      .value()
    const lookupFieldKeys = _.chain(autoSchema.lookups)
      .map('$lookup')
      .value()
    console.log('lookupFieldKeys :', lookupFieldKeys)
    const lookupKeys = []
    lookupFieldKeys.forEach(lookup => {
      if (lookup.pick) lookupKeys.push(lookup.from)
    })
    console.log('lookupKeys :', lookupKeys)
    autoSchemaFieldKeys.map(key => {
      if (!this.isNormalScalr(key)) return key + 'Id'
    })
    // _id & schema's fields
    this.pickEditableFields.editable = [
      ...autoSchemaFieldKeys,
      ...this.pickEditableFields.editable,
      ...lookupKeys
    ]
    console.log(
      'this.pickEditableFields.editable :',
      this.pickEditableFields.editable
    )

    this.initialize()
  },
  beforeCreate() {
    moduleName = this.$store.getters['getAutoModule']
  }
}
</script>

