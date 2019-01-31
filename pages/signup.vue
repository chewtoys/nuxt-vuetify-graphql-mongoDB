/*eslint no-inner-declarations: 2*/
/*eslint-env es6*/
<template>
  <!-- <el-card class="register-card">
    <div slot="header">
      {{ $t('Sign up') }}
    </div>
    <div>
      <el-alert
        class="error"
        v-for="(error, key) in errors"
        :title="error"
        :key="key"
        type="error" />

      <el-form
        :model="registerForm"
        :rules="rules"
        ref="registerForm"
        class="login-form">

        <el-form-item prop="name">
          <el-input
            v-model="registerForm.name"
            :placeholder="$t('Name')" />
        </el-form-item>

        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            :placeholder="$t('Email')" />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            type="password"
            v-model="registerForm.password"
            :placeholder="$t('Password')"
            auto-complete="off" />
        </el-form-item>

        <el-button
          type="primary"
          class="submit-button"
          @click="submit()"
          :loading="loading>0">
          {{ $t('Register') }}
        </el-button>

        <div class="clearfix">
          {{ $t('Already have an account?') }}
          <app-link to="/login">
            <el-button type="text">{{ $t('Login') }}</el-button>
          </app-link>
        </div>
      </el-form>
    </div>
  </el-card>-->
  <v-form>
    <v-text-field v-model="user.name" placeholder="Name" required/>
    <v-text-field label="Enter your e-mail address" v-model="user.email" required></v-text-field>
    <v-text-field
      label="Enter your password"
      v-model="user.password"
      min="8"
      type="password"
      required
    ></v-text-field>
    <v-layout justify-space-between>
      <v-btn @click="register" class="blue darken-4 white--text">SignUp</v-btn>
      <v-btn @click="login" class="blue darken-4 white--text">Login</v-btn>
      <nuxt-link to="/">Home</nuxt-link>
    </v-layout>
  </v-form>
</template>

