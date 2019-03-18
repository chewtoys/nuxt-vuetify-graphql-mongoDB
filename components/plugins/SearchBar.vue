<template>
  <v-container style="padding:12px;" grid-list-md>
    <v-layout row wrap>
      <v-flex xs12 sm5 lg2 v-if="isUseForm('keywords')">
        <v-select v-model="selectedKey" :items="selectKeys" label="Select"></v-select>
      </v-flex>
      <v-flex xs12 sm6 lg3 v-if="isUseForm('keywords')">
        <v-text-field label="keywords" prepend-inner-icon="search" v-model="keywords"></v-text-field>
      </v-flex>
      <v-spacer v-if="isUseForm('keywords')"/>
      <v-flex xs11 sm5 lg2 v-if="isUseForm('period')">
        <v-menu
          ref="menu1"
          :close-on-content-click="false"
          v-model="menu1"
          lazy
          transition="scale-transition"
          offset-y
        >
          <v-text-field
            slot="activator"
            :value="formatDate(startDate)"
            label="StartDate"
            prepend-inner-icon="event"
            readonly
          ></v-text-field>
          <v-date-picker v-model="startDate" no-title @input="menu1 = false"></v-date-picker>
        </v-menu>
      </v-flex>

      <v-flex xs11 sm5 lg2 v-if="isUseForm('period')">
        <v-menu
          :close-on-content-click="false"
          v-model="menu2"
          lazy
          transition="scale-transition"
          offset-y
        >
          <v-text-field
            slot="activator"
            :value="formatDate(endDate)"
            label="EndDate"
            prepend-inner-icon="event"
            readonly
          ></v-text-field>
          <v-date-picker v-model="endDate" no-title @input="menu2 = false"></v-date-picker>
        </v-menu>
        <!-- <p>Date in ISO format:
          <strong>{{ date }}</strong>
        </p>-->
      </v-flex>
      <v-flex>
        <v-btn round color="indigo darken-4" dark @click="search">Search</v-btn>
        <v-btn round color="indigo darken-2" dark @click="reset">Reset</v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
export default {
  props: ['selectKeys', 'dateKeys', 'useSearchForm'],
  data: () => ({
    startDate: null,
    endDate: null,
    menu1: false,
    menu2: false,
    selectedKey: null,
    keywords: null
  }),

  methods: {
    formatDate(date) {
      if (!date) return null
      const [year, month, day] = date.split('-')
      return `${year}-${month}-${day}`
    },
    parseDate(date) {
      if (!date) return null

      const [month, day, year] = date.split('/')
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    },
    search() {
      console.log('search :', this.selectKeys)
      const payload = {}
      if (this.isUseForm('keywords')) {
        if (this.keywords) {
          if (!this.selectedKey) {
            this.selectKeys.forEach(key => {
              console.log('key :', key)
              payload[key] = this.keywords
            })
          } else payload[this.selectedKey] = this.keywords
        }
      }
      if (this.isUseForm('period')) {
        if (this.startDate) {
          payload.startDate = this.startDate
        }
        if (this.endDate) {
          payload.endDate = this.endDate
        }
      }
      this.$emit('search', payload)
    },
    reset() {
      this.selectedKey = null
      this.keywords = null
      this.startDate = null
      this.endDate = null
    },
    isUseForm(key) {
      return this.useSearchForm.includes(key)
    }
  }
}
</script>