import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

import { Box, Button, Dialog, Flex, Heading, HStack, IconButton, Image, Portal, Progress, SimpleGrid, Skeleton, Stack, Text, } from "@chakra-ui/react";
import CustomTooltip from "@/components/commons/customTooltip";
import { FaArrowLeft, FaAward } from "react-icons/fa";

import trilhaFormativa from "@/assets/images/Regional.jpg"

import { Missao, MissaoAtividade, MissaoConteudo, MissaoTarefa, ProgressoMissao, ProgressoMissaoAtividade, TipoAtividade } from "@/types_consts/missao";

import { MissaoAPI } from "../../api/missao";
import { useGame } from "@/hooks/useGame";
import { obterNomeTematicaBanco } from "@/types_consts/tematica";
import { Distintivo } from "@/types_consts/distintivo";
import MapaRegional from "@/components/commons/mapaRegional";


export function TelaRegional() {
    const navigate = useNavigate();
    const { ParamTrilha } = useParams();
    const { user } = useAuth();
    const { progressoMissoes, distintivos } = useGame()

    const trilha = obterNomeTematicaBanco(ParamTrilha!)
    const [progresso, setProgresso] = useState(0)
    const [distintivosTrilha, setDistintivosTrilha] = useState<Distintivo[]>([])
    const [pontos, setPontos] = useState(0)
    const [progressoMissao, setProgressoMissao] = useState<ProgressoMissao[]>([])
    const [missoesTematica, setMissoesTematica] = useState<ProgressoMissao[]>([])
    const [missoesPendentes, setMissoesPendentes] = useState<Missao[]>([])
    const [missaoSelecionada, setMissaoSelecionada] = useState<Missao | null>(null);
    const [tituloMissao, setTituloMissao] = useState<"Leitura" | "Vídeo" | "Quiz" | "Tarefa" | "Tarefa Final">("Leitura");
    const [rota, setRota] = useState<string>("");

    const [loaded, setLoaded] = useState(false)
    const [loadedMapa, setLoadedMapa] = useState(false)
    const [open, setOpen] = useState(false);

    function calcularTituloMissaoSelecionada(missao: Missao) {
        if (!missao) return

        if ("tipoMaterial" in missao) {
            const missaoMaterial = missao as MissaoConteudo
            setTituloMissao(
                missaoMaterial.tipoMaterial === "texto"
                    ? "Leitura"
                    : "Vídeo")

            setRota(`/trilhaFormativaInovacao/${ParamTrilha}/material/${missaoMaterial.id}`)

        } else {
            const missaoAtividade = missao as MissaoAtividade

            if (missaoAtividade.tipoAtividade === TipoAtividade.QUIZ) {
                setTituloMissao("Quiz")
                setRota(`/trilhaFormativaInovacao/${ParamTrilha}/quiz/${missaoAtividade.id}`)
            }

            if (missaoAtividade.tipoAtividade === TipoAtividade.TAREFA) {
                setTituloMissao("Tarefa")
                setRota(`/trilhaFormativaInovacao/${ParamTrilha}/tarefa/${missaoAtividade.id}`)
            }
        }
    }
    useEffect(() => {
        if (missaoSelecionada) {
            calcularTituloMissaoSelecionada(missaoSelecionada)
        }
    }, [missaoSelecionada]);

    useEffect(() => {
        async function carregarDados() {
            try {
                const missoesResponse = await MissaoAPI.listar()
                const listaMissoes = missoesResponse.data as Missao[]

                if (!listaMissoes) return; //MENSAGEM ERRO
                const missoesTrilha = listaMissoes.filter(m => m.tematica.titulo === trilha)

                if (missoesTrilha.length === 0) {
                    //MENSAGEM ERRO
                    navigate("/trilhaFormativaInovacao")
                }

                const missoesT = progressoMissoes.filter(p => 
                    missoesTrilha.find(
                        m => p.missao.id === m.id
                ))
                setMissoesTematica(missoesT)

                const pendentes = missoesTrilha.filter(m => {
                    const progressoM = progressoMissoes.find(
                        p => p.missao.id === m.id
                    );

                    if (!progressoM) return false;
                    return progressoM?.progresso === 0;
                });

                setMissoesPendentes([...pendentes])
                setMissaoSelecionada(pendentes[0])
                calcularTituloMissaoSelecionada(pendentes[0])

                if (pendentes.length === 0) {
                    setMissaoSelecionada(missoesTrilha[0])
                    calcularTituloMissaoSelecionada(missoesTrilha[0])
                }

                const progressoMissaoTrilha = progressoMissoes.filter(
                    p => p.missao.tematica.titulo === trilha
                );
                setProgressoMissao(progressoMissaoTrilha);

                let pontos = 0
                let progressoTot = 0
                let p = 0
                for (const progresso of progressoMissaoTrilha) {
                    if ("tipoMaterial" in progresso.missao) {
                        p = (Number(progresso.progresso) || 0) ?
                            Number(progresso.missao.pontuacao) : 0
                    } else {
                        let atividade = progresso as ProgressoMissaoAtividade
                        p = Number(atividade.pontuacaoObtida) || 0
                    }

                    pontos += p
                    progressoTot += progresso.progresso
                }
                setPontos(pontos)
                setProgresso(progressoTot / missoesTrilha.length)

                const distintivosTrilha = missoesTrilha.flatMap(missao => {
                    if (!("tipoAtividade" in missao)) return [];

                    if (missao.tipoAtividade === TipoAtividade.QUIZ) return [];
                    const tarefa = missao as MissaoTarefa

                    const distintivo = distintivos.find(
                        d => d.id === tarefa.distintivo.id
                    );

                    return distintivo ? [distintivo] : [];
                });

                setDistintivosTrilha(distintivosTrilha);


            } catch (erro) {
                console.error(erro);
                //MENSAGEM DE ERRO
            }
        }
        carregarDados();


    }, [ParamTrilha, distintivos]);

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
                                        setMissaoSelecionada(missao);
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
                        defaultValue={Math.round(progresso)}
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
                            <FaAward size={60} />
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