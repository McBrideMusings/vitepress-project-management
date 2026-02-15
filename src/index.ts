import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'

export type { Ticket, Column, BoardConfig } from './types'

const theme: Theme = {
  extends: DefaultTheme,
  Layout,
}

export default theme
