<script setup>
// Public landing page: hero collage, featured available doctors, departments.
import { ref, computed } from 'vue'
import Avatar from '../components/Avatar.vue'
import Flag from '../components/Flag.vue'
import { state, COUNTRIES, DEPARTMENTS } from '../store'
const region = ref('')

// First 8 available doctors, optionally filtered by region ('PK' or international)
const featured = computed(() =>
  state.doctors
    .filter(
      (d) =>
        d.available && (!region.value || (region.value === 'PK' ? d.cc === 'PK' : d.cc !== 'PK'))
    )
    .slice(0, 8)
)

// Doctors shown in the hero photo collage
const hero = computed(() => [
  state.doctors[0],
  state.doctors[4],
  state.doctors[3],
  state.doctors[7],
])

// Emoji shown for each department
const icons = {
  Cardiology: '🫀',
  Neurology: '🧠',
  Pediatrics: '🧸',
  Orthopedics: '🦴',
  'General Practice': '🩺',
  Dermatology: '🧴',
  Oncology: '🎗️',
}
</script>


<template>
  <div class="container">
    <header class="lnav">
      <router-link to="/" class="brand">
        <i>+</i>
        Holistic Care
      </router-link>
      <nav class="nav">
        <a href="#depts">Departments</a>
        <a href="#docs">Doctors</a>
        <router-link v-if="state.isLoggedIn" to="/dashboard" class="btn sm">
          Go to dashboard
        </router-link>
        <template v-else>
          <router-link to="/login">Log in</router-link>
          <router-link to="/signup" class="btn sm" style="color: #fff">Sign up</router-link>
        </template>
      </nav>
    </header>
    <section class="lhero">
      <div>
        <h1>
          Care that fits
          <em>your schedule</em>
        </h1>
        <p class="meta" style="font-size: 1.1rem; max-width: 44ch; margin: 14px 0 22px">
          Book appointments with trusted specialists from Pakistan and around the world. Confirm,
          reschedule and track every visit in one place.
        </p>
        <div style="display: flex; gap: 10px; flex-wrap: wrap">
          <router-link :to="state.isLoggedIn ? '/appointments' : '/signup'" class="btn">
            Book an appointment
          </router-link>
          <a href="#docs" class="btn ghost">Meet our doctors</a>
        </div>
        <div class="tags" style="justify-content: flex-start; margin-top: 22px">
          <span>{{ state.doctors.length }} doctors</span>
          <span>{{ DEPARTMENTS.length }} departments</span>
          <span>{{ state.patients.length }}+ patients</span>
        </div>
      </div>
      <div class="collage">
        <Avatar :src="hero[0].photo" :name="hero[0].name" :size="190" style="top: 0; left: 6%" />
        <Avatar
          :src="hero[1].photo"
          :name="hero[1].name"
          :size="150"
          style="top: 40px; right: 4%; animation-delay: -2s"
        />
        <Avatar
          :src="hero[2].photo"
          :name="hero[2].name"
          :size="140"
          style="bottom: 0; left: 24%; animation-delay: -4s"
        />
        <Avatar
          :src="hero[3].photo"
          :name="hero[3].name"
          :size="110"
          style="bottom: 30px; right: 14%; animation-delay: -1s"
        />
      </div>
    </section>
    <section id="depts" class="sec">
      <h2 style="margin-bottom: 14px">Our departments</h2>
      <div class="dept">
        <div v-for="d in DEPARTMENTS" :key="d">
          <span>{{ icons[d] }}</span>
          {{ d }}
        </div>
      </div>
    </section>
    <section id="docs" class="sec">
      <div class="page-head" style="margin: 0 0 16px">
        <h2>Featured doctors</h2>
        <div class="seg">
          <button :class="{ on: !region }" @click="region = ''">All</button>
          <button :class="{ on: region === 'PK' }" @click="region = 'PK'">Pakistan</button>
          <button :class="{ on: region === 'INT' }" @click="region = 'INT'">International</button>
        </div>
      </div>
      <transition-group name="list" tag="div" class="grid">
        <article v-for="d in featured" :key="d.id" class="card pcard">
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
          </div>
        </article>
      </transition-group>
    </section>
    <section class="sec">
      <h2 style="margin-bottom: 14px">How it works</h2>
      <div class="steps">
        <div class="card">
          <h3>1 · Create an account</h3>
          <p class="meta">Sign up in under a minute.</p>
        </div>
        <div class="card">
          <h3>2 · Choose a doctor</h3>
          <p class="meta">Filter by department, city or country.</p>
        </div>
        <div class="card">
          <h3>3 · Book and track</h3>
          <p class="meta">Confirm, update or cancel anytime.</p>
        </div>
      </div>
    </section>
    <section class="sec">
      <div class="band">
        <h2>Ready to get started?</h2>
        <p style="opacity: 0.9">Join and manage your appointments today.</p>
        <router-link :to="state.isLoggedIn ? '/dashboard' : '/signup'" class="btn">
          {{ state.isLoggedIn ? 'Open dashboard' : 'Create free account' }}
        </router-link>
      </div>
    </section>
    <footer class="meta" style="padding: 24px 0; text-align: center">
      © Holistic Care Hospital 
    </footer>
  </div>
</template>
