<script setup>
// Top bar: global search (jumps to Appointments), notification bell, user chip.
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Avatar from './Avatar.vue'
import { state, getAlerts } from '../store'
const emit = defineEmits(['logout'])
const router = useRouter(),
  route = useRoute(),
  searchText = ref(route.query.q || ''),
  dropdownOpen = ref(false)
const alerts = computed(() => getAlerts())
const pending = computed(() => state.appointments.filter((a) => a.status === 'Scheduled').length)
// Pages that have their own list to search; on any other page the search jumps to Appointments.
const SEARCHABLE = ['/appointments', '/patients', '/doctors']
const goToAppointments = () => {
  const q = searchText.value.trim()
  const path = SEARCHABLE.includes(route.path) ? route.path : '/appointments'
  router.push({ path, query: q ? { q } : {} })
}
// Keep the search box in sync with the URL (e.g. when switching pages from the sidebar).
watch(
  () => route.fullPath,
  () => (searchText.value = route.query.q || '')
)
</script>


<template>
  <header class="topbar">
    <div class="search">
      <span>🔍</span>
      <input
        class="input"
        v-model="searchText"
        type="search"
        placeholder="Search patients, doctors or reasons…"
        aria-label="Global search"
        @keyup.enter="goToAppointments"
      />
    </div>
    <button
      class="bell"
      data-tip="Notifications"
      aria-label="Notifications"
      @click="dropdownOpen = !dropdownOpen"
    >
      🔔
      <b v-if="pending">{{ pending }}</b>
    </button>
    <Avatar :name="state.currentUser?.name" :size="38" />
    <transition name="fade">
      <div v-if="dropdownOpen" class="drop">
        <strong>Alerts &amp; notifications</strong>
        <div class="ai" style="margin-top: 8px" v-for="a in alerts" :key="a">{{ a }}</div>
      </div>
    </transition>
  </header>
</template>
