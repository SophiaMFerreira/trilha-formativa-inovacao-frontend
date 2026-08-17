import { defineRecipe } from "@chakra-ui/react"

export const buttonRecipe = defineRecipe({
  variants: {
    variant: {
      solid: {
        fontStyle: "navigation",
        bg: "brand.primaryDark",
        color: "brand.primaryLight",
        _hover: {
          bg: "brand.secondary",
        },
        _focusVisible: {
          outline: "3px solid",
          outlineColor: "brand.neutral",
        },
      },

      outline: {
        fontStyle: "navigation",
        bg: "brand.primaryLight",
        color: "brand.neutral",
        borderWidth: "1px",
        borderColor: "brand.neutral",
        _hover: {
          fontStyle: "navigationAction",
          borderColor: "brand.primaryDark",
          borderWidth:"1px",
          color: "brand.primaryDark",
          bg: "#2f9e411f",
        },
        _focusVisible: {
          outline: "3px solid",
          outlineColor: "brand.neutral",
        },
      },

      danger: {
        fontStyle: "navigation",
        bg: "brand.secondaryRed",
        color: "brand.white",
        _hover: {
          opacity: 0.9,
        },
        _focusVisible: {
          outline: "3px solid",
          outlineColor: "brand.secondaryRed",
        },
      },

      ghost: {
        fontStyle: "navigation",
        bg: "transparent",
        color: "brand.primaryDark",
        borderWidth: "1px",
        borderColor: "transparent",
        transition: "all 0.2s ease", 
        _hover: {
          fontStyle: "navigationAction",
          bg: "#2f9e411f",
          color: "brand.neutral",
        },
        _active: {
          bg: "brand.primaryLigth",
        },
        _focusVisible: {
          outline: "2px solid",
          outlineOffset: "2px",
          outlineColor: "brand.secondary",
        },
      },
    },

    size: {
      sm: {
        px: "3",
        py: "2",
        fontSize: "14px",
      },
      md: {
        px: "4",
        py: "3",
        fontSize: "16px",
      },
      lg: {
        px: "6",
        py: "4",
        fontSize: "18px",
      },
    },

  },

  defaultVariants: {
    variant: "solid",
    size: "md",
  },
})