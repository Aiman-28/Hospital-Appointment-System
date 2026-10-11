<script setup>
// Five stat cards computed from live data; numbers count up smoothly whenever they change.
import { ref, computed, watch } from 'vue'
import { iso } from '../store'

const props = defineProps({ appointments: Array })

const COUNT_UP_MS = 800

// label, icon, status filter (null = all), accent colour
const CARD_DEFS = [
  ['Total', '📋', null, 'var(--ink)'],
  ['Confirmed', '✅', 'Confirmed', 'var(--green)'],
  ['Scheduled', '⏳', 'Scheduled', 'var(--blue)'],
  ['Completed', '🏁', 'Completed', 'var(--grey)'],
  ['Cancelled', '✖️', 'Cancelled', 'var(--coral)'],
]

const cards = computed(() => {
  const today = iso()
  const withStatus = (status) =>
    props.appointments.filter((appt) => !status || appt.status === status)

  return CARD_DEFS.map(([label, icon, status, color]) => {
    const matching = withStatus(status)
    return {
      label,
      icon,
      color,
      total: matching.length,
      today: matching.filter((appt) => appt.date === today).length,
    }
  })
})

// Number currently displayed per card (animated towards `total`).
const displayed = ref({})

function countUp(card) {
  const from = displayed.value[card.label] ?? 0
  const startTime = performance.now()
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

  const step = (now) => {
    const progress = Math.min(1, (now - startTime) / COUNT_UP_MS)
    displayed.value[card.label] = Math.round(from + (card.total - from) * easeOutCubic(progress))
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

watch(cards, (list) => list.forEach(countUp), { immediate: true })
</script>


<template>
  <div class="stats">
    <div
      v-for="card in cards"
      :key="card.label"
      class="stat"
      :style="{ '--c': card.color }"
      :title="card.label === 'Scheduled' ? 'Scheduled = pending confirmation' : card.label"
    >
      <div class="si">{{ card.icon }}</div>
      <small>{{ card.label }}</small>
      <b>{{ displayed[card.label] ?? 0 }}</b>
      <small class="t">▲ {{ card.today }} today</small>
    </div>
  </div>
</template>
