import { Box, Heading, HStack, IconButton, Image, Skeleton, } from "@chakra-ui/react";
import { useState } from "react";
import CustomTooltip from "./customTooltip";
import { FaArrowLeft, FaBook, FaGamepad, FaLock, FaPencilAlt, FaPlayCircle, } from "react-icons/fa";
import { obterNomeTematicaRota } from "@/types_consts/tematica";

import mapaLegislacao from "@/assets/images/Mapas/legislacao.png";
import mapaTransferenciaTecnologica from "@/assets/images/Mapas/transferenciaTecnologica.png";
import mapaPropriedadeIntelectual from "@/assets/images/Mapas/propriedadeIntelectual.png";
import mapaAmbientesInovacao from "@/assets/images/Mapas/ambientesInovacao.png";

import { MissaoAtividade, MissaoConteudo, ProgressoMissao, TipoAtividade } from "@/types_consts/missao";
import { posicoesDaTrilha, proporcaoDaTrilha } from "@/config/itensRegional";

type mapaRegionalProps = {
    tematica: string
    navigate: Function
    missoes: ProgressoMissao[]
    /** A tarefa da trilha ainda depende de conteúdos ou quizzes. */
    tarefaBloqueada: boolean
    /** Chamado quando o aventureiro clica na tarefa bloqueada. */
    onTarefaBloqueada: () => void
}

export default function MapaRegional({
    tematica,
    navigate,
    missoes,
    tarefaBloqueada,
    onTarefaBloqueada,
}: mapaRegionalProps) {

    const [loadedMapa, setLoadedMapa] = useState(false)
    const tematicaLabel = obterNomeTematicaRota(tematica)

    const mapas: Record<string, string> = {
        legislacao: mapaLegislacao,
        transferenciaTecnologica: mapaTransferenciaTecnologica,
        propriedadeIntelectual: mapaPropriedadeIntelectual,
        ambientesInovacao: mapaAmbientesInovacao,
    };

    const missoesOrdenadas = montarOrdemTrilha(missoes)
    const proporcao = proporcaoDaTrilha(tematica)

    return (
        <Box
            gridColumn={{ lg: "span 9" }}
            position="relative"
            w="100%"
            alignSelf="start"
        >
            <Skeleton
                loading={!loadedMapa}
                rounded="xl"
                w="100%"
                maxW={`${Math.round(590 * proporcao)}px`}
                mx="auto"
                aspectRatio={proporcao}
                position="relative"
            >
                <Image
                    src={mapas[tematica]}
                    alt={`Mapa da trilha de ${tematicaLabel}`}
                    objectFit="fill"
                    rounded="2xl"
                    overflow="hidden"
                    boxShadow="map"
                    loading="lazy"
                    h="100%"
                    w="100%"
                    onLoad={() => setLoadedMapa(true)}
                />
                <HStack
                    position="absolute"
                    top={{ base: "2", md: "5" }}
                    left={{ base: "2", md: "5" }}
                    gap="2"
                    zIndex="2"
                    maxW="calc(100% - 16px)"
                >
                    <CustomTooltip
                        content="Voltar para o mapa geral"
                    >
                        <IconButton
                            zIndex="2"
                            aria-label="Voltar para o mapa geral"
                            variant="outline"
                            size="md"
                            color="brand.primaryDark"
                            p="3"
                            h="100%"
                            onClick={() => navigate("/trilhaFormativaInovacao")}
                            borderColor="brand.primaryDark"
                            borderWidth="2"
                        >
                            <FaArrowLeft />
                        </IconButton>
                    </CustomTooltip>
                    <Heading
                        bg="brand.primaryLight"
                        color="brand.primaryDark"
                        px={{ base: "2", md: "4" }}
                        py={{ base: "1", md: "2" }}
                        borderWidth="1px"
                        borderColor="brand.primaryDark"
                        rounded="sm"
                        textStyle={{ base: "bodyTextBold", md: "headingSM" }}
                        textAlign="center"
                        lineClamp={1}
                        pointerEvents="none"
                    >
                        {tematicaLabel}
                    </Heading>
                </HStack>
                {missoesOrdenadas.map((missao, index) => (
                    <IconeMissao
                        key={missao.missao.id}
                        index={index}
                        missao={missao}
                        paramTrilha={tematica}
                        navigate={navigate}
                        bloqueada={
                            tarefaBloqueada
                            && "tipoAtividade" in missao.missao
                            && missao.missao.tipoAtividade === TipoAtividade.TAREFA
                        }
                        onBloqueada={onTarefaBloqueada}
                    />
                ))}
            </Skeleton>
        </Box>
    )
}
type IconeMissaoProps = {
    missao: ProgressoMissao
    navigate: Function
    index: number
    paramTrilha: string
    bloqueada: boolean
    onBloqueada: () => void
}

