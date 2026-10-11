<script setup>
// Login form with inline validation and a short simulated delay.
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AuthShell from '../components/AuthShell.vue'
import { login, toast } from '../store'

const router = useRouter(),
  route = useRoute()

// Form values, banner error, and per-field errors
const form = reactive({ email: '', password: '' })
const error = ref(''),
  isSubmitting = ref(false),
  fieldErrors = reactive({})

function submit() {
  error.value = ''
  fieldErrors.email = /^\S+@\S+\.\S+$/.test(form.email) ? '' : 'Enter a valid email address.'
  fieldErrors.password = form.password ? '' : 'Enter your password.'
  if (fieldErrors.email || fieldErrors.password) return
  isSubmitting.value = true
  setTimeout(() => {
    const result = login(form.email, form.password)
    isSubmitting.value = false
    if (!result.ok) {
      error.value = result.error
      return
    }
    toast('Welcome back!')
    router.push(route.query.redirect || '/dashboard')
  }, 400)
}
</script>


<template>
  <AuthShell>
    <h2>Log in</h2>
    <p class="sub">Access your appointment dashboard.</p>
    <transition name="fade">
      <div v-if="error" class="alert" role="alert">{{ error }}</div>
    </transition>
    <form novalidate @submit.prevent="submit">
      <div class="field">
        <label for="e">Email</label>
        <input
          id="e"
          class="input"
          :class="{ bad: fieldErrors.email }"
          type="email"
          v-model="form.email"
          autocomplete="email"
        />
        <span class="err" v-if="fieldErrors.email">{{ fieldErrors.email }}</span>
      </div>
      <div class="field">
        <label for="p">Password</label>
        <input
          id="p"
          class="input"
          :class="{ bad: fieldErrors.password }"
          type="password"
          v-model="form.password"
          autocomplete="current-password"
        />
        <span class="err" v-if="fieldErrors.password">{{ fieldErrors.password }}</span>
      </div>
      <button class="btn" style="width: 100%; justify-content: center" :disabled="isSubmitting">
        {{ isSubmitting ? 'Logging in…' : 'Log in' }}
      </button>
    </form>
    <p class="sub" style="margin: 16px 0 0">
      New here?
      <router-link to="/signup">Create an account</router-link>
    </p>
  </AuthShell>
</template>
