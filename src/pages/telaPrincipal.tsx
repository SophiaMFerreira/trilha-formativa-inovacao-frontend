import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

import { Avatar, Box, HStack, Progress, SimpleGrid, Stack } from "@chakra-ui/react";
import CustomTooltip from "@/components/commons/customTooltip";
import { Ranking } from "@/components/ranking";
import { FaAward } from "react-icons/fa";

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
    const imagem = urlDaFotoDePerfil(usuario);

    useEffect(() => {
        if (!user) return;

        async function carregarDados() {
            try {
                const usuarioResponse = await UsuarioAPI.buscarPorId(Number(user?.id))
                const usuario = usuarioResponse.data as Usuario

                if (!usuario) return;

                setUsuario(usuario)
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
                        {distintivos.map((distintivo) => (
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
    );
}