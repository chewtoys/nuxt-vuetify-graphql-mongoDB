<template>
  <div>
    <p>Users</p>
    <v-data-table :headers="headers" :items="users" class="elevation-1">
      <template slot="items" slot-scope="props">
        <td>{{ props.item.name }}</td>
        <td class="text-xs-right">{{ props.item.email }}</td>
        <td
          class="text-xs-right"
        >{{ this.$nuxt.$moment(String(props.item.created)).format('MM/DD/YYYY hh:mm') }}</td>
        <td class="text-xs-right">{{ props.item.loggedIn }}</td>
        <td class="text-xs-right">{{ props.item.role }}</td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  name: 'admin-users',
  layout: 'admin',
  data() {
    return {
      headers: [
        {
          text: 'Name',
          align: 'left',
          sortable: false,
          value: 'name'
        },
        { text: 'Email', align: 'center', value: 'email' },
        { text: 'Created', align: 'center', value: 'created' },
        { text: 'LoggedIn', align: 'center', value: 'loggedIn' },
        { text: 'Role', value: 'role' }
      ]
    }
  },
  computed: {
    users() {
      return this.$store.getters.users
    }
  },
  created() {
    this.$store.dispatch('userList')
    console.log('kk:', this.$store)
  }
}
</script>
