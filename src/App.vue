<script setup>
import ToastHost from './components/ToastHost.vue'
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <!-- keyed by top-level record so child pages swap inside the layout without remounting it -->
    <transition name="page" mode="out-in">
      <div :key="route.matched[0]?.path ?? route.path"><component :is="Component" /></div>
    </transition>
  </router-view>
  <ToastHost />
</template>
