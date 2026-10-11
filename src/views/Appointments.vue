<script setup>
// Full appointment management: search, filters, sorting, grid/table, CRUD, quick status.
import { reactive, ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SearchBar from '../components/SearchBar.vue'
import FilterBar from '../components/FilterBar.vue'
import ItemCard from '../components/ItemCard.vue'
import ItemForm from '../components/ItemForm.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import { state, addAppointment, updateAppointment, removeAppointment, toast } from '../store'


const route = useRoute(),
  router = useRouter()
const loading = ref(true),
  layout = ref('grid'),
  editing = ref(null),
  showForm = ref(false),
  toDelete = ref(null),
  prefill = ref(null)

// Filters (bound to SearchBar and FilterBar). `q` is the search text.
const emptyFilters = () => ({ q: '', dept: '', status: '', doctor: '', sort: 'newest' })
const filters = reactive({ ...emptyFilters(), q: route.query.q || '' })
// Header search while already on this page: update the search text when ?q= changes.
watch(
  () => route.query.q,
  (q) => (filters.q = q || '')
)
onMounted(() => {
  setTimeout(() => (loading.value = false), 500)
  const d = state.doctors.find((x) => x.id === route.query.new)
  if (d) {
    prefill.value = { doctor: d.name, department: d.department }
    showForm.value = true
    router.replace({ path: '/appointments' })
  }
})

// Unique doctor names for the doctor filter dropdown
const doctors = computed(() => [...new Set(state.appointments.map((a) => a.doctor))].sort())

// Sortable 'YYYY-MM-DDTHH:MM' string
const dateTimeKey = (a) => a.date + 'T' + a.time

// Search + filters, then sort (newest / oldest / A-Z / Z-A)
const visibleAppointments = computed(() => {
  const q = filters.q.trim().toLowerCase()
  const matches = state.appointments.filter(
    (a) =>
      (!q || [a.patientName, a.doctor, a.reason].some((s) => s.toLowerCase().includes(q))) &&
      (!filters.dept || a.department === filters.dept) &&
      (!filters.status || a.status === filters.status) &&
      (!filters.doctor || a.doctor === filters.doctor)
  )
  return matches.sort(
    {
      newest: (a, b) => dateTimeKey(b).localeCompare(dateTimeKey(a)),
      oldest: (a, b) => dateTimeKey(a).localeCompare(dateTimeKey(b)),
      az: (a, b) => a.patientName.localeCompare(b.patientName),
      za: (a, b) => b.patientName.localeCompare(a.patientName),
    }[filters.sort]
  )
})
const hasActiveFilters = computed(
  () => filters.q || filters.dept || filters.status || filters.doctor
)
const openNew = () => {
  editing.value = null
  prefill.value = null
  showForm.value = true
}
const openEdit = (a) => {
  editing.value = a
  prefill.value = null
  showForm.value = true
}
function save(d) {
  if (editing.value) {
    updateAppointment(editing.value.id, d)
    toast('Appointment updated.')
  } else {
    addAppointment(d)
    toast('Appointment added.')
  }
  showForm.value = false
}
const setStatus = (id, s) => {
  updateAppointment(id, { status: s })
  toast(`Status changed to ${s}.`)
}
const confirmDelete = () => {
  removeAppointment(toDelete.value.id)
  toDelete.value = null
  toast('Appointment deleted.')
}
const viewDetails = (a) => router.push('/details/' + a.id)
</script>

<template>
  <div>
    <div class="page-head" style="margin-top: 0">
      <div>
        <h1>Appointments</h1>
        <p>Create, update and track every visit.</p>
      </div>
      <button class="btn" @click="openNew">+ New appointment</button>
    </div>
    <div class="toolbar">
      <div style="display: flex; gap: 10px">
        <div style="flex: 1"><SearchBar v-model="filters.q" /></div>
        <div class="seg">
          <button :class="{ on: layout === 'grid' }" data-tip="Card view" @click="layout = 'grid'">
            ▦
          </button>
          <button
            :class="{ on: layout === 'table' }"
            data-tip="Table view"
            @click="layout = 'table'"
          >
            ☰
          </button>
        </div>
      </div>
      <FilterBar
        v-model="filters"
        :doctors="doctors"
        @reset="Object.assign(filters, emptyFilters())"
      />
    </div>
    <div v-if="loading" class="grid"><div v-for="n in 6" :key="n" class="sk"></div></div>
    <div v-else-if="!visibleAppointments.length" class="empty">
      <div class="ico">🩺</div>
      <h2>{{ hasActiveFilters ? 'No appointments match' : 'No appointments yet' }}</h2>
      <p>
        {{
          hasActiveFilters
            ? 'Try a different search or clear the filters.'
            : 'Add the first appointment to fill the schedule.'
        }}
      </p>
      <button
        class="btn"
        @click="hasActiveFilters ? Object.assign(filters, emptyFilters()) : openNew()"
      >
        {{ hasActiveFilters ? 'Clear filters' : 'Add appointment' }}
      </button>
    </div>
    <transition-group v-else-if="layout === 'grid'" name="list" tag="div" class="grid">
      <ItemCard
        v-for="a in visibleAppointments"
        :key="a.id"
        :item="a"
        @view="viewDetails"
        @edit="openEdit"
        @delete="toDelete = $event"
        @status="setStatus"
      />
    </transition-group>
    <div v-else class="tablewrap fit">
      <table class="fit">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Doctor</th>
            <th class="hide-md">Department</th>
            <th>When</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <transition-group name="list" tag="tbody">
          <ItemCard
            v-for="a in visibleAppointments"
            :key="a.id"
            layout="row"
            :item="a"
            @view="viewDetails"
            @edit="openEdit"
            @delete="toDelete = $event"
            @status="setStatus"
          />
        </transition-group>
      </table>
    </div>
    <p class="meta" style="margin: 16px 0">
      Showing {{ visibleAppointments.length }} of {{ state.appointments.length }} appointments
    </p>
    <transition name="fade">
      <ItemForm
        v-if="showForm"
        :item="editing"
        :prefill="prefill"
        @save="save"
        @close="showForm = false"
      />
    </transition>
    <transition name="fade">
      <ConfirmModal
        v-if="toDelete"
        title="Delete this appointment?"
        :message="`${toDelete.patientName}’s appointment will be permanently removed. This can’t be undone.`"
        @confirm="confirmDelete"
        @cancel="toDelete = null"
      />
    </transition>
  </div>
</template>
