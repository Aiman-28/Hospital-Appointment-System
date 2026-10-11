<script setup>
// Search input; works with v-model.
defineProps({ modelValue: String })
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="search">
    <span>🔍</span>
    <input
      class="input"
      type="search"
      placeholder="Search by patient, doctor or reason"
      aria-label="Search appointments"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>
