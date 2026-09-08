import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useMemo, useState } from "react";

import { Box, Button, Dialog, Flex, Heading, HStack, Image, Portal, Progress, SimpleGrid, Skeleton, Stack, Text, } from "@chakra-ui/react";
import { FaAward } from "react-icons/fa";

import trilhaFormativa from "@/assets/images/Regional.jpg"

import { Missao, MissaoAtividade, MissaoConteudo, MissaoTarefa, ProgressoMissao, TipoAtividade } from "@/types_consts/missao";

import { MissaoAPI } from "../../api/missao";
import { useGame } from "@/hooks/useGame";
import { obterNomeTematicaBanco } from "@/types_consts/tematica";
import { Distintivo } from "@/types_consts/distintivo";
import MapaRegional from "@/components/commons/mapaRegional";
import { mensagensErroConsole } from "@/config/mensagensError";
import { toaster } from "@/components/commons/toaster";
import { mensagensToastErro } from "@/config/mensagensToaster";
import { limitarPercentual } from "@/utils/pontuacao";
import { mensagemDeErroDaApi } from "@/utils/erroApi";

import conectorSolucoes from "@/assets/images/distintivos/DistintivoConectorDeSolucoes.svg"
import doutorLegal from "@/assets/images/distintivos/DistintivoDoutorLegal.svg"
import impulsionadorPossibilidades from "@/assets/images/distintivos/DistintivoImpulsionadorDePossibilidades.svg"
import mestreCriatividade from "@/assets/images/distintivos/DistintivoMestreDaCriatividade.svg"
import trofeuFinal from "@/assets/images/distintivos/TrofeuFinal.svg"
import DistintivoImagem from "@/components/commons/distintivo";

