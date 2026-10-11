<script setup>
// Authenticated shell: sidebar + top header + animated page outlet.
import { useRouter } from 'vue-router'
import Header from '../components/Header.vue'
import Avatar from '../components/Avatar.vue'
import { state, logout, toast } from '../store'
const router = useRouter()
const nav = [
  ['/dashboard', 'Dashboard', '▦'],
  ['/appointments', 'Appointments', '📅'],
  ['/patients', 'Patients', '🧑'],
  ['/doctors', 'Doctors', '🩺'],
]
function out() {
  logout()
  toast('You have been logged out.')
  router.push('/login')
}
</script>


<template>
  <div class="shell">
    <aside class="sidebar">
      <router-link to="/" class="brand">
        <i>+</i>
        Holistic Care
      </router-link>
      <nav>
        <router-link v-for="n in nav" :key="n[0]" :to="n[0]">
          <span>{{ n[2] }}</span>
          {{ n[1] }}
        </router-link>
      </nav>
      <div class="usercard">
        <div class="u">
          <Avatar :name="state.currentUser?.name" :size="38" />
          <div style="min-width: 0">
            <strong>{{ state.currentUser?.name }}</strong>
            <small>{{ state.currentUser?.email }}</small>
          </div>
        </div>
        <button class="btn out" @click="out">⎋ Sign Out</button>
      </div>
    </aside>
    <div class="content">
      <Header @logout="out" />
      <router-view v-slot="{ Component, route }">
        <transition name="page" mode="out-in">
          <div :key="route.path"><component :is="Component" /></div>
        </transition>
      </router-view>
    </div>
  </div>
</template>
