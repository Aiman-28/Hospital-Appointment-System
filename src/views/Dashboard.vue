<script setup>
// Dashboard: stats, two charts, then one row with calendar · day's appointments · upcoming schedule,
// and finally alerts + busiest departments.
import { ref, computed } from 'vue'
import Avatar from '../components/Avatar.vue'
import DashboardStats from '../components/DashboardStats.vue'
import LineChart from '../components/LineChart.vue'
import BarChart from '../components/BarChart.vue'
import MiniCalendar from '../components/MiniCalendar.vue'
import ItemForm from '../components/ItemForm.vue'
import PatientForm from '../components/PatientForm.vue'

import {
  state,
  DEPARTMENTS,
  iso,
  fmtDate,
  fmtTime,
  photoOf,
  getAlerts,
  addAppointment,
  addPatient,
  updateAppointment,
  toast,
} from '../store'

// ---------------------------------------------------------------------------
// Constants & small helpers
// ---------------------------------------------------------------------------
const ACTIVE_STATUSES = ['Scheduled', 'Confirmed'] // appointments that have not happened yet
const COLORS = { primary: '#2a8a6e', light: '#8fd0b8', lighter: '#a9dcc9' }

const isActive = (appt) => ACTIVE_STATUSES.includes(appt.status)

/** ISO date string for "today + offsetDays" (negative = past). */
function dateFromToday(offsetDays) {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  return iso(date)
}

// ---------------------------------------------------------------------------
// UI state
// ---------------------------------------------------------------------------
const selectedDate = ref(iso()) // date picked on the calendar
const trendRange = ref('week') // 'week' | 'month'
const showAppointmentForm = ref(false)
const showPatientForm = ref(false)

const appointments = computed(() => state.appointments)

// ---------------------------------------------------------------------------
// Calendar + selected day
// ---------------------------------------------------------------------------
/** { '2026-10-08': 3, ... } -> number of appointments per day, used for the calendar dots. */
const appointmentsPerDay = computed(() =>
  appointments.value.reduce((counts, appt) => {
    counts[appt.date] = (counts[appt.date] || 0) + 1
    return counts
  }, {})
)

const selectedDayAppointments = computed(() =>
  appointments.value
    .filter((appt) => appt.date === selectedDate.value)
    .sort((a, b) => a.time.localeCompare(b.time))
)

// ---------------------------------------------------------------------------
// Upcoming schedule (next 5 active appointments from today)
// ---------------------------------------------------------------------------
const upcoming = computed(() =>
  appointments.value
    .filter((appt) => appt.date >= iso() && isActive(appt))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 5)
)

function setStatus(appt, status) {
  updateAppointment(appt.id, { status })
  toast(`Appointment ${status.toLowerCase()}.`)
}

// ---------------------------------------------------------------------------
// Charts
// ---------------------------------------------------------------------------
/** Time buckets for the trend chart: 7 single days (week) or 4 weekly ranges (month). */
function trendBuckets(range) {
  if (range === 'week') {
    return Array.from({ length: 7 }, (_, i) => {
      const date = dateFromToday(i - 6)
      const label = new Date(date + 'T00:00').toLocaleDateString(undefined, { weekday: 'short' })
      return { label, from: date, to: date }
    })
  }
  return Array.from({ length: 4 }, (_, i) => ({
    label: `Wk ${i + 1}`,
    from: dateFromToday(-(27 - 7 * i)),
    to: dateFromToday(-(21 - 7 * i)),
  }))
}

const trend = computed(() => {
  const buckets = trendBuckets(trendRange.value)
  const inBucket = (appt, { from, to }) => appt.date >= from && appt.date <= to
  const countIn = (bucket, extraFilter = () => true) =>
    appointments.value.filter((appt) => inBucket(appt, bucket) && extraFilter(appt)).length

  return {
    labels: buckets.map((bucket) => bucket.label),
    series: [
      { name: 'Booked', color: COLORS.primary, data: buckets.map((b) => countIn(b)) },
      {
        name: 'Completed',
        color: COLORS.light,
        data: buckets.map((b) => countIn(b, (appt) => appt.status === 'Completed')),
      },
    ],
  }
})

const countActiveIn = (department) =>
  appointments.value.filter((appt) => appt.department === department && isActive(appt)).length

const byDepartment = computed(() => ({
  labels: DEPARTMENTS.map((name) => name.slice(0, 5)),
  series: [
    { name: 'Active', color: COLORS.primary, data: DEPARTMENTS.map(countActiveIn) },
    {
      name: 'Completed',
      color: COLORS.lighter,
      data: DEPARTMENTS.map(
        (name) =>
          appointments.value.filter(
            (appt) => appt.department === name && appt.status === 'Completed'
          ).length
      ),
    },
  ],
}))

// ---------------------------------------------------------------------------
// Modal forms
// ---------------------------------------------------------------------------
function saveAppointment(data) {
  addAppointment(data)
  showAppointmentForm.value = false
  toast('Appointment added.')
}

function savePatient(data) {
  addPatient(data)
  showPatientForm.value = false
  toast('Patient registered.')
}

