import { extendTheme } from '@chakra-ui/react'

export const theme = extendTheme({
  fonts: {
    heading: "'Inter', sans-serif",
    body: "'Inter', sans-serif",
  },
  colors: {
    brand: {
      50:  '#edf7f2',
      100: '#c8e9d8',
      200: '#a3dbbe',
      300: '#7ecda4',
      400: '#59bf8a',
      500: '#3aab72',
      600: '#2d8659',
      700: '#1f6040',
      800: '#123b27',
      900: '#04160e',
    },
    amber: {
      500: '#E8A838',
      600: '#c98c20',
    },
    rose: {
      500: '#D94F4F',
      600: '#b83535',
    },
    neutral: {
      50:  '#F8F7F4',
      100: '#EDEBE6',
      200: '#D9D6CE',
      300: '#B8B4AB',
      400: '#928D83',
      500: '#6B6660',
      600: '#4A4640',
      700: '#2E2B26',
      800: '#1A1815',
      900: '#0D0C0A',
    },
  },
  components: {
    Button: {
      baseStyle: { fontWeight: '500', borderRadius: '8px' },
      variants: {
        solid: {
          bg: 'brand.600',
          color: 'white',
          _hover: { bg: 'brand.700' },
          _active: { bg: 'brand.700' },
        },
        ghost: {
          color: 'neutral.600',
          _hover: { bg: 'neutral.100', color: 'neutral.800' },
        },
        outline: {
          borderColor: 'neutral.200',
          color: 'neutral.700',
          _hover: { bg: 'neutral.50' },
        },
      },
      defaultProps: { variant: 'solid' },
    },
    Input: {
      variants: {
        outline: {
          field: {
            bg: 'white',
            borderColor: 'neutral.200',
            borderRadius: '8px',
            _focus: { borderColor: 'brand.500', boxShadow: '0 0 0 1px #3aab72' },
            _placeholder: { color: 'neutral.400' },
          },
        },
      },
      defaultProps: { variant: 'outline' },
    },
    Select: {
      variants: {
        outline: {
          field: {
            bg: 'white',
            borderColor: 'neutral.200',
            borderRadius: '8px',
            _focus: { borderColor: 'brand.500', boxShadow: '0 0 0 1px #3aab72' },
          },
        },
      },
      defaultProps: { variant: 'outline' },
    },
    Textarea: {
      variants: {
        outline: {
          bg: 'white',
          borderColor: 'neutral.200',
          borderRadius: '8px',
          _focus: { borderColor: 'brand.500', boxShadow: '0 0 0 1px #3aab72' },
          _placeholder: { color: 'neutral.400' },
        },
      },
      defaultProps: { variant: 'outline' },
    },
    Badge: {
      baseStyle: { borderRadius: '6px', fontWeight: '500', textTransform: 'none' },
    },
  },
  styles: {
    global: {
      body: { bg: '#F8F7F4', color: '#1A1815' },
    },
  },
})
