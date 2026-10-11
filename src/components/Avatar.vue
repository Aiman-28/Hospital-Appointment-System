<script setup>
// Photo avatar with automatic initials fallback if the image is missing or offline.
import { ref, computed } from 'vue'
const props = defineProps({ src: String, name: String, size: { type: Number, default: 40 } })
const imageFailed = ref(false)
const initials = computed(() =>
  (props.name || '?')
    .replace('Dr. ', '')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
)
const hue = computed(() => [...(props.name || '')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360)
</script>

<template>
  <img
    v-if="src && !imageFailed"
    class="av"
    :src="src"
    :alt="name"
    loading="lazy"
    :style="{ width: size + 'px', height: size + 'px' }"
    @error="imageFailed = true"
  />
  <span
    v-else
    class="av"
    :style="{
      width: size + 'px',
      height: size + 'px',
      background: `hsl(${hue} 45% 42%)`,
      fontSize: size / 2.6 + 'px',
    }"
  >
    {{ initials }}
  </span>
</template>
