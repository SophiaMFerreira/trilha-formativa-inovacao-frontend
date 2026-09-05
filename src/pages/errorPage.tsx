import CardCustomizado from "@/components/commons/cardCustomizado";
import { useAuth } from "@/hooks/useAuth";
import { Box, Button, Heading, Stack, Text } from "@chakra-ui/react";
import { FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function ErrorPage() {
    const { user } = useAuth()
    const navigate = useNavigate();
    return (
        <CardCustomizado
            titulo=""
            mensagem=""
        >
            <Stack
                w="100%"
                gap="5"
                textStyle="bodyTextLong"
                color="brand.neutral"
                textAlign="justify"
                align="center"
            >
                <Heading
                    as="h1"
                    textStyle="headingXL"
                    color="brand.secondaryRed"
                    textAlign="center"
                >
                    Ops! Algo deu errado.
                </Heading>
                <Text
                    textStyle="bodyText"
                    color="brand.neutral"
                    textAlign="justify"
                >
                    Não foi possível acessar esta página.
                </Text>
                <Box
                    color="brand.secondaryRed"
                >
                    <FaExclamationTriangle
                        size={64}
                        color="brand.secondaryRed"
                    />
                </Box>
                <Button
                    w="100%"
                    variant="outline"
                    onClick={() => {
                        user ? (
                            user.role === "admin" ?
                                navigate("/banco-materiais") :
                                navigate("/trilhaFormativaInovacao")
                        ) :
                            navigate("/")
                    }}
                >
                    Voltar
                </Button>
            </Stack>
        </CardCustomizado>
    );
}