<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  to: { type: String, default: '/appointments' }, // where the button leads
  label: { type: String, default: 'Back to appointments' },
})

const router = useRouter()

/** Path of the page the user came from (without ?query), or '' if unknown. */
function previousPath() {
  const previous = window.history.state?.back // set by vue-router, e.g. '/appointments?q=ali'
  return typeof previous === 'string' ? previous.split('?')[0] : ''
}

/** True when the previous page in history is the page this button points to. */
const cameFromTarget = () => previousPath() === props.to

/** Plain left-click on the same tab? (let the browser handle ctrl/cmd/shift/middle clicks) */
const isPlainClick = (event) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey

/** `navigate` is router-link's own click handler (it pushes `to` and ignores ctrl/cmd-clicks). */
function onClick(event, navigate) {
  if (isPlainClick(event) && cameFromTarget()) {
    event.preventDefault()
    router.back() // same as the browser Back button: list keeps its filters and scroll
  } else {
    navigate(event) // normal navigation to `to`
  }
}
</script>

<template>
  <router-link :to="to" custom v-slot="{ href, navigate }">
    <a :href="href" class="back-btn" @click="onClick($event, navigate)">
      <span class="back-btn__icon" aria-hidden="true">
        <svg
          viewBox="0 0 16 16"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M13 8H3M7.5 3.5 3 8l4.5 4.5" />
        </svg>
      </span>
      {{ label }}
    </a>
  </router-link>
</template>

<style scoped>
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 16px 5px 6px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: #fff;
  color: var(--ink);
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 1px 2px rgba(16, 48, 58, 0.06);
  transition:
    background 0.2s,
    border-color 0.2s,
    color 0.2s,
    box-shadow 0.2s,
    transform 0.15s;
}

/* round arrow badge on the left */
.back-btn__icon {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--mint);
  color: var(--teal-d);
  transition:
    transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
    background 0.2s,
    color 0.2s;
}

.back-btn:hover {
  background: var(--mint);
  border-color: var(--teal);
  color: var(--teal-d);
  box-shadow: 0 6px 14px -8px var(--teal);
}
.back-btn:hover .back-btn__icon {
  background: var(--teal);
  color: #fff;
  transform: translateX(-3px); /* arrow nudges left, hinting at "go back" */
}

.back-btn:active {
  transform: scale(0.97);
}
</style>