// ---------------------------------------------------------------------------
// Alerts card
// ---------------------------------------------------------------------------
const busiestDepartments = computed(() =>
  DEPARTMENTS.map((name) => ({ name, count: countActiveIn(name) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
)
const maxDepartmentCount = computed(() =>
  Math.max(1, ...busiestDepartments.value.map((d) => d.count))
)
const availableDoctors = computed(() => state.doctors.filter((doc) => doc.available).length)
</script>

<template>
  <div>
    <div class="page-head page-head--flush">
      <div>
        <h1>Dashboard</h1>
        <p>
          Welcome back, {{ state.currentUser?.name?.split(' ')[0] }}! Here’s what’s happening today.
        </p>
      </div>
      <div class="head-actions">
        <button class="btn ghost" @click="showAppointmentForm = true">📅 New Appointment</button>
        <button class="btn" @click="showPatientForm = true">＋ Register Patient</button>
      </div>
    </div>
    <div class="dash-l">
      <DashboardStats :appointments="appointments" />
      <div class="two">
        <div class="pc">
          <div class="hd">
            <h3>Appointments trend</h3>
            <div class="tg">
              <button :class="{ on: trendRange === 'week' }" @click="trendRange = 'week'">
                Week
              </button>
              <button :class="{ on: trendRange === 'month' }" @click="trendRange = 'month'">
                Month
              </button>
            </div>
          </div>
          <div class="lg">
            <span v-for="s in trend.series" :key="s.name">
              <i :style="{ background: s.color }"></i>
              {{ s.name }}
            </span>
          </div>
          <LineChart :labels="trend.labels" :series="trend.series" />
        </div>
        <div class="pc">
          <div class="hd"><h3>Department overview</h3></div>
          <div class="lg">
            <span v-for="s in byDepartment.series" :key="s.name">
              <i :style="{ background: s.color }"></i>
              {{ s.name }}
            </span>
          </div>
          <BarChart :labels="byDepartment.labels" :series="byDepartment.series" />
        </div>
      </div>

      <!-- Calendar · selected day's appointments · upcoming schedule, all on one row -->
      <div class="trio">
        <MiniCalendar v-model="selectedDate" :marks="appointmentsPerDay" />

        <div class="pc col">
          <div class="hd">
            <div>
              <h3>{{ selectedDate === iso() ? 'Today’s Appointments' : fmtDate(selectedDate) }}</h3>
              <small class="meta">{{ selectedDayAppointments.length }} on this day</small>
            </div>
            <router-link to="/appointments" class="btn ghost sm">View all</router-link>
          </div>
          <div class="scroll">
            <transition name="fade-s">
              <div v-if="!selectedDayAppointments.length" class="nodata">
                <span>🗓️</span>
                No appointments on this day.
                <small>Pick another date on the calendar.</small>
              </div>
            </transition>
            <transition-group name="list" tag="div">
              <router-link
                v-for="a in selectedDayAppointments"
                :key="a.id"
                :to="'/details/' + a.id"
                class="arow arow--link"
              >
                <Avatar :src="photoOf(a.patientName)" :name="a.patientName" :size="40" />
                <div class="g">
                  <strong>{{ a.patientName }}</strong>
                  <small>{{ a.doctor }} · {{ a.department }}</small>
                </div>
                <div class="r2">
                  <small>{{ fmtTime(a.time) }}</small>
                  <span class="badge" :class="a.status">{{ a.status }}</span>
                </div>
              </router-link>
            </transition-group>
          </div>
        </div>

        <div class="pc col">
          <div class="hd">
            <div>
              <h3>Upcoming schedule</h3>
              <small class="meta">Next {{ upcoming.length }} to confirm or cancel</small>
            </div>
          </div>
          <div class="scroll">
            <transition name="fade-s">
              <div v-if="!upcoming.length" class="nodata">
                <span>✨</span>
                Nothing upcoming.
              </div>
            </transition>
            <transition-group name="list" tag="div">
              <div v-for="a in upcoming" :key="a.id" class="sched">
                <div class="r">
                  <div>
                    <strong>{{ a.patientName }}</strong>
                    <br />
                    <small>{{ a.reason }}</small>
                  </div>
                  <small class="sched-when">
                    {{ fmtTime(a.time) }}
                    <br />
                    {{ fmtDate(a.date).split(',')[1] }}
                  </small>
                </div>
                <div class="r">
                  <div style="display: flex">
                    <Avatar :src="photoOf(a.patientName)" :name="a.patientName" :size="30" />
                    <Avatar :src="photoOf(a.doctor)" :name="a.doctor" :size="30" />
                  </div>
                  <div class="b">
                    <button
                      data-tip="Cancel"
                      aria-label="Cancel"
                      @click="setStatus(a, 'Cancelled')"
                    >
                      ✕
                    </button>
                    <button
                      data-tip="Confirm"
                      aria-label="Confirm"
                      @click="setStatus(a, 'Confirmed')"
                    >
                      ✓
                    </button>
                  </div>
                </div>
              </div>
            </transition-group>
          </div>
        </div>
      </div>

      <div class="pc alerts">
        <div>
          <div class="hd"><h3>Alerts &amp; Notifications</h3></div>
          <div class="ai-grid">
            <div class="ai" v-for="a in getAlerts()" :key="a">ⓘ {{ a }}</div>
          </div>
          <div class="kpis">
            <div>
              <small>Doctors available</small>
              <strong>{{ availableDoctors }}/{{ state.doctors.length }}</strong>
            </div>
            <div>
              <small>Registered patients</small>
              <strong>{{ state.patients.length }}</strong>
            </div>
          </div>
        </div>
        <div>
          <div class="hd"><h3>Busiest departments</h3></div>
          <div v-for="dept in busiestDepartments" :key="dept.name" class="prog">
            <span>{{ dept.name }}</span>
            <div class="pb">
              <i :style="{ width: (dept.count / maxDepartmentCount) * 100 + '%' }"></i>
            </div>
            <b>{{ dept.count }}</b>
          </div>
        </div>
      </div>
    </div>
    <transition name="fade">
      <ItemForm
        v-if="showAppointmentForm"
        @save="saveAppointment"
        @close="showAppointmentForm = false"
      />
    </transition>
    <transition name="fade">
      <PatientForm v-if="showPatientForm" @save="savePatient" @close="showPatientForm = false" />
    </transition>
  </div>
</template>
