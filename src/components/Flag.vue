<script setup>
// Country flag image (Windows can't render flag emoji); falls back to the country code.
import { ref, computed } from 'vue'
const props = defineProps({ code: String })
const imageFailed = ref(false)
const flagCode = computed(() => (({ UK: 'gb' })[props.code] || props.code).toLowerCase())
</script>


<template>
  <img
    v-if="!imageFailed"
    class="flag"
    :src="`https://flagcdn.com/w40/${flagCode}.png`"
    :alt="code"
    width="20"
    height="15"
    @error="imageFailed = true"
  />
  <b v-else class="fb">{{ code }}</b>
</template>
