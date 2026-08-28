<script setup>
// The control that opens the pane for one group. It sits under the
// section whose numbers it governs, so the thing you adjust is next to
// the sentence it changes.
import { computed } from 'vue'
import { store, overrideCount } from '../model-store.mjs'

const props = defineProps({
  group: { type: String, required: true },
  label: { type: String, default: 'Modify values' },
})

const open = computed(() => store.openPane === props.group)
const toggle = () => {
  store.openPane = open.value ? null : props.group
}
</script>

<template>
  <p class="modify">
    <button
      class="modify-btn" :class="{ 'is-open': open }"
      :aria-expanded="open" @click="toggle"
    >
      {{ open ? 'Done' : label }}
      <span v-if="overrideCount" class="badge">{{ overrideCount }}</span>
    </button>
  </p>
</template>
