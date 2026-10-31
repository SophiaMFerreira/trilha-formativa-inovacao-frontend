import { Box, Card, Grid, Heading, IconButton, Text } from "@chakra-ui/react"
import CustomTooltip from "./customTooltip"
import { FaExclamationCircle } from "react-icons/fa"
import { useState } from "react"

type CardCustomizadoProps = {
    titulo: string
    mensagem: string
    info?: string
    formWarning?: string
    children: React.ReactNode
}


export default function CardCustomizado({ titulo, mensagem, children, info, formWarning }: CardCustomizadoProps) {
    const [tooltipIsOpen, setTooltipIsOpen] = useState(true);

    return (
        <Card.Root size="lg"
            w="100%"
            mx="auto"
            my="10"
            maxW="3xl"
            py="8"
            px="4"
            borderWidth="2px"
            borderColor="brand.primaryDark"
            rounded="xl"
            bg="brand.white"
            shadow="card"
        >
            <Card.Header>
                <Grid
                    templateColumns={{
                        base: "1fr",
                        lg: "1fr 180px",
                    }}
                    gap="4"
                    color="brand.primaryDark"
                >
                    <Heading
                        textStyle="headingXL"
                        lineClamp={2}
                        wordBreak="break-word"
                    >
                        {titulo}
                    </Heading>

                    {info &&
                        <Box alignSelf="start">
                            <Text
                                textStyle="headingMD"
                                textAlign="end"
                                wordBreak="break-word"
                            >
                                {info}
                            </Text>
                        </Box>
                    }
                    {formWarning &&
                        <Box alignSelf="start">
                            <CustomTooltip
                                content={formWarning}
                                open={tooltipIsOpen}
                            >
                                <IconButton
                                    aria-label={formWarning}
                                    variant="ghost"
                                    size="md"
                                    color="brand.primaryDark"
                                    textStyle="inputPlaceholder"
                                    textAlign="justify"
                                    wordBreak="break-word"
                                    p="3"
                                    onClick={() => setTooltipIsOpen(!tooltipIsOpen)}
                                >
                                    <FaExclamationCircle />
                                </IconButton>
                            </CustomTooltip>
                        </Box>
                    }
                </Grid>
            </Card.Header>
            <Card.Body
                textStyle="bodyText"
                color="brand.neutral"
                py="4"
            >
                <Text
                    textStyle="bodyText"
                    color="brand.neutral"
                    lineClamp={2}
                    wordBreak="break-word"
                    textAlign="justify"
                >
                    {mensagem}
                </Text>
                {children}
            </Card.Body>
        </Card.Root>
    )
}