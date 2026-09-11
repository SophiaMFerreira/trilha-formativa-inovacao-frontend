import { Navigate, useNavigate, } from "react-router-dom";
import { useEffect, useState } from "react";
import { Box, Button, Card, CloseButton, Dialog, Grid, Heading, Portal, Stack, Text } from "@chakra-ui/react"
import { useAuth } from "@/hooks/useAuth";
import { useGame } from "@/hooks/useGame";
import { UsuarioAPI } from "../../api/usuario";
import { toaster } from "@/components/commons/toaster";
import { mensagensToastErro } from "@/config/mensagensToaster";
import { mensagensErroConsole } from "@/config/mensagensError";

import conectorSolucoes from "@/assets/images/distintivos/DistintivoConectorDeSolucoes.svg"
import doutorLegal from "@/assets/images/distintivos/DistintivoDoutorLegal.svg"
import impulsionadorPossibilidades from "@/assets/images/distintivos/DistintivoImpulsionadorDePossibilidades.svg"
import mestreCriatividade from "@/assets/images/distintivos/DistintivoMestreDaCriatividade.svg"
import trofeuFinal from "@/assets/images/distintivos/TrofeuFinal.svg"
import DistintivoImagem from "@/components/commons/distintivo";

export default function Distintivos() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { distintivos, progressoTotal } = useGame()

    const [open, setOpen] = useState(progressoTotal === 100)
    const [nomeUsuario, setNomeUsuario] = useState("")

    if (!user) {
        return <Navigate to="/login" replace />
    }

    const imagensDistintivos: Record<string, string> = {
        "Conector de Soluções": conectorSolucoes,
        "Doutor Legal": doutorLegal,
        "Impulsionador de Inovações": impulsionadorPossibilidades,
        "Mestre da Criatividade": mestreCriatividade,
        "Troféu Final": trofeuFinal,
    };

    useEffect(() => {
        if (!user) return;

        async function carregarDados() {
            try {
                const usuarioResponse = await UsuarioAPI.buscarPorId(Number(user?.id))
                if (!usuarioResponse) return;

                setNomeUsuario(usuarioResponse.data.nomeUsuario)
            } catch (erro) {
                toaster.create(mensagensToastErro.carregarUsuario)
                console.error(mensagensErroConsole.buscarAventureiro, erro);
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
                        <Box gridColumn="1" gridRow="1">
                            <DistintivoImagem
                                imagem={
                                    imagensDistintivos[
                                    distintivos.at(0)?.titulo ??
                                    "Conector de Soluções"
                                    ]
                                }
                                titulo={distintivos.at(0)?.titulo}
                                adquirido={distintivos.at(0)?.adquirido ?? false}
                            />
                        </Box>

                        <Box gridColumn="1" gridRow="2">
                            <DistintivoImagem
                                imagem={
                                    imagensDistintivos[
                                    distintivos.at(1)?.titulo ??
                                    "Doutor Legal"
                                    ]
                                }
                                titulo={distintivos.at(1)?.titulo}
                                adquirido={distintivos.at(1)?.adquirido ?? false}
                            />
                        </Box>
                        <Box
                            gridColumn="2"
                            gridRow="1 / span 2"
                        >
                            <DistintivoImagem
                                imagem={imagensDistintivos[
                                    distintivos.at(5)?.titulo ??
                                    "Troféu Final"]}
                                adquirido={progressoTotal === 100}
                                trofeu
                                tamanho={180}
                                onClick={() => {
                                    if (progressoTotal === 100) {
                                        setOpen(true);
                                    }
                                }}
                            />
                        </Box>
                        <Box gridColumn="3" gridRow="1">
                            <DistintivoImagem
                                imagem={
                                    imagensDistintivos[
                                    distintivos.at(2)?.titulo ??
                                    "Impulsionador de Inovações"
                                    ]
                                }
                                titulo={distintivos.at(2)?.titulo}
                                adquirido={distintivos.at(2)?.adquirido ?? false}
                            />
                        </Box>
                        <Box gridColumn="3" gridRow="2">
                            <DistintivoImagem
                                imagem={
                                    imagensDistintivos[
                                    distintivos.at(3)?.titulo ??
                                    "Mestre da Criatividade"
                                    ]
                                }
                                titulo={distintivos.at(3)?.titulo}
                                adquirido={distintivos.at(3)?.adquirido ?? false}
                            />
                        </Box>
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
                                        <DistintivoImagem
                                            imagem={imagensDistintivos[
                                                distintivos.at(5)?.titulo ??
                                                "Troféu Final"]}
                                            adquirido={progressoTotal === 100}
                                            trofeu
                                            tamanho={160}
                                            onClick={() => {
                                                if (progressoTotal === 100) {
                                                    setOpen(true);
                                                }
                                            }}
                                        />
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
                                        overflowWrap="anywhere"
                                        mx="10"
                                    >
                                        Parabéns, {nomeUsuario}! Você chegou ao fim da Trilha Formativa em Inovação! Que conquista incrível! Ao longo dessa jornada, você explorou novos conhecimentos, enfrentou desafios, completou missões e, passo a passo, construiu sua própria trajetória pela inovação. Cada ponto conquistado, cada desafio superado e cada distintivo colecionado representa uma parte dessa jornada. Mas chegar ao final não significa que a aventura termina por aqui. O conhecimento que você conquistou agora pode acompanhar você em novos projetos, novas ideias e novas possibilidades. Parabéns por essa conquista! Continue explorando, continue aprendendo e continue inovando.
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