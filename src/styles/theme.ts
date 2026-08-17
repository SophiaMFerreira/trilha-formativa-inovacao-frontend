import {
  createSystem,
  defaultConfig,
  defineRecipe,
} from "@chakra-ui/react"

import { buttonRecipe } from "./recipes/button"

export const systemInovacao = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        brand: {
          white: { value: "#ffffff" },
          primaryLight: { value: "#f1f4d7" },
          primaryDark: { value: "#154c21" },
          secondary: { value: "#2f9e41" },
          secondaryRed: { value: "#CD191E" },
          link: { value: "#1100FF" },
          neutral: { value: "#281d15" },
          black: { value: "#000000" },
        },
      },

      fonts: {
        heading: { value: "Montserrat, sans-serif" },
        body: { value: "Open Sans, sans-serif" },
      },

      shadows: {
        map: {
          value: "0px 4px 6px 4px rgba(40, 29, 21, 0.35)",
        },
        card: {
          value: "0px 4px 6px 4px rgba(40, 29, 21, 0.12)",
        },
      },
    },

    textStyles: {
      headingXL: {
        value: {
          fontFamily: "heading",
          fontSize: "44px",
          fontWeight: "500",
          lineHeight: "46px",
        },
      },
      headingMD: {
        value: {
          fontFamily: "heading",
          fontSize: "32px",
          fontWeight: "400",
        },
      },
      headingSM: {
        value: {
          fontFamily: "body",
          fontSize: "20px",
          fontWeight: "700",
        },
      }, 
      headingXS: {
        value: {
          fontFamily: "heading",
          fontSize: "20px",
          fontWeight: "600",
        },
      },
      emphasis: {
        value: {
          fontFamily: "body",
          fontSize: "16px",
          fontWeight: "700",
        },
      },
      bodyText: {
        value: {
          fontFamily: "body",
          fontSize: "16px",
          fontWeight: "400",
        },
      },
      bodyTextLong: {
        value: {
          fontFamily: "body",
          fontSize: "16px",
          fontWeight: "400",
          lineHeight: "27px",
        },
      },
      bodyTextBold: {
        value: {
          fontFamily: "body",
          fontSize: "16px",
          fontWeight: "600",
        },
      },
      inputPlaceholder: {
        value: {
          fontFamily: "body",
          fontSize: "14px",
          fontWeight: "300",
        },
      },
      navigation: {
        value: {
          fontFamily: "body",
          fontSize: "18px",
          fontWeight: "500",
        },
      },
    },

    recipes: {
      button: buttonRecipe
    },

    semanticTokens: {
      colors: {
        buttonPrimary: {
          solid: { value: "{colors.brand.primaryDark}" },
          contrast: { value: "{colors.brand.primaryLight}" },
          hover: { value: "{colors.brand.secondary}" },
        },
      
        buttonSecondary: {
          solid: { value: "{colors.brand.primaryLight}" },
          contrast: { value: "{colors.brand.neutral}" },
          border: { value: "{colors.brand.neutral}" },
          hover: { value: "{colors.brand.white}" },
        },
      
        danger: {
          solid: { value: "{colors.brand.secondaryRed}" },
          contrast: { value: "{colors.brand.white}" },
        },
      },
    },    
  },
})

export default systemInovacao;