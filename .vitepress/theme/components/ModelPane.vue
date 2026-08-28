<script setup>
// The editing pane. Hidden until somebody asks for it, because the model
// is a document first and an instrument second.
import { ref, computed, watch, onUnmounted } from 'vue'
import {
  store, values, setValue, reset, resetAll, isOverridden, overrideCount,
  exportOverlay, importOverlay, format,
} from '../model-store.mjs'
import { dec } from '../marks.mjs'

const open = computed(() => store.openPane !== null)
const group = computed(
  () => store.groups.find((g) => g.id === store.openPane) ?? null,
)
const note = ref('')

// The pane takes its own column rather than covering the prose. The class
// goes on the root element because the content column is the theme's, not
// ours, and it has to reflow rather than be overlapped.
const shift = (on) => {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('pane-open', on)
  }
}
watch(open, shift)
onUnmounted(() => shift(false))

const close = () => { store.openPane = null; note.value = '' }

const copyOverlay = async () => {
  try {
    await navigator.clipboard.writeText(exportOverlay())
    note.value = 'Copied to the clipboard.'
  } catch {
    note.value = 'The browser would not give access to the clipboard.'
  }
}

const paste = async () => {
  try {
    const text = await navigator.clipboard.readText()
    note.value = importOverlay(text).message
  } catch {
    note.value = 'The browser would not give access to the clipboard.'
  }
}
</script>

<template>
  <Teleport to="body">
    <transition name="pane">
      <aside v-if="open" class="model-pane" aria-label="Modify values">
        <header>
          <div>
            <h2>{{ group?.label }}</h2>
            <p v-if="group?.note">{{ group.note }}</p>
          </div>
          <button class="x" @click="close" aria-label="Close">×</button>
        </header>

        <p v-if="store.staleFrom" class="stale">
          These values were saved against an earlier version of the
          measures. They are still applied, and something underneath them
          has changed since.
        </p>

        <div v-for="it in group?.items ?? []" :key="it.id" class="row">
          <label :for="`in-${it.id}`">
            <span class="mono id">{{ it.id }}</span>
            {{ it.label }}
            <span v-if="it.confidence" v-html="dec(it.confidence)"></span>
          </label>
          <div class="controls">
            <input
              :id="`in-${it.id}`"
              type="range"
              :min="it.min" :max="it.max" :step="it.step"
              :value="values[it.id]"
              @input="setValue(it.id, $event.target.value)"
            />
            <output class="mono">{{ format(values[it.id], it.unit) }}</output>
            <button
              class="undo" :disabled="!isOverridden(it.id)"
              @click="reset(it.id)"
              :title="`Back to ${format(store.base[it.id], it.unit)}`"
            >↺</button>
          </div>
          <p v-if="it.note" class="note">{{ it.note }}</p>
          <p v-if="it.from" class="note">
            Measured on <a :href="it.from">its own page</a>. Changing it here
            asks a question and does not correct anything.
          </p>
        </div>

        <footer>
          <p class="count">
            {{ overrideCount }} value{{ overrideCount === 1 ? '' : 's' }}
            changed
          </p>
          <div class="acts">
            <button @click="copyOverlay">Copy</button>
            <button @click="paste">Paste</button>
            <button :disabled="!overrideCount" @click="resetAll">
              Reset all
            </button>
          </div>
          <p v-if="note" class="note">{{ note }}</p>
        </footer>
      </aside>
    </transition>
  </Teleport>
</template>