<script>
import Cookies from 'js-cookie'
import register from '../graphql/mutation/signup.gql'
import login from '../graphql/mutation/login.gql'
export default {
  name: 'signup',
  layout: 'card',
  middleware: 'authenticated',
  components: {},
  data() {
    return {
      loading: 0,
      errors: [],
      valid: true,
      user: {
        name: 'test',
        email: 'test@dks.com',
        password: '1234qwer'
      },
      rules: {
        name: [
          {
            required: true,
            message: 'This field is required',
            trigger: 'submit'
          }
        ],
        email: [
          {
            required: true,
            message: 'This field is required',
            trigger: 'submit'
          }
        ],
        password: [
          {
            required: true,
            message: 'This field is required',
            trigger: 'submit'
          }
        ]
      }
    }
  },
  methods: {
    async register() {
      console.log(' this.user', this.user)
      const validateName = name => {
        if (!name.length) {
          return { valid: false, error: 'This field is required' }
        }
        return { valid: true, error: null }
      }

      const validateEmail = email => {
        if (!email.length) {
          return { valid: false, error: 'This field is required' }
        }
        if (!email.match(/^\w+([.-]?\w+)_@\w+(_[_.-]?\w+)_(.\w{2,3})+$/)) {
          return { valid: false, error: 'Please, enter a valid email.' }
        }
        return { valid: true, error: null }
      }

      const validatePassword = password => {
        if (!password.length) {
          return { valid: false, error: 'This field is required' }
        }
        if (password.length < 7) {
          return { valid: false, error: 'Password is too short' }
        }
        return { valid: true, error: null }
      }

      this.errors = {}

      const validName = validateName(this.user.name)
      console.log('validName :', validName)
      this.errors.name = validName.error
      if (this.valid) {
        this.valid = validName.valid
      }

      const validEmail = validateEmail(this.user.email)
      console.log('validEmail :', validEmail)
      this.errors.email = validEmail.error
      if (this.valid) {
        this.valid = validEmail.valid
      }

      const validPassword = validatePassword(this.user.password)
      console.log('validPassword :', validPassword)
      this.errors.password = validPassword.error
      if (this.valid) {
        this.valid = validPassword.valid
      }
      this.valid = true
      console.log('valid:', this.valid)
      if (this.valid) {
        try {
          const { email, password } = this.user
          const result = await this.$apollo.mutate({
            mutation: register,
            variables: { email, password }
          })
          Cookies.set('accessToken', result.data.login.accessToken, {
            expires: 365
          })
          this.$store.commit('SET_ACCESS_TOKEN', result.data.login.accessToken)
          // https://github.com/apollographql/apollo-client/issues/2919
          // this.$apollo.provider.defaultClient.resetStore()
          this.$router.push('/post')
        } catch (error) {
          this.loading--
        }
      } else return false
    },
    async login() {
      console.log(' this.user', this.user)
      const validateName = name => {
        if (!name.length) {
          return { valid: false, error: 'This field is required' }
        }
        return { valid: true, error: null }
      }

      const validateEmail = email => {
        if (!email.length) {
          return { valid: false, error: 'This field is required' }
        }
        if (!email.match(/^\w+([.-]?\w+)_@\w+(_[_.-]?\w+)_(.\w{2,3})+$/)) {
          return { valid: false, error: 'Please, enter a valid email.' }
        }
        return { valid: true, error: null }
      }

      const validatePassword = password => {
        if (!password.length) {
          return { valid: false, error: 'This field is required' }
        }
        if (password.length < 7) {
          return { valid: false, error: 'Password is too short' }
        }
        return { valid: true, error: null }
      }

      this.errors = {}

      const validName = validateName(this.user.name)
      console.log('validName :', validName)
      this.errors.name = validName.error
      if (this.valid) {
        this.valid = validName.valid
      }

      const validEmail = validateEmail(this.user.email)
      console.log('validEmail :', validEmail)
      this.errors.email = validEmail.error
      if (this.valid) {
        this.valid = validEmail.valid
      }

      const validPassword = validatePassword(this.user.password)
      console.log('validPassword :', validPassword)
      this.errors.password = validPassword.error
      if (this.valid) {
        this.valid = validPassword.valid
      }
      this.valid = true
      console.log('valid:', this.valid)
      if (this.valid) {
        // alert('HURRAAYYY!! :-)\n\n' + JSON.stringify(this.user))

        try {
          const { email, password } = this.user
          const result = await this.$apollo.mutate({
            mutation: login,
            variables: { email, password }
          })
          Cookies.set('accessToken', result.data.login.accessToken, {
            expires: 365
          })
          this.$store.commit('SET_ACCESS_TOKEN', result.data.login.accessToken)
          // https://github.com/apollographql/apollo-client/issues/2919
          this.$apollo.provider.defaultClient.resetStore()
          this.$router.push('/post')
        } catch (error) {
          this.loading--
        }
      } else return false
    }
    // submit() {
    //   this.$refs.registerForm.validate(async valid => {
    //     if (valid) {
    //       this.loading++
    //       try {
    //         const { name, email, password } = this.registerForm
    //         await this.$apollo.mutate({
    //           mutation: register,
    //           variables: { name, payload: { email: { email, password } } }
    //         })
    //         const result = await this.$apollo.mutate({
    //           mutation: login,
    //           variables: { payload: { email, password } }
    //         })
    //         Cookies.set('accessToken', result.data.login.accessToken, {
    //           expires: 365
    //         })
    //         this.$store.commit(
    //           'SET_ACCESS_TOKEN',
    //           result.data.login.accessToken
    //         )
    //         // https://github.com/apollographql/apollo-client/issues/2919
    //         await this.$apollo.provider.defaultClient.resetStore()
    //         this.$router.push('/' + (this.$route.params.locale || ''))
    //       } catch (error) {
    //         this.loading--
    //         this.errors.push(error.message)
    //         console.log(JSON.stringify(error))
    //       }
    //     } else {
    //       return false
    //     }
    //   })
    // }
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
