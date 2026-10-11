<script setup>
import { computed } from 'vue'
const props = defineProps({ labels: Array, series: Array })
const WIDTH = 520,
  HEIGHT = 190,
  PAD = { l: 30, r: 10, t: 10, b: 24 }
const axisMax = computed(() => Math.max(4, ...props.series.flatMap((s) => s.data)))
const groupWidth = computed(() => (WIDTH - PAD.l - PAD.r) / props.labels.length)
const barWidth = computed(() => Math.min(16, (groupWidth.value - 10) / props.series.length))
const barX = (i, k) =>
  PAD.l +
  i * groupWidth.value +
  (groupWidth.value - barWidth.value * props.series.length) / 2 +
  k * barWidth.value
const barHeight = (v) => (v / axisMax.value) * (HEIGHT - PAD.t - PAD.b)
const ticks = computed(() => [0, 0.5, 1].map((t) => Math.round(axisMax.value * t)))
</script>


<template>
  <svg :viewBox="`0 0 ${WIDTH} ${HEIGHT}`" class="chart" role="img" aria-label="Bar chart">
    <g v-for="t in ticks" :key="t">
      <line
        :x1="PAD.l"
        :x2="WIDTH - PAD.r"
        :y1="HEIGHT - PAD.b - barHeight(t)"
        :y2="HEIGHT - PAD.b - barHeight(t)"
        stroke="#e5eeeb"
      />
      <text
        :x="PAD.l - 6"
        :y="HEIGHT - PAD.b - barHeight(t) + 4"
        text-anchor="end"
        font-size="10"
        fill="#7b9190"
      >
        {{ t }}
      </text>
    </g>
    <text
      v-for="(l, i) in labels"
      :key="l"
      :x="PAD.l + i * groupWidth + groupWidth / 2"
      :y="HEIGHT - 6"
      text-anchor="middle"
      font-size="10"
      fill="#7b9190"
    >
      {{ l }}
    </text>
    <template v-for="(s, k) in series" :key="s.name">
      <rect
        v-for="(v, i) in s.data"
        :key="i"
        class="bar-rect"
        :style="{ animationDelay: i * 70 + k * 40 + 'ms' }"
        :x="barX(i, k)"
        :y="HEIGHT - PAD.b - barHeight(v)"
        :width="barWidth"
        :height="barHeight(v)"
        rx="3"
        :fill="s.color"
      >
        <title>{{ s.name }}: {{ v }}</title>
      </rect>
    </template>
  </svg>
</template>
