<script setup>
// The chain, re-run on every change. Same steps the equations page
// prints, evaluated by the same function.
import { computed } from 'vue'
import { store, results, format } from '../model-store.mjs'
import { formula } from '../../../scripts/chain.mjs'

const rows = computed(() =>
  store.steps.map((s) => ({
    id: s.id,
    label: s.label,
    link: s.link ?? null,
    from: formula(s),
    value: format(results.value[s.id], s.show),
    last: s.id === store.steps[store.steps.length - 1]?.id,
  })),
)
</script>

<template>
  <div class="model-chain">
    <table>
      <thead>
        <tr><th>#</th><th>Step</th><th>From</th><th class="r">Result</th></tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.id" :class="{ 'is-answer': r.last }">
          <td class="mono">{{ r.id }}</td>
          <td>
            <a v-if="r.link" :href="r.link">{{ r.label }}</a>
            <span v-else>{{ r.label }}</span>
          </td>
          <td class="mono dim">{{ r.from }}</td>
          <td class="r mono">{{ r.value }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
