<script setup>
// Patients: search + region filter, register/edit in a modal, delete with confirmation.
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Avatar from '../components/Avatar.vue'
import Flag from '../components/Flag.vue'
import PatientForm from '../components/PatientForm.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import { state, addPatient, updatePatient, removePatient, toast } from '../store'
const router = useRouter(),
  route = useRoute()

// UI state
const searchText = ref(route.query.q || ''),
  region = ref(''),
  editing = ref(null),
  showForm = ref(false),
  patientToDelete = ref(null)

// Header search (?q=) fills this page's search box.
watch(
  () => route.query.q,
  (q) => (searchText.value = q || '')
)

// Region filter: 'PK' = Pakistan, anything else = international. Search matches name, email or city.
const filteredPatients = computed(() =>
  state.patients.filter(
    (p) =>
      (!region.value || (region.value === 'PK' ? p.cc === 'PK' : p.cc !== 'PK')) &&
      (!searchText.value ||
        (p.name + p.email + p.city).toLowerCase().includes(searchText.value.toLowerCase()))
  )
)

// How many appointments this patient has booked
const visitCount = (p) => state.appointments.filter((a) => a.patientEmail === p.email).length

// Called by PatientForm: update when editing, otherwise register a new patient
function save(d) {
  if (editing.value) {
    updatePatient(editing.value.id, d)
    toast('Patient updated.')
  } else {
    addPatient(d)
    toast('Patient registered.')
  }
  showForm.value = false
}
const openEditForm = (p) => {
  editing.value = p
  showForm.value = true
}

function confirmDelete() {
  removePatient(patientToDelete.value.id)
  patientToDelete.value = null
  toast('Patient deleted.')
}
</script>


<template>
  <div>
    <div class="page-head" style="margin-top: 0">
      <div>
        <h1>Patients</h1>
        <p>{{ state.patients.length }} registered patients, local and international.</p>
      </div>
      <button class="btn" @click="openEditForm(null)">＋ Register patient</button>
    </div>
    <div class="toolbar">
      <div style="display: grid; grid-template-columns: 1fr auto; gap: 10px">
        <div class="search">
          <span>🔍</span>
          <input
            class="input"
            v-model="searchText"
            type="search"
            placeholder="Search by name, email or city"
            aria-label="Search patients"
          />
        </div>
        <select class="input" v-model="region" aria-label="Region">
          <option value="">All regions</option>
          <option value="PK">Pakistan</option>
          <option value="INT">International</option>
        </select>
      </div>
    </div>
    <div v-if="!filteredPatients.length" class="empty">
      <div class="ico">🧑‍⚕️</div>
      <h2>No patients found</h2>
      <p>Try another search or register a new patient.</p>
      <button class="btn" @click="openEditForm(null)">Register patient</button>
    </div>
    <div v-else class="tablewrap fit">
      <table class="fit">
        <thead>
          <tr>
            <th>Patient</th>
            <th class="hide-sm">Contact</th>
            <th class="hide-md">Age / Gender</th>
            <th>Location</th>
            <th class="hide-md">Blood</th>
            <th class="hide-sm">Visits</th>
            <th>Actions</th>
          </tr>
        </thead>
        <transition-group name="list" tag="tbody">
          <tr v-for="p in filteredPatients" :key="p.id">
            <td>
              <div class="arow" style="padding: 0; border: 0">
                <Avatar :src="p.photo" :name="p.name" :size="40" />
                <strong>{{ p.name }}</strong>
              </div>
            </td>
            <td class="hide-sm">
              {{ p.email }}
              <div class="meta">{{ p.phone }}</div>
            </td>
            <td class="hide-md">{{ p.age }} · {{ p.gender }}</td>
            <td>
              <Flag :code="p.cc" />
              {{ p.city }}
            </td>
            <td class="hide-md">{{ p.blood }}</td>
            <td class="hide-sm">{{ visitCount(p) }}</td>
            <td>
              <div class="ia">
                <button
                  class="ib"
                  data-tip="View appointments"
                  aria-label="View appointments"
                  @click="router.push({ path: '/appointments', query: { q: p.name } })"
                >
                  📅
                </button>
                <button class="ib" data-tip="Edit" aria-label="Edit" @click="openEditForm(p)">
                  ✏️
                </button>
                <button
                  class="ib d"
                  data-tip="Delete"
                  aria-label="Delete"
                  @click="patientToDelete = p"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </transition-group>
      </table>
    </div>
    <transition name="fade">
      <PatientForm v-if="showForm" :item="editing" @save="save" @close="showForm = false" />
    </transition>
    <transition name="fade">
      <ConfirmModal
        v-if="patientToDelete"
        title="Delete this patient?"
        :message="`${patientToDelete.name} will be removed from the patient list. Their past appointments stay on record.`"
        @confirm="confirmDelete"
        @cancel="patientToDelete = null"
      />
    </transition>
  </div>
</template>
