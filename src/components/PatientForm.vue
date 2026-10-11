<script setup>
// Register / edit patient with validation.
import { reactive, computed, ref } from 'vue'
import { state, COUNTRIES } from '../store'
const props = defineProps({ item: Object })
const emit = defineEmits(['save', 'close'])
const form = reactive({
  name: '',
  email: '',
  phone: '',
  age: '',
  gender: 'Female',
  city: '',
  cc: 'PK',
  blood: 'O+',
  ...(props.item || {}),
})
const submitted = ref(false)
const errors = computed(() => ({
  name: form.name.trim().length < 2 && 'Enter the full name.',
  email: !/^\S+@\S+\.\S+$/.test(form.email)
    ? 'Enter a valid email.'
    : state.patients.some((p) => p.email === form.email.toLowerCase() && p.id !== props.item?.id) &&
      'A patient with this email exists.',
  phone: form.phone.replace(/\D/g, '').length < 7 && 'Enter a valid phone number.',
  age: !(form.age > 0 && form.age < 120) && 'Enter an age between 1 and 119.',
  city: !form.city.trim() && 'Enter a city.',
}))
function submit() {
  submitted.value = true
  if (Object.values(errors.value).some(Boolean)) return
  emit('save', { ...form, email: form.email.toLowerCase(), age: +form.age })
}
const FIELDS = [
  ['name', 'Full name', 'text'],
  ['email', 'Email', 'email'],
  ['phone', 'Phone', 'text'],
  ['age', 'Age', 'number'],
  ['city', 'City', 'text'],
]
</script>


<template>
  <div class="overlay" @mousedown.self="$emit('close')">
    <form class="modal" novalidate @submit.prevent="submit" @keydown.esc="$emit('close')">
      <h2>{{ item ? 'Edit patient' : 'Register patient' }}</h2>
      <div class="row2">
        <div v-for="field in FIELDS" :key="field[0]" class="field">
          <label>{{ field[1] }}</label>
          <input
            class="input"
            :type="field[2]"
            :class="{ bad: submitted && errors[field[0]] }"
            v-model="form[field[0]]"
          />
          <span class="err" v-if="submitted && errors[field[0]]">{{ errors[field[0]] }}</span>
        </div>
        <div class="field">
          <label>Country</label>
          <select class="input" v-model="form.cc">
            <option v-for="(c, k) in COUNTRIES" :key="k" :value="k">{{ c[0] }}</option>
          </select>
        </div>
        <div class="field">
          <label>Gender</label>
          <select class="input" v-model="form.gender">
            <option>Female</option>
            <option>Male</option>
          </select>
        </div>
        <div class="field">
          <label>Blood group</label>
          <select class="input" v-model="form.blood">
            <option v-for="b in ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']" :key="b">
              {{ b }}
            </option>
          </select>
        </div>
      </div>
      <div class="mfoot">
        <button type="button" class="btn ghost" @click="$emit('close')">Cancel</button>
        <button class="btn">{{ item ? 'Save changes' : 'Register' }}</button>
      </div>
    </form>
  </div>
</template>
