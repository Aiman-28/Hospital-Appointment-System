<script setup>
// Doctors directory: search + department + region filters.
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Avatar from '../components/Avatar.vue'
import Flag from '../components/Flag.vue'
import { state, DEPARTMENTS, COUNTRIES } from '../store'
const router = useRouter(),
  route = useRoute()

// Filter values
const searchText = ref(route.query.q || ''),
  department = ref(''),
  region = ref('')
// Header search (?q=) fills this page's search box.
watch(
  () => route.query.q,
  (q) => (searchText.value = q || '')
)

// Matches name, city or department; region 'PK' = Pakistan, anything else = international
const filteredDoctors = computed(() =>
  state.doctors.filter(
    (d) =>
      (!department.value || d.department === department.value) &&
      (!region.value || (region.value === 'PK' ? d.cc === 'PK' : d.cc !== 'PK')) &&
      (!searchText.value ||
        (d.name + d.city + d.department).toLowerCase().includes(searchText.value.toLowerCase()))
  )
)
</script>


<template>
  <div>
    <div class="page-head" style="margin-top: 0">
      <div>
        <h1>Doctors</h1>
        <p>{{ state.doctors.length }} specialists across {{ DEPARTMENTS.length }} departments.</p>
      </div>
    </div>
    <div class="toolbar">
      <div class="filters" style="grid-template-columns: 2fr 1fr 1fr auto">
        <div class="search">
          <span>🔍</span>
          <input
            class="input"
            v-model="searchText"
            type="search"
            placeholder="Search doctor, city or department"
            aria-label="Search doctors"
          />
        </div>
        <select class="input" v-model="department" aria-label="Department">
          <option value="">All departments</option>
          <option v-for="d in DEPARTMENTS" :key="d">{{ d }}</option>
        </select>
        <select class="input" v-model="region" aria-label="Region">
          <option value="">All regions</option>
          <option value="PK">Pakistan</option>
          <option value="INT">International</option>
        </select>
        <button class="btn ghost" @click="searchText = department = region = ''">Reset</button>
      </div>
    </div>
    <div v-if="!filteredDoctors.length" class="empty">
      <div class="ico">🔎</div>
      <h2>No doctors match</h2>
      <p>Clear the filters to see everyone.</p>
    </div>
    <transition-group v-else name="list" tag="div" class="grid">
      <article v-for="d in filteredDoctors" :key="d.id" class="card pcard">
        <Avatar :src="d.photo" :name="d.name" :size="84" />
        <h3>{{ d.name }}</h3>
        <div class="meta">{{ d.department }}</div>
        <div class="tags">
          <span>
            <Flag :code="d.cc" />
            {{ d.city }}
          </span>
          <span>{{ d.experience }} yrs</span>
          <span>⭐ {{ d.rating }}</span>
          <span>${{ d.fee }}</span>
        </div>
        <div class="meta">
          <span class="dot" :class="{ off: !d.available }"></span>
          {{ d.available ? 'Available' : 'Unavailable' }}
        </div>
        <button
          class="btn sm"
          :disabled="!d.available"
          @click="router.push({ path: '/appointments', query: { new: d.id } })"
        >
          Book appointment
        </button>
      </article>
    </transition-group>
  </div>
</template>
