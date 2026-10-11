<script setup>
import { state } from '../store'
</script>


<template>
  <transition-group name="toast" tag="div" class="toasts" aria-live="polite">
    <div v-for="t in state.toasts" :key="t.id" class="toast" :class="t.type">{{ t.message }}</div>
  </transition-group>
</template>
