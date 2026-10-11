<script setup>
// Smooth line chart with gradient area fill, clean integer axis and a hover tooltip.
import { computed, ref } from 'vue'
const props = defineProps({ labels: Array, series: Array })
const WIDTH = 520,
  HEIGHT = 220,
  PAD = { l: 30, r: 16, t: 14, b: 28 }
const axisMax = computed(() => {
  const m = Math.max(1, ...props.series.flatMap((s) => s.data))
  return m <= 4 ? 4 : Math.ceil(m / 4) * 4
})
const ticks = computed(() => [0, 1, 2, 3, 4].map((i) => (axisMax.value / 4) * i))
const pointCount = computed(() => props.labels.length)
const xAt = (i) => PAD.l + (i * (WIDTH - PAD.l - PAD.r)) / Math.max(1, pointCount.value - 1)
const yAt = (v) => HEIGHT - PAD.b - (v / axisMax.value) * (HEIGHT - PAD.t - PAD.b)
const linePath = (d) =>
  d
    .map((v, i) => {
      if (!i) return `M${xAt(0)},${yAt(v)}`
      const c = (xAt(i - 1) + xAt(i)) / 2
      return `C${c},${yAt(d[i - 1])} ${c},${yAt(v)} ${xAt(i)},${yAt(v)}`
    })
    .join(' ')
const areaPath = (d) => `${linePath(d)} L${xAt(d.length - 1)},${yAt(0)} L${xAt(0)},${yAt(0)} Z`
const columnWidth = computed(() => (WIDTH - PAD.l - PAD.r) / Math.max(1, pointCount.value - 1))
const hoveredIndex = ref(-1)
const tooltipX = computed(() =>
  Math.min(Math.max(xAt(hoveredIndex.value) - 55, PAD.l), WIDTH - PAD.r - 110)
)
</script>


<template>
  <svg
    :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
    class="chart"
    role="img"
    aria-label="Line chart"
    @mouseleave="hoveredIndex = -1"
  >
    <defs>
      <linearGradient v-for="(s, k) in series" :id="'lg' + k" :key="k" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="s.color" stop-opacity=".28" />
        <stop offset="1" :stop-color="s.color" stop-opacity="0" />
      </linearGradient>
    </defs>
    <g v-for="t in ticks" :key="t">
      <line
        :x1="PAD.l"
        :x2="WIDTH - PAD.r"
        :y1="yAt(t)"
        :y2="yAt(t)"
        stroke="#e5eeeb"
        stroke-dasharray="3 4"
      />
      <text :x="PAD.l - 8" :y="yAt(t) + 4" text-anchor="end" font-size="11" fill="#7b9190">
        {{ t }}
      </text>
    </g>
    <text
      v-for="(l, i) in labels"
      :key="l + i"
      :x="xAt(i)"
      :y="HEIGHT - 8"
      text-anchor="middle"
      font-size="11"
      :fill="hoveredIndex === i ? '#10303a' : '#7b9190'"
      :font-weight="hoveredIndex === i ? 700 : 400"
    >
      {{ l }}
    </text>
    <line
      v-if="hoveredIndex >= 0"
      :x1="xAt(hoveredIndex)"
      :x2="xAt(hoveredIndex)"
      :y1="PAD.t"
      :y2="HEIGHT - PAD.b"
      stroke="#2a8a6e"
      stroke-opacity=".35"
      stroke-dasharray="4 4"
    />
    <path
      v-for="(s, k) in series"
      :key="'a' + s.name + labels.join()"
      class="area"
      :d="areaPath(s.data)"
      :fill="`url(#lg${k})`"
    />
    <path
      v-for="s in series"
      :key="s.name + labels.join()"
      class="draw"
      pathLength="1"
      :d="linePath(s.data)"
      fill="none"
      :stroke="s.color"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <template v-for="s in series" :key="'p' + s.name">
      <circle
        v-for="(v, i) in s.data"
        :key="i"
        :cx="xAt(i)"
        :cy="yAt(v)"
        :r="hoveredIndex === i ? 6 : 4"
        :fill="s.color"
        stroke="#fff"
        stroke-width="2"
      />
    </template>
    <rect
      v-for="(l, i) in labels"
      :key="'h' + i"
      class="hit"
      :x="xAt(i) - columnWidth / 2"
      y="0"
      :width="columnWidth"
      :height="HEIGHT"
      fill="transparent"
      @mouseenter="hoveredIndex = i"
      @click="hoveredIndex = i"
    />
    <g v-if="hoveredIndex >= 0" class="tipbox" :transform="`translate(${tooltipX},${PAD.t})`">
      <rect width="110" :height="22 + series.length * 18" rx="9" fill="#10303a" />
      <text x="10" y="17" font-size="11" fill="#9fc4bb">{{ labels[hoveredIndex] }}</text>
      <g v-for="(s, k) in series" :key="s.name">
        <circle cx="14" :cy="31 + k * 18" r="4" :fill="s.color" />
        <text x="24" :y="35 + k * 18" font-size="11.5" fill="#fff">
          {{ s.name }}:
          <tspan font-weight="700">{{ s.data[hoveredIndex] }}</tspan>
        </text>
      </g>
    </g>
  </svg>
</template>
