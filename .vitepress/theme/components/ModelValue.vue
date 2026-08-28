<script setup>
// A figure inside a sentence. It reads from the store, so the prose
// around it never states a number and cannot go stale.
//
// An overridden value takes a delta in the same superscript slot the
// confidence marks use, because the page already has a vocabulary for
// annotating a number and a second one would only compete with it.
import { computed } from 'vue'
import {
  store, values, results, isOverridden, format,
} from '../model-store.mjs'

const props = defineProps({
  id: { type: String, required: true },
  unit: { type: String, default: null },
})

const item = computed(() => {
  for (const g of store.groups) {
    const found = g.items.find((i) => i.id === props.id)
    if (found) return found
  }
  const step = store.steps.find((s) => s.id === props.id)
  return step ? { id: step.id, label: step.label, unit: step.show } : null
})

const value = computed(() => ({ ...values.value, ...results.value })[props.id])
const unit = computed(() => props.unit ?? item.value?.unit ?? null)
const changed = computed(() => isOverridden(props.id))
</script>

<template>
  <span class="mv" :class="{ 'is-changed': changed }"
    :title="item ? item.label : id"
  >{{ store.loaded ? format(value, unit) : '…'
    }}<sup v-if="changed" class="dec d-changed"
      data-tip="Changed from the measured value" tabindex="0">Δ</sup></span>
</template>
