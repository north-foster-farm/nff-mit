import DefaultTheme from 'vitepress/theme'
import { h, onMounted } from 'vue'
import './brand.css'
import './model.css'
import { loadModel } from './model-store.mjs'
import ModelValue from './components/ModelValue.vue'
import ModelChain from './components/ModelChain.vue'
import ModelPane from './components/ModelPane.vue'
import ModifyValues from './components/ModifyValues.vue'

// The header carries no custom markup.
//
// Anything rendered into the title slots lands INSIDE VitePress's own
// title <a>, which nests anchors: invalid HTML, and the browser recovers
// by closing the outer one early. The logo and title come from
// themeConfig instead, so there is exactly one anchor. The second line of
// the wordmark is a CSS ::after in brand.css rather than an element.

// Confidence marks explain themselves on hover and on focus.
//
// The native `title` tooltip was doing this job badly: it waits a second,
// cannot be styled, and never appears for a keyboard user. One delegated
// listener and one reused node replace it, so a page with two hundred
// marks still carries no per-mark markup and binds nothing per mark.
function mountMarkTooltips() {
  if (typeof window === 'undefined' || window.__decTips) return
  window.__decTips = true

  const tip = document.createElement('div')
  tip.className = 'dec-tip'
  tip.setAttribute('role', 'tooltip')
  document.body.appendChild(tip)

  let current = null

  const hide = () => {
    current = null
    tip.classList.remove('is-on')
  }

  const show = (el) => {
    const text = el.getAttribute('data-tip')
    if (!text) return
    current = el
    tip.textContent = text

    // Measure after filling, then clamp inside the viewport. Positioning
    // is fixed, so scrolling invalidates it and simply dismisses.
    tip.classList.add('is-on')
    const r = el.getBoundingClientRect()
    const t = tip.getBoundingClientRect()
    const left = Math.min(
      Math.max(8, r.left + r.width / 2 - t.width / 2),
      window.innerWidth - t.width - 8,
    )
    const above = r.top - t.height - 8
    tip.style.left = `${left}px`
    tip.style.top = above < 8 ? `${r.bottom + 8}px` : `${above}px`
  }

  const find = (e) =>
    e.target instanceof Element ? e.target.closest('.dec[data-tip]') : null

  document.addEventListener('mouseover', (e) => {
    const el = find(e)
    if (el && el !== current) show(el)
  })
  document.addEventListener('mouseout', (e) => {
    if (find(e)) hide()
  })
  document.addEventListener('focusin', (e) => {
    const el = find(e)
    if (el) show(el)
    else if (current) hide()
  })
  document.addEventListener('focusout', (e) => {
    if (find(e)) hide()
  })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hide()
  })
  window.addEventListener('scroll', hide, { passive: true })
  window.addEventListener('resize', hide, { passive: true })
}

// A plain arrow function is a functional component, and onMounted inside
// one silently does nothing: there is no setup context to register it
// against. The hook has to live in a real setup().
const Layout = {
  name: 'MitLayout',
  setup() {
    onMounted(() => {
      mountMarkTooltips()
      loadModel()
    })
    return () => h(DefaultTheme.Layout, null, {
      'layout-bottom': () => h(ModelPane),
    })
  },
}

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('Fig', ModelValue)
    app.component('Chain', ModelChain)
    app.component('Modify', ModifyValues)
  },
}
