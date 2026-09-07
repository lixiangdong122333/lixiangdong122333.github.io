import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const APP_THEME_PRESET = definePreset(Aura, {
  primitive: {
    borderRadius: {
      md: '8px',
    },
  },
  semantic: {
    primary: {
      50: '{emerald.50}',
      100: '{emerald.100}',
      200: '{emerald.200}',
      300: '{emerald.300}',
      400: '{emerald.400}',
      500: '{emerald.700}',
      600: '{emerald.800}',
      700: '{emerald.800}',
      800: '{emerald.900}',
      900: '{emerald.900}',
      950: '{emerald.950}',
    },
    focusRing: {
      width: '2px',
    },
    formField: {
      borderRadius: '{border.radius.md}',
      focusRing: {
        width: '2px',
        style: 'solid',
        color: '{primary.color}',
        offset: '0',
        shadow: 'none',
      },
    },
  },
  components: {
    tabs: {
      tablist: {
        borderWidth: '0 0 2px 0',
      },
      tab: {
        focusRing: {
          width: '2px',
          offset: '-2px',
        },
      },
      navButton: {
        focusRing: {
          width: '2px',
          offset: '-2px',
        },
      },
      activeBar: {
        height: '2px',
      },
    },
  },
});
