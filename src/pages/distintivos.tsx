import { Navigate, useNavigate, } from "react-router-dom";
import { useEffect, useState } from "react";

import { Box, Button, Card, CloseButton, Dialog, Grid, Heading, Portal, Spinner, Stack, Text } from "@chakra-ui/react"
import { FaAward, FaTrophy } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { useGame } from "@/hooks/useGame";
import { UsuarioAPI } from "../../api/usuario";
import { Usuario } from "@/types_consts/usuario";

export default function Distintivos() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { distintivos, progressoTotal } = useGame()

    const [open, setOpen] = useState(false)
    const [nomeUsuario, setNomeUsuario] = useState("")

    if (!user) {
        return <Navigate to="/login" replace />
    }
    useEffect(() => {
        if (!user) return;

        async function carregarDados() {
            try {
                const usuarioResponse = await UsuarioAPI.buscarPorId(Number(user?.id))
                if (!usuarioResponse) return; //MENSAGEM ERRO

                setNomeUsuario(usuarioResponse.data.nomeUsuario)
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
                        gap="4"
                    >
                        <Heading
                            as="h1"
                            textStyle="headingXL"
                            color="brand.primaryDark"
                            textAlign="left"
                        >
                            Distintivos
                        </Heading>
                        <Text
                            textStyle="bodyText"
                            color="brand.neutral"
                        >
                            Veja suas conquistas aqui.
                        </Text>
                    </Stack>
                </Card.Header>
                <Card.Body
                    textStyle="bodyTextBold"
                    mt="4"
                    mx="2"
                >
                    <Grid
                        templateColumns="1fr auto 1fr"
                        templateRows="repeat(2, auto)"
                        columnGap="12"
                        rowGap="8"
                        alignItems="center"
                        justifyItems="center"
                        mb="8"
                        w="100%"
                    >
                        <Stack
                            gridColumn="1"
                            gridRow="1"
                            align="center"
                            gap="2"
                        >
                            <Box
                                color={distintivos.at(0)?.adquirido ? "brand.primaryDark" : "gray.300"}
                            >
                                <FaAward size={46} />
                            </Box>
                            {distintivos.at(0)?.adquirido && (
                                <Text color="brand.primaryDark">
                                    {distintivos.at(0)?.titulo}
                                </Text>
                            )}
                        </Stack>
                        <Stack
                            gridColumn="1"
                            gridRow="2"
                            align="center"
                            gap="2"
                        >
                            <Box
                                color={distintivos.at(1)?.adquirido ? "brand.primaryDark" : "gray.300"}
                            >
                                <FaAward size={46} />
                            </Box> 
                            {distintivos.at(1)?.adquirido && (
                                <Text color="brand.primaryDark">
                                    {distintivos.at(1)?.titulo}
                                </Text>
                            )}
                        </Stack>
                        <Box
                            gridColumn="2"
                            gridRow="1 / span 2"
                            color={progressoTotal === 100 ? "brand.primaryDark" : "gray.300"}
                            cursor={progressoTotal === 100 ? "pointer" : "not-allowed"}
                            onClick={() => {
                                if (progressoTotal === 100) {
                                    setOpen(true);
                                }
                            }}
                        >
                            <FaTrophy size={140} />
                        </Box>
                        <Stack
                            gridColumn="3"
                            gridRow="1"
                            align="center"
                            gap="2"
                        >
                            <Box
                                color={distintivos.at(2)?.adquirido ? "brand.primaryDark" : "gray.300"}
                            >
                                <FaAward size={46} />
                            </Box>
                            {distintivos.at(2)?.adquirido && (
                                <Text color="brand.primaryDark">
                                    {distintivos.at(2)?.titulo}
                                </Text>
                            )}
                        </Stack>
                        <Stack
                            gridColumn="3"
                            gridRow="2"
                            align="center"
                            gap="2"
                        >
                            <Box
                                color={distintivos.at(3)?.adquirido ? "brand.primaryDark" : "gray.300"}
                            >
                                <FaAward size={46} />
                            </Box>
                            {distintivos.at(3)?.adquirido && (
                                <Text color="brand.primaryDark">
                                    {distintivos.at(3)?.titulo}
                                </Text>
                            )}
                        </Stack>
                    </Grid>
                    <Button
                        flex={1}
                        w="100%"
                        variant="solid"
                        onClick={() => navigate(`/dadosAventureiro`)}
                    >
                        Voltar
                    </Button>
                </Card.Body>
            </Card.Root >
            <Dialog.Root
                size="xl"
                lazyMount
                open={open}
                onOpenChange={(e) => setOpen(e.open)}
                placement="center"
            >
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content p="10">
                            <Dialog.CloseTrigger asChild>
                                <CloseButton size="md" />
                            </Dialog.CloseTrigger>
                            <Dialog.Body>
                                <Stack
                                    gap="5"
                                    justifyContent="center"
                                    align="center"
                                >
                                    <Box
                                        color="brand.primaryDark"
                                    >
                                        <FaTrophy size={200} />
                                    </Box>
                                    <Heading
                                        as="h2"
                                        textStyle="headingXL"
                                        color="brand.primaryDark"
                                        textAlign="center"
                                    >
                                        Distintivos
                                    </Heading>
                                    <Text
                                        textStyle="bodyTextLong"
                                        color="brand.neutral"
                                        textAlign="justify"
                                        mx="10"
                                    >
                                        Parabenizamos o/a aluno/a {nomeUsuario}, aliquam placerat augue orci. Curabitur mollis mattis velit ut eleifend. Maecenas in lorem nec orci commodo porta mollis in lorem. Vestibulum quis faucibus arcu, in semper orci. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc pellentesque nisl sed nibh rhoncus, sed cursus libero molestie. Integer rutrum orci at vulputate porttitor. Praesent malesuada magna eget velit ultrices, nec consequat tellus iaculis.
                                    </Text>
                                </Stack>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Dialog.ActionTrigger asChild>
                                    <Button
                                        variant="outline"
                                        w="100%"
                                    >
                                        Concluir
                                    </Button>
                                </Dialog.ActionTrigger>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger asChild>
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </Box>
    )
}