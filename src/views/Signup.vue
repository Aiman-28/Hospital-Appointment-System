<script setup>
// Sign-up form: errors are computed live and only shown after the first submit.
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AuthShell from '../components/AuthShell.vue'
import { signup, toast } from '../store'


const router = useRouter()
const form = reactive({ name: '', email: '', password: '', confirm: '' })
const submitted = ref(false),
  error = ref('')
const errors = computed(() => {
  const e = {}
  if (form.name.trim().length < 2) e.name = 'Enter your full name.'
  if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address.'
  if (!form.password) e.password = 'Choose a password.'
  else if (form.password.length < 6) e.password = 'Use at least 6 characters.'
  if (form.confirm !== form.password || !form.confirm) e.confirm = 'Passwords do not match.'
  return e
})

function submit() {
  submitted.value = true
  error.value = ''
  if (Object.keys(errors.value).length) return
  const result = signup({ name: form.name, email: form.email, password: form.password })
  if (!result.ok) {
    error.value = result.error
    return
  }
  toast('Account created. Log in to continue.')
  router.push('/login')
}
</script>


<template>
  <AuthShell>
    <h2>Create account</h2>
    <p class="sub">Start managing appointments in minutes.</p>
    <transition name="fade">
      <div v-if="error" class="alert" role="alert">{{ error }}</div>
    </transition>
    <form novalidate @submit.prevent="submit">
      <div class="field">
        <label>Full name</label>
        <input class="input" :class="{ bad: submitted && errors.name }" v-model="form.name" />
        <span class="err" v-if="submitted && errors.name">{{ errors.name }}</span>
      </div>
      <div class="field">
        <label>Email</label>
        <input
          class="input"
          type="email"
          :class="{ bad: submitted && errors.email }"
          v-model="form.email"
        />
        <span class="err" v-if="submitted && errors.email">{{ errors.email }}</span>
      </div>
      <div class="field">
        <label>Password</label>
        <input
          class="input"
          type="password"
          :class="{ bad: submitted && errors.password }"
          v-model="form.password"
        />
        <span class="err" v-if="submitted && errors.password">{{ errors.password }}</span>
      </div>
      <div class="field">
        <label>Confirm password</label>
        <input
          class="input"
          type="password"
          :class="{ bad: submitted && errors.confirm }"
          v-model="form.confirm"
        />
        <span class="err" v-if="submitted && errors.confirm">{{ errors.confirm }}</span>
      </div>
      <button class="btn" style="width: 100%; justify-content: center">Sign up</button>
    </form>
    <p class="sub" style="margin: 16px 0 0">
      Already registered?
      <router-link to="/login">Log in</router-link>
    </p>
  </AuthShell>
</template>