function IconeMissao({
    missao,
    navigate,
    index,
    paramTrilha,
    bloqueada,
    onBloqueada,
}: IconeMissaoProps) {
    const concluido = missao.progresso === 100
    const posicoes = posicoesDaTrilha(paramTrilha)
    const posicao = posicoes[index]
    if (!posicao) return null

    let rota = `/trilhaFormativaInovacao/${paramTrilha}/material/${missao.missao.id}`
    let distintivo = <FaBook size={20} />

    if (!missao) return

    if ("tipoMaterial" in missao.missao) {
        rota = `/trilhaFormativaInovacao/${paramTrilha}/material/${missao.missao.id}`

        const missaoMaterial = missao.missao as MissaoConteudo
        distintivo = missaoMaterial.tipoMaterial === "texto" ?
            <FaBook size={16} /> : <FaPlayCircle size={20} />
    } else {
        const missaoAtividade = missao.missao as MissaoAtividade

        if (missaoAtividade.tipoAtividade === TipoAtividade.QUIZ) {
            rota = `/trilhaFormativaInovacao/${paramTrilha}/quiz/${missao.missao.id}`
            distintivo = <FaGamepad size={20} />
        }

        if (missaoAtividade.tipoAtividade === TipoAtividade.TAREFA) {
            rota = `/trilhaFormativaInovacao/${paramTrilha}/tarefa/${missao.missao.id}`
            distintivo = <FaPencilAlt size={20} />
        }
    }
    return (
        <CustomTooltip
            content={
                bloqueada
                    ? `${missao.missao.titulo} — conclua os conteúdos e quizzes da trilha para liberar`
                    : missao.missao.titulo
            }
        >
            <IconButton
                position="absolute"
                top={posicao.top}
                left={posicao.left}
                transform="translate(-50%, -50%)"
                onClick={() => bloqueada ? onBloqueada() : navigate(rota)}

                aria-label={
                    bloqueada
                        ? `${missao.missao.titulo} (bloqueada)`
                        : missao.missao.titulo
                }
                variant="solid"
                size="lg"
                color="brand.primaryLight"

                w={{ base: "11%", md: "9%", xl: "7.5%" }}
                h="auto"
                minW="unset"
                aspectRatio={1}
                p="0"
                borderRadius="full"

                bg={
                    bloqueada
                        ? "gray.400"
                        : concluido ? "brand.secondary" : "brand.primaryDark"
                }
                borderColor={
                    bloqueada
                        ? "gray.400"
                        : concluido ? "brand.secondary" : "brand.primaryDark"
                }
                opacity="100%"
            >
                {bloqueada ? <FaLock size={20} /> : distintivo}
            </IconButton>
        </CustomTooltip >
    )
}

const montarOrdemTrilha = (
        missoes: ProgressoMissao[]
    ): ProgressoMissao[] => {

        const conteudos: ProgressoMissao[] = [];
        const quizzes: ProgressoMissao[] = [];
        const tarefas: ProgressoMissao[] = [];

        for (const progresso of missoes) {
            const missao = progresso.missao;
            if ("tipoMaterial" in missao) {
                conteudos.push(progresso);
                continue;
            }
            if (missao.tipoAtividade === TipoAtividade.QUIZ) {
                quizzes.push(progresso);
                continue;
            }
            if (missao.tipoAtividade === TipoAtividade.TAREFA) {
                tarefas.push(progresso);
            }
        }

        const trilha: ProgressoMissao[] = [];
        if (quizzes.length === 0) {
            return [...conteudos, ...tarefas];
        }

        const quantidadePorBloco = Math.ceil(
            conteudos.length / (quizzes.length + 1)
        );
        let indiceConteudo = 0;

        for (const quiz of quizzes) {
            for (
                let i = 0;
                i < quantidadePorBloco && indiceConteudo < conteudos.length;
                i++
            ) {
                trilha.push(conteudos[indiceConteudo]);
                indiceConteudo++;
            }

            trilha.push(quiz);
        }

        while (indiceConteudo < conteudos.length) {
            trilha.push(conteudos[indiceConteudo]);
            indiceConteudo++;
        }

        trilha.push(...tarefas);
        return trilha;
    };