<template>
  <v-card color="red lighten-2" dark>
    <v-card-title class="headline red lighten-3">Search for {{refKey}}</v-card-title>
    <v-card-text>Explore hundreds of free API's ready for consumption! For more information visit</v-card-text>
    <v-card-text>
      <v-autocomplete
        v-model="model"
        :items="items"
        :loading="isLoading"
        :search-input.sync="search"
        color="white"
        hide-no-data
        hide-selected
        item-text="name"
        item-value="_id"
        label="Public APIs"
        placeholder="Start typing to Search"
        prepend-icon="mdi-database-search"
        return-object
        @input="selectModel"
      ></v-autocomplete>
    </v-card-text>
    <v-divider></v-divider>
    <v-expand-transition>
      <v-list v-if="model || refObject" class="red lighten-3">
        <v-list-tile v-for="(field, i) in fields" :key="i">
          <v-list-tile-content>
            <v-list-tile-title v-text="field.value"></v-list-tile-title>
            <v-list-tile-sub-title v-text="field.key"></v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-expand-transition>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn :disabled="!model" color="grey darken-3" @click="model = null">Clear
        <v-icon right>mdi-close-circle</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
export default {
  name: 'refPopup',
  props: ['refKey', 'refType', 'refObject'],
  data: () => ({
    descriptionLimit: 60,
    isLoading: false,
    model: null,
    search: null
  }),

  computed: {
    fields() {
      if (!this.model && !this.refObject) return []
      const item = this.model || this.refObject
      return Object.keys(item).map(key => {
        return {
          key,
          value: item[key] || 'n/a'
        }
      })
    },
    items() {
      return this.entries
        ? this.entries.map(entry => {
            const description =
              entry.description.length > this.descriptionLimit
                ? entry.description.slice(0, this.descriptionLimit) + '...'
                : entry.description

            return Object.assign({}, entry, { description })
          })
        : []
    },
    entries() {
      return this.$store.getters[`${this.refType}/items`]
    }
  },
  methods: {
    selectModel() {
      console.log('selectModel > model :', this.model)
      this.$emit('selectedRef', this.refKey, this.model._id)
    }
  },
  watch: {
    async search(val) {
      if (this.items.length > 0) return
      if (this.isLoading) return

      this.isLoading = true

      let payload = {}
      payload.pagination = {
        descending: false,
        page: 1,
        rowsPerPage: 100000, // -1 for All
        sortBy: '',
        totalItems: 1
      }
      await this.$store.dispatch(this.refType + '/search', payload)
      this.isLoading = false
    }
  },
  created() {
    console.log('refKey & refObject : ', this.refKey, this.refObject)
  }
}
</script>