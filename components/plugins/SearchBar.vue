<template>
  <v-card class="mx-0 my-2">
    <v-container grid-list-md outline>
      <v-layout row wrap>
        <v-flex xs12 sm5 lg3 v-if="isUseForm('keywords')">
          <v-select v-model="selectedKeywordsFor" :items="selectKeys" label="Keywords" multiple></v-select>
        </v-flex>
        <v-flex xs12 sm6 lg3 v-if="isUseForm('keywords')">
          <v-text-field label="search keywords" prepend-inner-icon="search" v-model="keywords"></v-text-field>
        </v-flex>
        <v-spacer/>
        <v-flex>
          <v-btn round color="indigo darken-4" dark @click.stop="search">Search</v-btn>
          <v-btn round color="indigo darken-2" dark @click.stop="reset">Reset</v-btn>
        </v-flex>
        <v-btn icon @click="show = !show">
          <v-icon>{{ show ? 'keyboard_arrow_down' : 'keyboard_arrow_up' }}</v-icon>
        </v-btn>
      </v-layout>
      <v-slide-y-transition>
        <div v-show="show">
          <v-layout row wrap>
            <v-flex xs12 sm5 lg3 v-if="isUseForm('period')">
              <v-select v-model="selectedDateFor" :items="dateKeys" label="Dates" multiple></v-select>
            </v-flex>
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
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <v-flex xs12 sm5 lg3 v-if="isUseForm('range')">
              <v-select v-model="selectedRangeFor" :items="numericKeys" label="Range" multiple></v-select>
            </v-flex>
            <v-flex
              shrink
              style="width: 80px"
            >
              <v-text-field
                v-model="range[0]"
                class="mt-0"
                hide-details
                single-line
                type="number"
              ></v-text-field>
            </v-flex>

            <v-flex xs11 sm5 lg5>
              <v-range-slider
                v-model="range"
                :max="100"
                :min="0"
                :step="1"
              ></v-range-slider>
            </v-flex>

            <v-flex
              shrink
              style="width: 80px"
            >
              <v-text-field
                v-model="range[1]"
                class="mt-0"
                hide-details
                single-line
                type="number"
              ></v-text-field>
            </v-flex>
          </v-layout>
        </div>
      </v-slide-y-transition>
    </v-container>
  </v-card>
</template>
<script>
export default {
  props: ['selectKeys', 'dateKeys', 'numericKeys', 'useSearchForm'],
  data: () => ({
    startDate: null,
    endDate: null,
    menu1: false,
    menu2: false,
    selectedKeywordsFor: [],
    selectedDateFor: [],
    selectedRangeFor: [],
    keywords: null,
    show: false,
    range: [0, 100]
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
      if (this.isUseForm('keywords') && this.keywords && this.selectedKeywordsFor.length > 0) {
            payload.keywords = {kind: this.selectedKeywordsFor, keywords: this.keywords.replace(" ", '').split(',')}
      }
      if (this.isUseForm('period')) {
        const dates = {}
        if (this.startDate) {
          dates.startDate = this.startDate
        }
        if (this.endDate) {
          dates.endDate = this.endDate
        }
        if (Object.keys(dates).length > 0) {
          if (this.selectedDateFor.length > 0) {
            payload.period = { kind: this.selectedDateFor, ...dates }
          }
        }
      }
      if(this.selectedRangeFor.length > 0){
        payload.range = {kind:this.selectedRangeFor, min: this.range[0], max: this.range[1]}
      }
      this.$emit('search', payload)
    },
    reset() {
      this.selectedKeywordsFor = []
      this.selectedDateFor = []
      this.selectedRangeFor = []
      this.range = [0, 100]
      this.keywords = null
      this.startDate = null
      this.endDate = null
      this.$emit('resetSearchPayload')
    },
    isUseForm(key) {
      return this.useSearchForm.includes(key)
    }
  }
}
</script>