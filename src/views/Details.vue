<script setup>
// Single appointment page: details, doctor + patient info, quick status change, edit and delete.
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Avatar from '../components/Avatar.vue'
import Flag from '../components/Flag.vue'
import BackButton from '../components/BackButton.vue'
import ItemForm from '../components/ItemForm.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import {
  STATUSES,
  COUNTRIES,
  getAppointment,
  updateAppointment,
  removeAppointment,
  doctorByName,
  patientByName,
  photoOf,
  toast,
  fmtDate,
  fmtTime,
} from '../store'

// The appointment id comes from the route (/details/:id)
const props = defineProps({ id: String })
const router = useRouter()
const appointment = computed(() => getAppointment(props.id)),
  doctor = computed(() => appointment.value && doctorByName(appointment.value.doctor)),
  patient = computed(() => appointment.value && patientByName(appointment.value.patientName))

// Modal visibility
const showEditForm = ref(false),
  showDeleteConfirm = ref(false)
function save(d) {
  updateAppointment(props.id, d)
  showEditForm.value = false
  toast('Appointment updated.')
}
function remove() {
  removeAppointment(props.id)
  toast('Appointment deleted.')
  router.push('/appointments')
}
const setStatus = (s) => {
  updateAppointment(props.id, { status: s })
  toast(`Status changed to ${s}.`)
}
</script>


<template>
  <div>
    <div class="page-head" style="margin-top: 0">
      <div>
        <BackButton />
        <h1 style="margin-top: 14px">Appointment details</h1>
      </div>
    </div>
    <div v-if="!appointment" class="empty">
      <div class="ico">🔎</div>
      <h2>Appointment not found</h2>
      <p>It may have been deleted.</p>
      <router-link to="/appointments" class="btn">Back to appointments</router-link>
    </div>
    <div v-else class="detail">
      <section class="card">
        <div class="top">
          <div class="arow" style="padding: 0; border: 0">
            <Avatar
              :src="photoOf(appointment.patientName)"
              :name="appointment.patientName"
              :size="64"
            />
            <div>
              <h2>{{ appointment.patientName }}</h2>
              <div class="meta">{{ appointment.patientEmail }}</div>
            </div>
          </div>
          <span class="badge" :class="appointment.status">{{ appointment.status }}</span>
        </div>
        <dl class="dl">
          <dt>Doctor</dt>
          <dd>{{ appointment.doctor }}</dd>
          <dt>Department</dt>
          <dd>{{ appointment.department }}</dd>
          <dt>Date</dt>
          <dd>{{ fmtDate(appointment.date) }}</dd>
          <dt>Time</dt>
          <dd>{{ fmtTime(appointment.time) }}</dd>
          <dt>Reason</dt>
          <dd>{{ appointment.reason }}</dd>
          <template v-if="patient">
            <dt>Patient</dt>
            <dd>
              {{ patient.age }} yrs · {{ patient.gender }} · {{ patient.blood }} ·
              {{ patient.phone }}
            </dd>
          </template>
        </dl>
        <div class="actions">
          <button class="btn" @click="showEditForm = true">Edit</button>
          <button class="btn danger" @click="showDeleteConfirm = true">Delete</button>
        </div>
      </section>
      <div style="display: flex; flex-direction: column; gap: 18px">
        <section v-if="doctor" class="card pcard">
          <Avatar :src="doctor.photo" :name="doctor.name" :size="84" />
          <h3>{{ doctor.name }}</h3>
          <div class="meta">{{ doctor.department }}</div>
          <div class="tags">
            <span>
              <Flag :code="doctor.cc" />
              {{ doctor.city }}
            </span>
            <span>{{ doctor.experience }} yrs</span>
            <span>⭐ {{ doctor.rating }}</span>
          </div>
        </section>
        <section class="card">
          <h3>Update status</h3>
          <p class="meta">Changes save instantly.</p>
          <div class="status-btns">
            <button
              v-for="s in STATUSES"
              :key="s"
              class="btn ghost"
              :class="{ on: appointment.status === s }"
              @click="setStatus(s)"
            >
              <span class="badge" :class="s">{{ s }}</span>
            </button>
          </div>
        </section>
      </div>
    </div>
    <transition name="fade">
      <ItemForm
        v-if="showEditForm"
        :item="appointment"
        @save="save"
        @close="showEditForm = false"
      />
    </transition>
    <transition name="fade">
      <ConfirmModal
        v-if="showDeleteConfirm"
        title="Delete this appointment?"
        message="This permanently removes the appointment and can’t be undone."
        @confirm="remove"
        @cancel="showDeleteConfirm = false"
      />
    </transition>
  </div>
</template>
