/*eslint-env es6*/
/*eslint no-inner-declarations: 2*/
<template>
  <v-card flat>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-flex xs12 sm6></v-flex>
      <v-text-field v-model="email" :rules="emailRules" label="E-mail" required></v-text-field>
      <v-text-field
        v-model="password"
        :rules="passwordRules"
        label="Password"
        :append-icon="showPassword ? 'visibility_off' : 'visibility'"
        @click:append="showPassword = !showPassword"
        :type="showPassword ? 'text' : 'password'"
      />
      <v-card-actions>
        <v-btn flat>
          <nuxt-link to="/">Cancel</nuxt-link>
        </v-btn>
        <v-btn flat>
          <nuxt-link to="/signup">SignUp</nuxt-link>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn flat color="primary" @click="signin">SignIn</v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>
import signin from '../graphql/mutation/signin.gql'

export default {
  name: 'signin',
  layout: 'card',
  components: {},
  data: function() {
    return {
      valid: true,
      email: '',
      emailRules: [
        v => !!v || '이메일은 필수입니다.',
        v => /.+@.+/.test(v) || '이메일이 유효하지 않습니다.'
      ],
      password: '',
      showPassword: false,
      passwordRules: [v => !!v || '패스워드는 필수입니다.']
    }
  },
  methods: {
    async signin() {
      if (this.validate()) {
        try {
          const result = await this.$apollo.mutate({
            mutation: signin,
            variables: {
              email: this.email,
              password: this.password
            }
          })
          this.$store.dispatch('signin', result.data.signin)
          this.$router.push('/')
        } catch (error) {
          this.loading--
        }
      } else return false
    },
    validate() {
      if (this.$refs.form.validate()) return true
      else return false
    }
  }
}
</script>

<style scoped>
.register-card {
  max-width: 340px;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 2px 1px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
}
.submit-button {
  width: 100%;
}
.error {
  margin-bottom: 10px;
}
</style>