export function TelaRegional() {
    const navigate = useNavigate();
    const { ParamTrilha } = useParams();
    const { user } = useAuth();
    const { progressoMissoes, progressoPontosTematicas, distintivos } = useGame()

    const trilha = obterNomeTematicaBanco(ParamTrilha!)

    /*
     * Só as missões da trilha vêm da API. Tudo o que depende de
     * progresso e distintivos é DERIVADO do GameProvider.
     *
     * A versão anterior calculava missoesTematica, missoesPendentes e
     * distintivosTrilha dentro do efeito, que dependia de
     * [ParamTrilha, distintivos] e lia progressoMissoes por closure
     * SEM declará-lo. Duas consequências:
     *
     *  - na primeira execução progressoMissoes ainda estava vazio, e o
     *    mapa e a lista de pendentes ficavam vazios sem nunca recalcular;
     *  - "distintivos" é um array novo a cada recarga do provider, e
     *    cada troca de identidade refazia o GET de todas as missões.
     */
    const [missoesTrilha, setMissoesTrilha] = useState<Missao[] | null>(null)
    const [missaoEscolhida, setMissaoEscolhida] = useState<Missao | null>(null);
    const [open, setOpen] = useState(false);
    const [loaded, setLoaded] = useState(false)

    const pontos = progressoPontosTematicas.get(trilha)?.pontuacao ?? 0
    const progresso = progressoPontosTematicas.get(trilha)?.progresso ?? 0

    const imagensDistintivos: Record<string, string> = {
        "Conector de Soluções": conectorSolucoes,
        "Doutor Legal": doutorLegal,
        "Impulsionador de Inovações": impulsionadorPossibilidades,
        "Mestre da Criatividade": mestreCriatividade,
        "Troféu Final": trofeuFinal,
    };


    useEffect(() => {
        let ativo = true;

        async function carregarMissoes() {
            try {
                const missoesResponse = await MissaoAPI.listar()

                if (!ativo) return;

                const listaMissoes = Array.isArray(missoesResponse.data)
                    ? missoesResponse.data as Missao[]
                    : null

                if (!listaMissoes) {
                    navigate(`/trilhaFormativaInovacao`);
                    return
                }

                const daTrilha = listaMissoes.filter(
                    m => m.tematica?.titulo === trilha
                )

                if (daTrilha.length === 0) {
                    toaster.create(mensagensToastErro.nenhumaMissao)
                    navigate("/trilhaFormativaInovacao")
                    return
                }

                setMissoesTrilha(daTrilha)
            } catch (erro) {
                if (!ativo) return;

                toaster.create(mensagensToastErro.carregarMissoes)
                console.error(
                    mensagensErroConsole.buscarMissoes,
                    mensagemDeErroDaApi(erro) ?? erro
                );
            }
        }

        carregarMissoes();

        return () => { ativo = false };
    }, [trilha, navigate]);

    /** Progressos das missões desta trilha, na ordem das missões. */
    const missoesTematica = useMemo<ProgressoMissao[]>(() => {
        if (!missoesTrilha) return [];

        const progressoPorMissao = new Map(
            progressoMissoes
                .filter(p => p?.missao?.id !== undefined)
                .map(p => [p.missao.id, p])
        );

        return missoesTrilha
            .map(missao => progressoPorMissao.get(missao.id))
            .filter((p): p is ProgressoMissao => p !== undefined);
    }, [missoesTrilha, progressoMissoes]);

    /** Missões da trilha ainda não iniciadas. */
    const pendentes = useMemo<Missao[]>(() => {
        if (!missoesTrilha) return [];

        const progressoPorMissao = new Map(
            progressoMissoes
                .filter(p => p?.missao?.id !== undefined)
                .map(p => [p.missao.id, p])
        );

        return missoesTrilha.filter(missao => {
            const progressoMissao = progressoPorMissao.get(missao.id);

            if (!progressoMissao) return false;

            return Number(progressoMissao.progresso) === 0;
        });
    }, [missoesTrilha, progressoMissoes]);

    const missoesPendentes = useMemo(() => pendentes.slice(0, 3), [pendentes]);

    /*
     * A missão em foco é a escolhida pelo usuário; sem escolha, a
     * primeira pendente; sem pendentes, a primeira da trilha.
     */
    const missaoSelecionada = missaoEscolhida
        ?? pendentes[0]
        ?? missoesTrilha?.[0]
        ?? null;

    /* Título e rota são função pura da missão em foco. */
    const { tituloMissao, rota } = useMemo(
        () => descreverMissao(missaoSelecionada, ParamTrilha),
        [missaoSelecionada, ParamTrilha]
    );

    const distintivosTrilha = useMemo<Distintivo[]>(() => {
        if (!missoesTrilha) return [];

        return missoesTrilha.flatMap(missao => {
            if (!("tipoAtividade" in missao)) return [];
            if (missao.tipoAtividade === TipoAtividade.QUIZ) return [];

            const tarefa = missao as MissaoTarefa

            const distintivo = distintivos.find(
                d => d.id === tarefa.distintivo?.id
            );

            return distintivo ? [distintivo] : [];
        });
    }, [missoesTrilha, distintivos]);

    if (!user) {
        return <Navigate to="/login" replace />
    }
    if (!ParamTrilha) return

    if (!missaoSelecionada) return
    return (
        <SimpleGrid
            columns={{
                base: 1,
                lg: 12,
            }}
            gap={10}
            h="full"
            maxH="calc(100vh - 88px)"
            py={10}
            px="40"
            alignItems="stretch"
        >
            <   MapaRegional
                tematica={ParamTrilha}
                navigate={navigate}
                missoes={missoesTematica}
            />
            <Stack
                gridColumn={{ lg: "span 3" }}
                gap="6"
                align="center"
                h="100%"
            >
                <Box
                    p="4"
                    bg="brand.primaryLight"
                    w="72"
                    rounded="xl"
                    shadow="card"
                >
                    <Heading
                        textStyle="headingSM"
                        color="brand.primaryDark"
                        textAlign="center"
                        mb="3"
                    >
                        Missões a fazer
                    </Heading>
                    {missoesPendentes.length === 0 ? (
                        <Flex
                            py="2.5"
                            px="3"
                            bg="brand.white"
                            rounded="lg"
                            justify="center"
                        >
                            <Text
                                color="brand.secondary"
                                textStyle="bodyTextBold"
                            >
                                Tudo concluído por aqui!
                            </Text>
                        </Flex>
                    ) : (
                        <Stack>
                            {missoesPendentes.map((missao) => (
                                <Box
                                    key={missao.id}
                                    onClick={() => {
                                        setMissaoEscolhida(missao);
                                        setOpen(true);
                                    }}
                                >
                                    <ItemMissao
                                        conteudo={missao}
                                    />
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Box>
                <Stack
                    gap="2"
                    w="100%"
                >
                    <Progress.Root
                        /*
                         * "value", não "defaultValue": como componente
                         * não controlado, a barra ficava presa no
                         * primeiro valor (zero, antes de os progressos
                         * chegarem) e nunca acompanhava a temática.
                         */
                        value={limitarPercentual(progresso)}
                        min={0}
                        max={100}
                        rounded="full"
                        w="100%"
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
                    <Heading
                        textStyle="headingMD"
                        color="brand.primaryDark"
                        textAlign="right"
                    >
                        {progresso.toFixed(2)}%
                    </Heading>
                </Stack>
                <HStack
                    justifyContent="space-between"
                    w="100%"
                    mt="-0.5"
                    pl="8"
                >
                    <Text
                        textStyle="emphasis"
                        color="brand.neutral"
                    >
                        Pontos:
                    </Text>
                    <Text
                        textStyle="headingMD"
                        color="brand.primaryDark"
                    >
                        {pontos.toFixed(2)}
                    </Text>
                </HStack>
                <HStack
                    gap={5}
                    w="100%"
                    justifyContent="center"
                >
                    {distintivosTrilha.map((distintivo) =>
                        <Box
                            key={distintivo.id}
                            color={
                                distintivo.adquirido
                                    ? "brand.primaryDark"
                                    : "gray.300"
                            }
                            onClick={() => navigate(`/distintivos`)}
                        >
                            <DistintivoImagem
                                imagem={
                                    imagensDistintivos[
                                    distintivo.titulo ?? ""
                                    ]}
                                titulo={distintivo.titulo}
                                adquirido={distintivo.adquirido}
                            />
                        </Box>
                    )}
                </HStack>
            </Stack>
            <Dialog.Root
                lazyMount
                open={open}
                onOpenChange={(e) => setOpen(e.open)}
                placement="center"
                size="lg"
            >
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content p="4">
                            <Dialog.Body
                                justifyContent="center"
                            >
                                <Stack
                                    gap="6"
                                    justifyContent="center"
                                    align="center"
                                    mt="5"
                                    w="100%"
                                >
                                    <Stack
                                        gap="2"
                                        w="100%"
                                        justifyContent="center"
                                    >
                                        <HStack
                                            justifyContent="space-between"
                                        >
                                            <Heading
                                                textStyle="headingMD"
                                                color="brand.primaryDark"
                                            >
                                                {tituloMissao}
                                            </Heading>
                                            <Text
                                                textStyle="headingSM"
                                                color="brand.neutral"
                                                textAlign="right"
                                            >
                                                +{missaoSelecionada.pontuacao} pontos
                                            </Text>
                                        </HStack>
                                    </Stack>
                                    <Flex justify="center" w="100%">
                                        <Skeleton
                                            loading={!loaded}
                                            rounded="md"
                                        >
                                            <Image
                                                src={trilhaFormativa}
                                                alt={`Missão ${missaoSelecionada.titulo}`}
                                                h="40"
                                                w="96"
                                                objectFit="cover"
                                                rounded="md"
                                                onLoad={() => setLoaded(true)}
                                            />
                                        </Skeleton>
                                    </Flex>
                                </Stack>
                            </Dialog.Body>
                            <Dialog.Footer justifyContent="center">
                                <Stack
                                    direction={{ base: "column", md: "row" }}
                                    w="100%"
                                    gap="2"
                                >
                                    <Button
                                        flex={1}
                                        w="100%"
                                        variant="outline"
                                        onClick={() => setOpen(false)}
                                    >
                                        Voltar
                                    </Button>
                                    <Button
                                        flex={1}
                                        w="100%"
                                        variant="solid"
                                        onClick={() => {
                                            setOpen(false);
                                            requestAnimationFrame(() => {
                                                navigate(rota);
                                            });
                                        }}
                                    >
                                        Vamos lá!
                                    </Button>
                                </Stack>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger asChild>
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </SimpleGrid >
    );
}

type ItemMissaoProps = {
    conteudo: Missao
};
function ItemMissao({
    conteudo,
}: ItemMissaoProps) {
    return (
        <Flex
            py="2.5"
            px="3"
            w="100%"
            bg="brand.white"
            rounded="lg"
            justify="space-between"
            align="center"
            gap="2"
        >
            <HStack
                color="brand.neutral"
                justify="space-between"
                w="100%"
            >
                <Text
                    flex="1"
                    lineClamp={2}
                    textOverflow="ellipsis"
                    wordBreak="break-word"
                    textStyle="bodyText"
                >
                    {conteudo.titulo}
                </Text>
                <Text
                    w="10"
                    textStyle="bodyTextBold"
                    textAlign="end"
                >
                    {`+${String(conteudo.pontuacao)}`}
                </Text>
            </HStack>
        </Flex>
    );
}

type DescricaoMissao = {
    tituloMissao: "Leitura" | "Vídeo" | "Quiz" | "Tarefa" | "Tarefa Final"
    rota: string
}

/**
 * Título e rota da missão em foco.
 *
 * Era um par de setState disparado por um useEffect sobre
 * missaoSelecionada, além de uma chamada direta dentro do efeito de
 * carregamento — dois caminhos escrevendo o mesmo estado, com uma
 * renderização extra a cada troca de missão. Como o resultado depende
 * apenas da missão, virou função pura.
 */
function descreverMissao(
    missao: Missao | null,
    paramTrilha: string | undefined
): DescricaoMissao {
    if (!missao) {
        return { tituloMissao: "Leitura", rota: "" };
    }

    const base = `/trilhaFormativaInovacao/${paramTrilha}`;

    if ("tipoMaterial" in missao) {
        const conteudo = missao as MissaoConteudo;

        return {
            tituloMissao: conteudo.tipoMaterial === "texto" ? "Leitura" : "Vídeo",
            rota: `${base}/material/${conteudo.id}`,
        };
    }

    const atividade = missao as MissaoAtividade;

    if (atividade.tipoAtividade === TipoAtividade.TAREFA) {
        return {
            tituloMissao: "Tarefa",
            rota: `${base}/tarefa/${atividade.id}`,
        };
    }

    return {
        tituloMissao: "Quiz",
        rota: `${base}/quiz/${atividade.id}`,
    };
}
