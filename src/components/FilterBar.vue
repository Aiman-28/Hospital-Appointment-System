<script setup>
// Department / status / doctor filters, sort and reset. The doctor list narrows to the chosen department.
import { computed, watch } from 'vue'
import { DEPARTMENTS, STATUSES, state } from '../store'
const filters = defineModel({ type: Object })
const props = defineProps({ doctors: Array })
defineEmits(['reset'])
const doctorOptions = computed(() =>
  filters.value.dept
    ? state.doctors.filter((d) => d.department === filters.value.dept).map((d) => d.name)
    : props.doctors
)
watch(
  () => filters.value.dept,
  () => {
    if (filters.value.doctor && !doctorOptions.value.includes(filters.value.doctor))
      filters.value.doctor = ''
  }
)
</script>


<template>
  <div class="filters">
    <select class="input" v-model="filters.dept" aria-label="Department">
      <option value="">All departments</option>
      <option v-for="d in DEPARTMENTS" :key="d">{{ d }}</option>
    </select>
    <select class="input" v-model="filters.status" aria-label="Status">
      <option value="">All statuses</option>
      <option v-for="s in STATUSES" :key="s">{{ s }}</option>
    </select>
    <select class="input" v-model="filters.doctor" aria-label="Doctor">
      <option value="">All doctors</option>
      <option v-for="d in doctorOptions" :key="d">{{ d }}</option>
    </select>
    <select class="input" v-model="filters.sort" aria-label="Sort">
      <option value="newest">Date: newest first</option>
      <option value="oldest">Date: oldest first</option>
      <option value="az">Patient A–Z</option>
      <option value="za">Patient Z–A</option>
    </select>
    <button class="btn ghost" data-tip="Clear search and filters" @click="$emit('reset')">
      Reset
    </button>
  </div>
</template>
