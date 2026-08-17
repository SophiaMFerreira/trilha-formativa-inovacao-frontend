import { Navigate, useNavigate } from "react-router-dom";

import { Avatar, Box, Button, Card, Heading, Spinner, Stack, Text } from "@chakra-ui/react"
import { FaAward } from "react-icons/fa";
import { useGame } from "@/hooks/useGame";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { UsuarioAPI } from "../../api/usuario";
import { Usuario } from "@/types_consts/usuario";

export default function DadosAventureiro() {
    const navigate = useNavigate();
        const {user} = useAuth()
    const { pontuacao, distintivos } = useGame()

    const [nomeUsuario, setNomeUsuario] = useState("")
    const [nomeAventureiro, setNomeAventureiro] = useState("")
    const [correioEletronico, setCorreioEletronico] = useState("")
    const [ocupacao, setOcupacao] = useState("")
    const [imagem, setImagem] = useState("");

    useEffect(() => {
        if (!user) return;

        async function carregarDados() {
            try {
                const usuarioResponse = await UsuarioAPI.buscarPorId(Number(user?.id))
                const usuario = usuarioResponse.data as Usuario

                if (!usuario) return; //MENSAGEM ERRO

                setNomeUsuario(usuario.nomeUsuario)
                setNomeAventureiro(usuario.nomeAventureiro)
                setCorreioEletronico(usuario.correioEletronico)
                setOcupacao(usuario.ocupacao.titulo)
            } catch (erro) {
                console.error(erro);
                //MENSAGEM DE ERRO
            }
        }

        carregarDados();
    }, [user]);
    return (
        <Box
            h="calc(100vh - 88px)"
            display="flex"
            justifyContent="center"
            alignItems="center"
            px="4"
        >
            <Card.Root size="lg"
                w="100%"
                mx="auto"
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
                    <Stack
                        direction="row"
                        justify="space-between"
                        align="center"
                    >
                        <Stack
                            direction="row"
                            justifyContent="left"
                            alignItems="center"
                            gap="5"
                        >
                            <Avatar.Root
                                size="full"
                                h={{ base: "24", md: "32", lg: "36" }}
                                w={{ base: "24", md: "32", lg: "36" }}
                                bg="#2f9e411f"
                            >
                                <Avatar.Fallback
                                    color="brand.primaryDark"
                                />
                                <Avatar.Image src={imagem} />
                            </Avatar.Root>
                            <Stack gap="2">
                                <Heading
                                    as="h1"
                                    textStyle="headingXL"
                                    color="brand.primaryDark"
                                    textAlign="left"
                                >
                                    {nomeUsuario}
                                </Heading>
                                <Heading
                                    as="h2"
                                    textStyle="headingSM"
                                    color="brand.neutral"
                                    textAlign="left"
                                >
                                    {nomeAventureiro}
                                </Heading>
                            </Stack>
                        </Stack>
                        <Stack gap="2">
                            <Text
                                textStyle="headingXL"
                                color="brand.primaryDark"
                                textAlign="right"
                            >
                                {pontuacao}
                            </Text>
                            <Text
                                textStyle="headingSM"
                                color="brand.neutral"
                                textAlign="right"
                            >
                                pontos
                            </Text>
                        </Stack>
                    </Stack>
                </Card.Header>
                <Card.Body
                    textStyle="bodyText"
                    color="brand.neutral"
                    py="4"
                    mt="6"
                    mx="2"
                >
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        w="full"
                    >
                        <Stack
                            flex={1}
                            align="start"
                            justify="center"
                            gap="4"
                            pl="2"
                        >
                            <Stack gap="0.5" justify="left" flex={1}>
                                <Text
                                    textStyle="emphasis"
                                    color="brand.primaryDark"
                                    textAlign="left"
                                >
                                    Email:
                                </Text>
                                <Text
                                    textStyle="bodyText"
                                    color="brand.neutral"
                                    textAlign="left"
                                >
                                    {correioEletronico}
                                </Text>
                            </Stack>
                            <Stack gap="0.5" justify="left" flex={1}>
                                <Text
                                    textStyle="emphasis"
                                    color="brand.primaryDark"
                                    textAlign="left"
                                    w="100%"
                                >
                                    Ocupação:
                                </Text>
                                <Text
                                    textStyle="bodyText"
                                    color="brand.neutral"
                                    textAlign="left"
                                >
                                    {ocupacao}
                                </Text>
                            </Stack>
                        </Stack>
                        <Stack
                            flex={1}
                            align="center"
                            justify="center"
                            gap="4"
                            onClick={() => navigate(`/distintivos`)}
                        >
                            <Text
                                textStyle="emphasis"
                                color="brand.primaryDark"
                                textAlign="center"
                            >
                                Distintivos recebidos
                            </Text>
                            <Stack
                                gap={5}
                                direction="row"
                            >
                                {distintivos.map(distintivo => (
                                    <Box
                                        key={distintivo.titulo}
                                        color={
                                            distintivo.adquirido
                                                ? "brand.primaryDark"
                                                : "gray.300"
                                        }
                                    >
                                        <FaAward size={60} />
                                    </Box>
                                ))}
                            </Stack>
                        </Stack>
                    </Stack>
                    <Stack
                        direction={{ base: "column", md: "row" }}
                        w="100%"
                        gap="4"
                        mt="6"
                    >
                        <Button
                            flex={1}
                            w="100%"
                            variant="outline"
                            onClick={() => navigate("/trilhaFormativaInovacao")}
                        >
                            Voltar
                        </Button>
                        <Button
                            flex={1}
                            w="100%"
                            variant="solid"
                            //onClick={() => navigate(`/cadastroAventureiro/${idParam}`)}
                            onClick={() => navigate(`/editarDadosAventureiro`)}
                        >
                            Editar meus dados
                        </Button>
                    </Stack>
                </Card.Body>
            </Card.Root >
        </Box>
    )
}