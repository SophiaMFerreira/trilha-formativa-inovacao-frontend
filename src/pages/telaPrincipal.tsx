import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

import { Avatar, Box, Button, Carousel, Dialog, DialogFooter, Grid, Heading, HStack, IconButton, Image, Portal, Progress, SimpleGrid, Skeleton, Stack, Text } from "@chakra-ui/react";
import CustomTooltip from "@/components/commons/customTooltip";
import { Ranking } from "@/components/ranking";
import { FaAngleLeft, FaAngleRight, FaAward } from "react-icons/fa";

import { useGame } from "@/hooks/useGame";
import MapaPrincipal from "@/components/commons/mapaPrincipal";
import { Usuario } from "@/types_consts/usuario";
import { useEffect, useState } from "react";
import { UsuarioAPI } from "../../api/usuario";
import { toaster } from "@/components/commons/toaster";
import { mensagensToastErro } from "@/config/mensagensToaster";
import { mensagensErroConsole } from "@/config/mensagensError";
import { urlDaFotoDePerfil } from "@/utils/fotoPerfil";
import { mensagemDeErroDaApi } from "@/utils/erroApi";
import { carrosselIntroducao } from "@/config/carrosselIntro";


export default function TelaPrincipal() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { progressoTotal, progressoPontosTematicas, distintivos } = useGame()

    const [usuario, setUsuario] = useState<Usuario>()

    /*
     * URL da foto derivada do usuário carregado. Havia um segundo
     * useEffect apenas para montar essa string, custando uma
     * renderização extra sem fazer requisição alguma.
     */
    const imagem = urlDaFotoDePerfil(usuario)
    const [open, setOpen] = useState(false)
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        if (!user) return;

        async function carregarDados() {
            try {
                const usuarioResponse = await UsuarioAPI.buscarPorId(Number(user?.id))
                const usuario = usuarioResponse.data as Usuario

                if (!usuario) return;

                setUsuario(usuario)
                setOpen(usuario.primeiroAcesso)
            } catch (erro) {
                toaster.create(mensagensToastErro.carregarUsuario)
                console.error(
                    mensagensErroConsole.buscarAventureiro,
                    mensagemDeErroDaApi(erro) ?? erro
                );
            }
        }
        carregarDados();
    }, [user?.id]);

    const onFecharModal = async () => {
        try {
            if (!usuario) return

            await UsuarioAPI.alterarPrimeiroAcesso(usuario.id);

            setOpen(false)
        } catch (erro) {
            console.error( mensagensErroConsole.primeiroAcesso,
                mensagemDeErroDaApi(erro) ?? erro
            );
        }
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    /*
     * A tela NÃO espera mais o GET do usuário para renderizar.
     * O dado só alimenta o avatar; segurar mapa, distintivos, barra de
     * progresso e ranking por causa dele atrasava a tela inteira por
     * uma requisição que nem é necessária na primeira pintura.
     */

    return (
        <>
            <SimpleGrid
                columns={{
                    base: 1,
                    lg: 12,
                }}
                gap={10}
                bg="gray.50"
                h="full"
                maxH="calc(100vh - 88px)"
                py={10}
                px="40"
                alignItems="stretch"
            >
                <Stack
                    gap="5"
                    gridColumn={{ lg: "span 9" }}
                    h="100%"
                >
                    <HStack
                        gap="5"
                    >
                        <Avatar.Root
                            size="lg"
                            bg="#2f9e411f"
                            onClick={() => navigate(`/dadosAventureiro`)}
                        >
                            <Avatar.Fallback color="brand.primaryDark" />
                            {imagem && <Avatar.Image src={imagem} />}
                        </Avatar.Root>
                        <HStack gap={2}>
                            {distintivos.map((distintivo) =>
                                distintivo.titulo !== "Troféu Final" &&
                            (
                                distintivo.adquirido ?
                                    (
                                        <CustomTooltip
                                            content={distintivo.titulo}
                                            key={distintivo.titulo}
                                        >
                                            <Box
                                                key={distintivo.titulo}
                                                color="brand.primaryDark"
                                                onClick={() => navigate(`/distintivos`)}
                                            >
                                                <FaAward size={28} />
                                            </Box>
                                        </CustomTooltip>
                                    ) : (
                                        <Box
                                            key={distintivo.titulo}
                                            color="gray.300"
                                            onClick={() => navigate(`/distintivos`)}
                                        >
                                            <FaAward size={28} />
                                        </Box>
                                    )
                            ))}
                        </HStack>
                        <CustomTooltip
                            content={`Progresso total: ${Math.round(progressoTotal)}%`}
                        >
                            <Progress.Root
                                /*
                                 * "value", não "defaultValue": com
                                 * defaultValue o componente fica não
                                 * controlado e a barra continuava em zero
                                 * depois de o progresso chegar da API.
                                 */
                                value={progressoTotal}
                                min={0}
                                max={100}
                                rounded="full"
                                w="100%"
                                ml="10"
                                size="lg"
                            >
                                <Progress.Track
                                    bg="brand.primaryLight"
                                >
                                    <Progress.Range
                                        rounded="full"
                                        bg="brand.primaryDark"
                                    />
                                </Progress.Track>
                            </Progress.Root>
                        </CustomTooltip>
                    </HStack>
                    <   MapaPrincipal
                        navigate={navigate}
                        progressoPontosTematicas={progressoPontosTematicas}
                        progressoTotal={progressoTotal}
                    />
                </Stack>
                <Box gridColumn={{ lg: "span 3" }}>
                    <Ranking />
                </Box>
            </SimpleGrid >
            {/*Modal de primeiro uso*/}
            {usuario?.primeiroAcesso && (
                <Dialog.Root
                    size="xl"
                    lazyMount
                    open={open}
                    onOpenChange={(e) => setOpen(e.open)}
                    placement="center"
                    closeOnInteractOutside={false}
                >
                    <Portal>
                        <Dialog.Backdrop />

                        <Dialog.Positioner>
                            <Dialog.Content
                                maxW="960px"
                                w="calc(100% - 32px)"
                            >
                                <Dialog.Header
                                    px={{ base: "6", md: "10" }}
                                    pt={{ base: "6", md: "8" }}
                                    pb="2"
                                >
                                    <Dialog.Title
                                        textStyle="headingXL"
                                        color="brand.primaryDark"
                                    >
                                        Bem-vindo {usuario.nomeAventureiro}!
                                    </Dialog.Title>
                                </Dialog.Header>

                                <Dialog.Body
                                    px={{ base: "6", md: "10" }}
                                    pb="4"
                                >
                                    <Carousel.Root
                                        slideCount={carrosselIntroducao.length}
                                        maxW="850px"
                                        mx="auto"
                                        allowMouseDrag
                                    >
                                        <Carousel.ItemGroup>
                                            {carrosselIntroducao.map((item, index) => (
                                                <Carousel.Item
                                                    key={item.id}
                                                    index={index}
                                                >
                                                    <Grid
                                                        templateColumns={{
                                                            base: "1fr",
                                                            md: "1.35fr 1fr",
                                                        }}
                                                        gap={{ base: "5", md: "8" }}
                                                        alignItems="center"
                                                        minH={{ md: "360px" }}
                                                    >
                                                        <Box
                                                            display="flex"
                                                            justifyContent="center"
                                                            alignItems="center"
                                                        >
                                                            <Skeleton
                                                                loading={!loaded}
                                                                w="100%"
                                                                maxW="560px"
                                                                h={{ base: "220px", md: "310px" }}
                                                                rounded="2xl"
                                                            >
                                                                <Image
                                                                    src={item.imagem}
                                                                    alt={item.titulo}
                                                                    w="100%"
                                                                    h={{ base: "220px", md: "310px" }}
                                                                    objectFit="cover"
                                                                    rounded="2xl"
                                                                    onLoad={() => setLoaded(true)}
                                                                />
                                                            </Skeleton>
                                                        </Box>
                                                        <Stack
                                                            gap="4"
                                                            justify="center"
                                                        >
                                                            <HStack
                                                                gap="3"
                                                                color="brand.primaryDark"
                                                            >
                                                                {item.icone}

                                                                <Heading
                                                                    textStyle="headingXS"
                                                                    color="brand.primaryDark"
                                                                >
                                                                    {item.titulo}
                                                                </Heading>
                                                            </HStack>

                                                            <Text
                                                                textStyle="bodyText"
                                                                color="brand.neutral"
                                                                lineHeight="1.7"
                                                            >
                                                                {item.conteudo}
                                                            </Text>
                                                        </Stack>
                                                    </Grid>
                                                </Carousel.Item>
                                            ))}
                                        </Carousel.ItemGroup>
                                        <Carousel.Control
                                            justifyContent="center"
                                            alignItems="center"
                                            gap="3"
                                            mt="6"
                                            color="brand.primaryDark"
                                        >
                                            <Carousel.PrevTrigger asChild>
                                                <IconButton
                                                    aria-label="Card anterior"
                                                    variant="ghost"
                                                    size="lg"
                                                    color="brand.primaryDark"
                                                >
                                                    <FaAngleLeft />
                                                </IconButton>
                                            </Carousel.PrevTrigger>
                                            <Carousel.Indicators />
                                            <Carousel.NextTrigger asChild>
                                                <IconButton
                                                    aria-label="Próximo card"
                                                    variant="ghost"
                                                    size="lg"
                                                    color="brand.primaryDark"
                                                >
                                                    <FaAngleRight />
                                                </IconButton>
                                            </Carousel.NextTrigger>
                                        </Carousel.Control>
                                    </Carousel.Root>
                                </Dialog.Body>
                                <DialogFooter
                                    px={{ base: "6", md: "10" }}
                                    pb={{ base: "6", md: "8" }}
                                    pt="2"
                                >
                                    <Button
                                        w="100%"
                                        variant="outline"
                                        onClick={() => {
                                            onFecharModal()
                                        }}
                                    >
                                        Pular
                                    </Button>
                                </DialogFooter>
                            </Dialog.Content>
                        </Dialog.Positioner>
                    </Portal>
                </Dialog.Root>
            )}
        </>
    );
}