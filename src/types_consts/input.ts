import { InputProps } from "@chakra-ui/react"

export type AppInputProps = Omit<InputProps, "variant"> & {
  appVariant?: "filled" | "outline"
}
