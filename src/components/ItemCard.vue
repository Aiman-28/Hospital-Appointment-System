<script setup>
// One appointment as a card (grid) or table row (layout="row"), with patient + doctor photos.
import Avatar from './Avatar.vue'
import { STATUSES, fmtDate, fmtTime, photoOf } from '../store'
defineProps({ item: Object, layout: { type: String, default: 'card' } })
defineEmits(['view', 'edit', 'delete', 'status'])
</script>


<template>
  <tr v-if="layout === 'row'">
    <td>
      <div class="arow" style="padding: 0; border: 0">
        <Avatar :src="photoOf(item.patientName)" :name="item.patientName" :size="36" />
        <div class="g">
          <strong>{{ item.patientName }}</strong>
          <small>{{ item.patientEmail }}</small>
        </div>
      </div>
    </td>
    <td>
      <div class="arow" style="padding: 0; border: 0">
        <Avatar :src="photoOf(item.doctor)" :name="item.doctor" :size="30" />
        {{ item.doctor }}
      </div>
    </td>
    <td class="hide-md">{{ item.department }}</td>
    <td>
      {{ fmtDate(item.date) }}
      <div class="meta">{{ fmtTime(item.time) }}</div>
    </td>
    <td>
      <select
        class="input"
        :value="item.status"
        @change="$emit('status', item.id, $event.target.value)"
      >
        <option v-for="s in STATUSES" :key="s">{{ s }}</option>
      </select>
    </td>
    <td>
      <div class="ia">
        <button class="ib" data-tip="View" aria-label="View" @click="$emit('view', item)">
          👁️
        </button>
        <button class="ib" data-tip="Edit" aria-label="Edit" @click="$emit('edit', item)">
          ✏️
        </button>
        <button class="ib d" data-tip="Delete" aria-label="Delete" @click="$emit('delete', item)">
          🗑️
        </button>
      </div>
    </td>
  </tr>
  <article v-else class="card">
    <div class="top">
      <div class="arow" style="padding: 0; border: 0">
        <Avatar :src="photoOf(item.patientName)" :name="item.patientName" :size="44" />
        <div class="g">
          <h3>{{ item.patientName }}</h3>
          <div class="meta">{{ item.patientEmail }}</div>
        </div>
      </div>
      <span class="badge" :class="item.status">{{ item.status }}</span>
    </div>
    <div class="when">
      <span>{{ fmtDate(item.date) }}</span>
      <span>{{ fmtTime(item.time) }}</span>
    </div>
    <div class="arow" style="padding: 0; border: 0">
      <Avatar :src="photoOf(item.doctor)" :name="item.doctor" :size="30" />
      <div class="meta">{{ item.doctor }} · {{ item.department }}</div>
    </div>
    <div class="reason">{{ item.reason }}</div>
    <div class="cactions">
      <select
        class="input"
        :value="item.status"
        aria-label="Change status"
        data-tip="Change status"
        @change="$emit('status', item.id, $event.target.value)"
      >
        <option v-for="s in STATUSES" :key="s">{{ s }}</option>
      </select>
      <button class="btn ghost sm" @click="$emit('view', item)">View</button>
      <button class="btn ghost sm" @click="$emit('edit', item)">Edit</button>
      <button class="btn ghost sm" @click="$emit('delete', item)">Delete</button>
    </div>
  </article>
</template>
