import DefaultTheme from 'vitepress/theme'
import './brand.css'

// The header carries no custom markup.
//
// Anything rendered into the title slots lands INSIDE VitePress's own
// title <a>, which nests anchors: invalid HTML, and the browser recovers
// by closing the outer one early. The logo and title come from
// themeConfig instead, so there is exactly one anchor. The second line of
// the wordmark is a CSS ::after in brand.css rather than an element.

export default DefaultTheme
