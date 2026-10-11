<script setup>
// Yes/No confirmation dialog. Emits 'confirm' or 'cancel'.
defineProps({ title: String, message: String, confirmText: { type: String, default: 'Delete' } })
defineEmits(['confirm', 'cancel'])
</script>


<template>
  <div class="overlay" @mousedown.self="$emit('cancel')">
    <div class="modal" style="max-width: 420px" role="alertdialog">
      <h2>{{ title }}</h2>
      <p class="meta" style="font-size: 1rem">{{ message }}</p>
      <div class="mfoot">
        <button class="btn ghost" @click="$emit('cancel')">Keep it</button>
        <button class="btn danger" @click="$emit('confirm')">{{ confirmText }}</button>
      </div>
    </div>
  </div>
</template>
