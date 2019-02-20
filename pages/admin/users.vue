<template>
  <div>
    <v-toolbar flat>
      <v-toolbar-title>Users</v-toolbar-title>
      <v-divider class="mx-2" inset vertical></v-divider>
      <v-spacer></v-spacer>
      <v-dialog v-model="dialog" max-width="500px">
        <v-btn slot="activator" color="primary" dark class="mb-2">New Item</v-btn>
        <v-card>
          <v-card-title>
            <span class="headline">{{ formTitle }}</span>
          </v-card-title>

          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12 sm6 md4>
                  <v-text-field v-model="editedItem.name" label="User name"></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-text-field v-model="editedItem.email" disabled label="Email"></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-text-field v-model="editedItem.role" label="Role"></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-text-field v-model="editedItem.carbs" label="Carbs (g)"></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-text-field v-model="editedItem.protein" label="Protein (g)"></v-text-field>
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
    <v-data-table :headers="headers" :items="users" class="elevation-1">
      <template slot="items" slot-scope="props">
        <td>{{ props.item.name }}</td>
        <td class="text-xs-right">{{ props.item.email }}</td>
        <td class="text-xs-right">{{ props.item.created | moment('timezone', 'Asia/Seoul', 'LLLL')}}</td>
        <td
          class="text-xs-right"
        >{{ props.item.loggedIn | moment('timezone', 'Asia/Seoul', 'LLLL')}}</td>
        <td class="text-xs-right">{{ props.item.role }}</td>
        <td class="justify-center layout px-0">
          <v-icon small class="mr-2" @click="editItem(props.item)">edit</v-icon>
          <v-icon small @click="deleteItem(props.item)">delete</v-icon>
        </td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import adminPerimeter from '~/kindergarten/perimeters/admin'
export default {
  name: 'admin-users',
  layout: 'admin',
  routePerimeter: adminPerimeter,
  data() {
    return {
      dialog: false,
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
        { text: 'Role', value: 'role' },
        { text: 'Actions', value: 'name', sortable: false }
      ],
      editedIndex: -1,
      editedItem: {
        name: '',
        email: 0,
        role: 0,
        carbs: 0,
        protein: 0
      },
      defaultItem: {
        name: '',
        email: 0,
        role: 0,
        carbs: 0,
        protein: 0
      }
    }
  },
  computed: {
    users() {
      return this.$store.getters.users
    },
    formTitle() {
      return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
    }
  },
  watch: {
    dialog(val) {
      val || this.close()
    }
  },
  methods: {
    initialize() {
      this.$store.dispatch('userList')
    },
    editItem(item) {
      this.editedIndex = this.users.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    deleteItem(item) {
      // const index = this.users.indexOf(item)
      // confirm('Are you sure you want to delete this item?') &&
      //   this.users.splice(index, 1)
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
        // Object.assign(this.users[this.editedIndex], this.editedItem)
        this.$store.dispatch('updateUser', this.editedItem)
      } else {
        this.users.push(this.editedItem)
      }
      this.close()
    }
  },
  created() {
    this.initialize()
  }
}
</script>
