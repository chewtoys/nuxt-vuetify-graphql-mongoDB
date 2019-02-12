/*eslint-env es6*/
/*eslint no-inner-declarations: 2*/
<template>
  <v-card flat>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-flex xs12 sm6></v-flex>
      <v-text-field v-model="name" :counter="10" :rules="nameRules" label="Name" required></v-text-field>
      <v-text-field v-model="email" :rules="emailRules" label="E-mail" required></v-text-field>
      <v-text-field
        v-model="password"
        :rules="passwordRules"
        label="Password"
        :append-icon="showPassword ? 'visibility_off' : 'visibility'"
        @click:append="showPassword = !showPassword"
        :type="showPassword ? 'text' : 'password'"
      />
      <v-text-field
        v-model="passconf"
        :rules="passconfRules"
        label="Password Confirm"
        :append-icon="showPassconf ? 'visibility_off' : 'visibility'"
        @click:append="showPassconf = !showPassconf"
        :type="showPassconf ? 'text' : 'password'"
      />
      <v-checkbox
        v-model="agree"
        :rules="[v => !!v || 'You must agree to continue!']"
        color="green"
      >
        <div slot="label" @click.stop>
          Do you accept the
          <a href="javascript:;" @click.stop="terms = true">terms</a>
          and
          <a href="javascript:;" @click.stop="conditions = true">conditions?</a>
        </div>
      </v-checkbox>
      <v-btn class="d-none" color="success" @click="validate">Validate</v-btn>
      <v-btn class="d-none" color="error" @click="reset">Reset Form</v-btn>
      <v-btn class="d-none" color="warning" @click="resetValidation">Reset Validation</v-btn>
      <v-card-actions>
        <v-btn flat>
          <nuxt-link to="/">Cancel</nuxt-link>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn flat color="primary" @click="signup">Register</v-btn>
      </v-card-actions>
    </v-form>
    <v-dialog v-model="terms" width="70%">
      <v-card>
        <v-card-title class="title">Terms</v-card-title>
        <v-card-text v-for="n in 5" :key="n">{{ content }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat color="purple" @click="terms = false">Ok</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="conditions" width="70%">
      <v-card>
        <v-card-title class="title">Conditions</v-card-title>
        <v-card-text v-for="n in 5" :key="n">{{ content }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat color="purple" @click="conditions = false">Ok</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import Cookies from 'js-cookie'
import signup from '../graphql/mutation/signup.gql'

export default {
  name: 'signup',
  layout: 'card',
  middleware: 'authenticated',
  components: {},
  data: function() {
    return {
      valid: true,
      name: '',
      nameRules: [
        v => !!v || '이름은 필수입니다.',
        v => (v && v.length <= 20) || '이름은 20자 보다 작거나 같아야 합니다.'
      ],
      email: '',
      emailRules: [
        v => !!v || '이메일은 필수입니다.',
        v => /.+@.+/.test(v) || '이메일이 유효하지 않습니다.'
      ],
      password: '',
      showPassword: false,
      passwordRules: [
        v => !!v || '패스워드는 필수입니다.',
        v =>
          /(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/.test(v) ||
          '패스워드는 영문,숫자,기호의 조합으로 만들어져야 합니다.'
      ], // strong /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/.test(v)
      passconf: '',
      showPassconf: false,
      passconfRules: [
        v => !!v || '패스워드 확인은 필수입니다.',
        v => (v && v === this.password) || '패스워드가 일치하지 않습니다.'
      ],
      agree: false,
      content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc.`,
      conditions: false,
      terms: false
    }
  },
  methods: {
    async signup() {
      if (this.validate()) {
        try {
          const result = await this.$apollo.mutate({
            mutation: signup,
            variables: {
              email: this.email,
              password: this.password,
              name: this.name
            }
          })
          Cookies.set('accessToken', result.data.signup.accessToken, {
            expires: 1
          })
          this.$store.commit('SET_ACCESS_TOKEN', result.data.signup.accessToken)
          this.$store.commit('SET_USER', result.data.signin.user)
          this.$router.push('/post')
        } catch (error) {
          this.loading--
        }
      } else return false
    },
    validate() {
      if (this.$refs.form.validate()) return true
      else return false
    },
    reset() {
      this.$refs.form.reset()
    },
    resetValidation() {
      this.$refs.form.resetValidation()
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
