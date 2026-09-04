import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { Box, Button, Heading, HStack, Link, Stack, Text } from "@chakra-ui/react";
import CardCustomizado from "@/components/commons/cardCustomizado";
import { FaExternalLinkAlt } from "react-icons/fa";
import { MissaoConteudo } from "@/types_consts/missao";
import { MissaoAPI } from "../../api/missao";
import { useAuth } from "@/hooks/useAuth";
import { useGame } from "@/hooks/useGame";
import { concluirMissao, ConcluirMissaoProps } from "@/utils/concluirMissao";
import { toaster } from "@/components/commons/toaster";
import { mensagensToastErro } from "@/config/mensagensToaster";
import { mensagensErroConsole } from "@/config/mensagensError";

export default function Material() {
    const navigate = useNavigate()

    const { user } = useAuth()
    const { progressoMissoes, atualizarProgresso } = useGame()
    const { ParamTrilha, idMissao } = useParams()

    const [idMaterial, setIdMaterial] = useState<number>(-1)
    const [titulo, setTitulo] = useState<string>("")
    const [resumo, setResumo] = useState<string>("")
    const [url, setUrl] = useState<string>("")
    const [tipoMaterial, setTipoMaterial] = useState<"texto" | "video">("texto")
    const [pontuacao, setPontuacao] = useState<number>(0)

    const [clicouLink, setClicouLink] = useState<boolean>(false)
    const [concluido, setCloncluido] = useState<boolean>(false)

    async function concluirMaterial() {
        if (!clicouLink) {
            toaster.create(mensagensToastErro.conteudoNaoConsumido)
            return
        }

        try {
            const conclusaoProps = {
                user,
                valorMissao: pontuacao,
                idMissao: idMaterial,
                tipoMaterial: "conteudo"
            } as ConcluirMissaoProps;

            const retornoConclusao = await concluirMissao(conclusaoProps);

            if (retornoConclusao.progresso !== 100) {
                return;
            }

            atualizarProgresso()

            navigate(`/trilhaFormativaInovacao/${ParamTrilha}`);
        } catch (e) {
            toaster.create(mensagensToastErro.falhaAoConsumirConteudo)
            console.error(mensagensErroConsole.salvarConsumoConteudo, e);
        }
    }

    useEffect(() => {
        async function carregarDados() {
            try {
                if (!ParamTrilha) return
                if (!idMissao) return

                const progressoMissao = progressoMissoes.find(progresso =>
                    progresso.missao.id === Number(idMissao))

                if (progressoMissao?.progresso === 100) {
                    setCloncluido(true)
                }

                const missaoResponse = await MissaoAPI.buscarPorId(Number(idMissao))
                if (!missaoResponse.data) return
                if (!("tipoMaterial" in missaoResponse.data)) {
                    console.error(mensagensErroConsole.tipoMissaoInvalido);
                    navigate(`/trilhaFormativaInovacao/${ParamTrilha}`);
                    return
                }

                const material = missaoResponse.data as MissaoConteudo

                setIdMaterial(material.id)
                setTitulo(material.titulo)
                setResumo(material.resumo)
                setUrl(material.url)
                setTipoMaterial(material.tipoMaterial)
                setPontuacao(material.pontuacao)

            } catch (erro) {
                toaster.create(mensagensToastErro.carregarConteudo)
                console.error(mensagensErroConsole.buscarMissaoConteudo, erro);
            }
        }

        carregarDados()
    }, [ParamTrilha, idMissao])

    if (!user) {
        return <Navigate to="/login" replace />
    }
    if (!ParamTrilha) return
    if (!idMissao) return

    return (
        < Box
            h="calc(100vh - 88px)"
            display="flex"
            justifyContent="center"
            alignItems="center"
            px="6"
        >
            <Stack
                w="100%"
                maxW="5xl"
                gap="6"
                alignItems="center"
            >
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
                    >
                        <Heading
                            as="h1"
                            textStyle="headingXL"
                            color="brand.primaryDark"
                            textAlign="center"
                        >
                            {titulo}
                        </Heading>
                        <Stack gap="1">
                            <Heading
                                as="h2"
                                textStyle="headingSM"
                                color="brand.primaryDark"
                            >
                                Resumo
                            </Heading>
                            <Text>{resumo}</Text>
                        </Stack>
                        <Stack gap="1" w="100%">
                            <Heading
                                as="h2"
                                textStyle="headingSM"
                                color="brand.primaryDark"
                            >
                                Referência
                            </Heading>
                            <Link
                                href={url}
                                target="_blank"
                                variant="plain"
                                display="flex"
                                alignItems="center"
                                gap="2"
                                onClick={() => setClicouLink(true)}
                            >
                                {url}
                                <FaExternalLinkAlt />
                            </Link>
                        </Stack>
                        <Link
                            href={url}
                            target="_blank"
                            variant="plain"
                            w="100%"
                        >
                            <Button
                                variant="solid"
                                w="100%"
                                onClick={() => setClicouLink(true)}
                            >
                                {tipoMaterial === "texto" ? "Iniciar leitura" : "Iniciar vídeo"}
                            </Button>
                        </Link>
                    </Stack>
                </CardCustomizado>
                <HStack
                    gap="6"
                    w="100%"
                    maxW="3xl"
                >
                    <Button
                        flex={1}
                        w="100%"
                        variant="outline"
                        onClick={() => navigate(`/trilhaFormativaInovacao/${ParamTrilha}`)}
                    >
                        Voltar
                    </Button>
                    <Button
                        flex={1}
                        w="100%"
                        variant="solid"
                        type="submit"
                        onClick={() => concluirMaterial()}
                    >
                        {tipoMaterial === "texto" ? "Concluir leitura" : "Concluir vídeo"}
                    </Button>
                </HStack>
            </Stack>
        </Box>
    )
}