<script setup>
// Animated month calendar. Days with appointments show up to 3 dots. v-model = selected ISO date.
// Month changes slide in the direction you navigate; the title rolls vertically; days fade in with a stagger.
import { ref, computed, nextTick } from 'vue'
import { iso } from '../store'
const props = defineProps({ modelValue: String, marks: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:modelValue'])
const today = iso()
const view = ref(new Date(props.modelValue + 'T00:00'))
const dir = ref('next')
const idx = (d) => d.getFullYear() * 12 + d.getMonth()
const key = computed(() => idx(view.value))
const title = computed(() =>
  view.value.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
)
const isCurrentMonth = computed(() => key.value === idx(new Date(today + 'T00:00')))

// direction is set first and the month changes on the next tick, so the leaving month uses the right animation
async function goTo(target) {
  const n = idx(target) - key.value
  if (!n) return
  dir.value = n > 0 ? 'next' : 'prev'
  await nextTick()
  view.value = new Date(target.getFullYear(), target.getMonth(), 1)
}
const move = (n) => goTo(new Date(view.value.getFullYear(), view.value.getMonth() + n, 1))
const goToday = () => {
  goTo(new Date(today + 'T00:00'))
  emit('update:modelValue', today)
}

const cells = computed(() => {
  const y = view.value.getFullYear(),
    m = view.value.getMonth()
  return [
    ...Array(new Date(y, m, 1).getDay()).fill(null),
    ...Array.from({ length: new Date(y, m + 1, 0).getDate() }, (_, i) =>
      iso(new Date(y, m, i + 1))
    ),
  ]
})
const dots = (c) => Math.min(3, props.marks[c] || 0)
</script>


<template>
  <div class="pc mc">
    <div class="mc-head">
      <button class="mc-nav" aria-label="Previous month" @click="move(-1)">‹</button>
      <div class="mc-title" aria-live="polite">
        <transition :name="'tt-' + dir" mode="out-in">
          <span :key="key">{{ title }}</span>
        </transition>
      </div>
      <button class="mc-nav" aria-label="Next month" @click="move(1)">›</button>
    </div>
    <div class="mc-week">
      <span v-for="(d, k) in ['S', 'M', 'T', 'W', 'T', 'F', 'S']" :key="k">{{ d }}</span>
    </div>
    <div class="mc-body">
      <transition :name="'slide-' + dir" mode="out-in">
        <div :key="key" class="mc-grid">
          <template v-for="(c, i) in cells" :key="i">
            <span v-if="!c"></span>
            <button
              v-else
              :style="{ '--i': i }"
              :class="{ sel: c === modelValue, today: c === today, mk: marks[c] }"
              :data-tip="marks[c] ? marks[c] + ' appointment(s)' : null"
              :aria-pressed="c === modelValue"
              @click="emit('update:modelValue', c)"
            >
              <b>{{ +c.slice(8) }}</b>
              <span class="dots"><i v-for="n in dots(c)" :key="n"></i></span>
            </button>
          </template>
        </div>
      </transition>
    </div>
    <div class="mc-foot">
      <small class="meta">
        <i class="mc-key"></i>
        Has appointments
      </small>
      <transition name="fade-s">
        <button v-if="!isCurrentMonth || modelValue !== today" class="mc-today" @click="goToday">
          Today
        </button>
      </transition>
    </div>
  </div>
</template>
