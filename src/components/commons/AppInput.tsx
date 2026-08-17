import { forwardRef } from "react"
import { Input, type InputProps } from "@chakra-ui/react"
import { AppInputProps } from "@/types_consts/input"

const variants = {
  filled: {
    textStyle: "bodyText",
    borderRadius: "md",
    borderWidth: "1px",
    borderColor: "brand.primaryDark",
    bg: "brand.primaryLight",
    color: "brand.primaryDark",

    _hover: {
        color: "brand.primaryDark",
        bg: "#2f9e411f",
    },
    _focusVisible: {
        borderColor: "brand.secondary",
        boxShadow: "0 0 0 1px var(--chakra-colors-brand-primaryDark)",
    },
    _placeholder: {
        color: "brand.primaryDark",
    },
    _invalid: {
        borderColor: "brand.error",
        boxShadow: "0 0 0 2px rgba(217,45,32,.25)",
    },
  },

  outline: {
    fontStyle: "bodyText",
    borderRadius: "sm",
    borderWidth: "1px",
    bg: "transparent",
    color: "brand.neutral",
    borderColor: "brand.neutral",

    _hover: {
        borderColor: "brand.primaryDark",
        color: "brand.primaryDark",
        bg: "#2f9e411f",
    },
    _focusVisible: {
        borderColor: "brand.primaryDark",
        boxShadow: "0 0 0 1px var(--chakra-colors-brand-primaryDark)",
    },
    _invalid: {
        borderColor: "brand.error",
        boxShadow: "0 0 0 2px rgba(26, 9, 8, 0.25)",
    },
  },
} satisfies Record<"filled" | "outline", InputProps>

export const AppInput =  forwardRef<HTMLInputElement, AppInputProps>(
  ({ appVariant = "outline", ...props }, ref) => {
    return (
      <Input
        ref={ref}
        {...variants[appVariant]}
        {...props}
      />
    )
  }
)

AppInput.displayName = "AppInput"