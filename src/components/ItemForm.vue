<script setup>
// Create / edit appointment. Doctor list follows the chosen department; patient email auto-fills.
import { reactive, computed, ref, watch } from 'vue'
import { state, DEPARTMENTS, STATUSES, iso, patientByName } from '../store'
const props = defineProps({ item: Object, prefill: Object })
const emit = defineEmits(['save', 'close'])
const form = reactive({
  patientName: '',
  patientEmail: '',
  doctor: '',
  department: DEPARTMENTS[0],
  date: iso(),
  time: '09:00',
  reason: '',
  status: 'Scheduled',
  ...(props.prefill || {}),
  ...(props.item || {}),
})
const departmentDoctors = computed(() =>
  state.doctors.filter((d) => d.department === form.department)
)
if (!form.doctor) form.doctor = departmentDoctors.value[0]?.name || ''
watch(
  () => form.department,
  () => {
    if (!departmentDoctors.value.some((d) => d.name === form.doctor))
      form.doctor = departmentDoctors.value[0]?.name || ''
  }
)
watch(
  () => form.patientName,
  (n) => {
    const p = patientByName(n)
    if (p) form.patientEmail = p.email
  }
)
const touched = reactive({}),
  submitted = ref(false)
const errors = computed(() => {
  const e = {}
  if (form.patientName.trim().length < 2) e.patientName = 'Enter the patient’s full name.'
  if (!/^\S+@\S+\.\S+$/.test(form.patientEmail))
    e.patientEmail = 'Enter a valid email, like name@example.com.'
  if (!form.doctor) e.doctor = 'Choose a doctor.'
  if (!form.date) e.date = 'Pick a date.'
  if (!form.time) e.time = 'Pick a time.'
  if (form.reason.trim().length < 5) e.reason = 'Describe the reason in at least 5 characters.'
  return e
})
const showError = (k) => (touched[k] || submitted.value) && errors.value[k]
function submit() {
  submitted.value = true
  if (Object.keys(errors.value).length) return
  emit('save', { ...form, patientName: form.patientName.trim(), reason: form.reason.trim() })
}
</script>


<template>
  <div class="overlay" @mousedown.self="$emit('close')">
    <form class="modal" novalidate @submit.prevent="submit" @keydown.esc="$emit('close')">
      <h2>{{ item ? 'Edit appointment' : 'New appointment' }}</h2>
      <datalist id="pl">
        <option v-for="p in state.patients" :key="p.id" :value="p.name" />
      </datalist>
      <div class="row2">
        <div class="field">
          <label>Patient name</label>
          <input
            class="input"
            list="pl"
            :class="{ bad: showError('patientName') }"
            v-model="form.patientName"
            @blur="touched.patientName = true"
          />
          <span class="err" v-if="showError('patientName')">{{ errors.patientName }}</span>
        </div>
        <div class="field">
          <label>Patient email</label>
          <input
            class="input"
            type="email"
            :class="{ bad: showError('patientEmail') }"
            v-model="form.patientEmail"
            @blur="touched.patientEmail = true"
          />
          <span class="err" v-if="showError('patientEmail')">{{ errors.patientEmail }}</span>
        </div>
        <div class="field">
          <label>Department</label>
          <select class="input" v-model="form.department">
            <option v-for="d in DEPARTMENTS" :key="d">{{ d }}</option>
          </select>
        </div>
        <div class="field">
          <label>Doctor</label>
          <select class="input" :class="{ bad: showError('doctor') }" v-model="form.doctor">
            <option v-for="d in departmentDoctors" :key="d.id" :value="d.name">
              {{ d.name }} ({{ d.city }})
            </option>
          </select>
          <span class="err" v-if="showError('doctor')">{{ errors.doctor }}</span>
        </div>
        <div class="field">
          <label>Date</label>
          <input
            class="input"
            type="date"
            :class="{ bad: showError('date') }"
            v-model="form.date"
            @blur="touched.date = true"
          />
          <span class="err" v-if="showError('date')">{{ errors.date }}</span>
        </div>
        <div class="field">
          <label>Time</label>
          <input
            class="input"
            type="time"
            :class="{ bad: showError('time') }"
            v-model="form.time"
            @blur="touched.time = true"
          />
          <span class="err" v-if="showError('time')">{{ errors.time }}</span>
        </div>
      </div>
      <div class="field">
        <label>Reason for visit</label>
        <textarea
          class="input"
          rows="3"
          :class="{ bad: showError('reason') }"
          v-model="form.reason"
          @blur="touched.reason = true"
        ></textarea>
        <span class="err" v-if="showError('reason')">{{ errors.reason }}</span>
      </div>
      <div class="field">
        <label>Status</label>
        <select class="input" v-model="form.status">
          <option v-for="s in STATUSES" :key="s">{{ s }}</option>
        </select>
      </div>
      <div class="mfoot">
        <button type="button" class="btn ghost" @click="$emit('close')">Cancel</button>
        <button class="btn">{{ item ? 'Save changes' : 'Add appointment' }}</button>
      </div>
    </form>
  </div>
</template>
