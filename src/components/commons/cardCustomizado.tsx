import { Box, Card, Grid, Heading, HStack, Text } from "@chakra-ui/react"

type CardCustomizadoProps = {
    titulo: string
    mensagem: string
    info?: string
    children: React.ReactNode
}

export default function CardCustomizado({ titulo, mensagem, children, info }: CardCustomizadoProps) {
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

                    <Box alignSelf="start">
                        <Text
                            textStyle="headingMD"
                            textAlign="end"
                            wordBreak="break-word"
                        >
                            {info}
                        </Text>
                    </Box>
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
            {/*Adcionar footer com os dois botões */}
        </Card.Root>
    )
}