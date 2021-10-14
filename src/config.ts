import * as theme from '../ui.config.json'
import { GlobalThemeOverrides } from 'naive-ui'

export const themeOverrides: GlobalThemeOverrides = {
  common: {
    // Colors
    primaryColor: theme.colors.primary.DEFAULT,
    primaryColorHover: theme.colors.primary.focus,
    primaryColorPressed: theme.colors.primary.focus,
    primaryColorSuppl: theme.colors.primary.focus,

    infoColor: theme.colors.info,
    infoColorPressed: theme.colors.info,
    infoColorSuppl: theme.colors.info,
    infoColorHover: theme.colors.info,

    // Border
    borderRadius: '5px',
  },

  DataTable: {
    thTextColor: theme.colors.secondary.content,
    borderColorModal: 'rgba(173, 173, 197, 1)',
    thColor: theme.colors.secondary.DEFAULT,
    thFontWeight: '600',
  },
}

export { theme }
