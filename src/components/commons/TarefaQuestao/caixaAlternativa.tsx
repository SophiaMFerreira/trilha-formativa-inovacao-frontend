import { AlternativaProps } from "@/types_consts/alternativa"
import { Box, Text } from "@chakra-ui/react"

export default function CaixaAlternativa({texto, estilo, minH}: AlternativaProps) {
  return (
    <Box
      bg={estilo.bg}
      color={estilo.color}
      borderColor={estilo.borderColor}
      transition={estilo.transition}
      borderWidth="1px"
      rounded="sm"
      cursor="pointer"
      minH={minH ? "16" : "110px"}
      shadow="card"
      textStyle="emphasis"

      _hover={estilo.hover}

      _focusVisible={
        estilo.focusVisible
      }

      display="flex"
      alignItems="center"
      justifyContent="center"

      px="4"
      py="3"
    >
      <Text textAlign="center">
        {texto}
      </Text>
    </Box>
  )
}