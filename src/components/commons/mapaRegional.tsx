import { Box, Heading, HStack, IconButton, Image, Skeleton, } from "@chakra-ui/react";
import { useState } from "react";
import CustomTooltip from "./customTooltip";
import { FaArrowLeft, FaBook, FaGamepad, FaPencilAlt, FaPlayCircle, } from "react-icons/fa";
import { obterNomeTematicaRota } from "@/types_consts/tematica";

import mapaLegislacao from "@/assets/images/Mapas/legislacao.png";
import mapaTransferenciaTecnologica from "@/assets/images/Mapas/transferenciaTecnologica.png";
import mapaPropriedadeIntelectual from "@/assets/images/Mapas/propriedadeIntelectual.png";
import mapaAmbientesInovacao from "@/assets/images/Mapas/ambientesInovacao.png";

import { MissaoAtividade, MissaoConteudo, ProgressoMissao, TipoAtividade } from "@/types_consts/missao";
import { posicoesDaTrilha } from "@/config/itensRegional";

type mapaRegionalProps = {
    tematica: string
    navigate: Function
    missoes: ProgressoMissao[]
}

export default function MapaRegional({ tematica, navigate, missoes }: mapaRegionalProps) {

    const [loadedMapa, setLoadedMapa] = useState(false)
    const tematicaLabel = obterNomeTematicaRota(tematica)

    const mapas: Record<string, string> = {
        legislacao: mapaLegislacao,
        transferenciaTecnologica: mapaTransferenciaTecnologica,
        propriedadeIntelectual: mapaPropriedadeIntelectual,
        ambientesInovacao: mapaAmbientesInovacao,
    };

    const missoesOrdenadas = montarOrdemTrilha(missoes)   

    return (
        <Box
            gridColumn={{ lg: "span 9" }}
            position="relative"
        >
            <Skeleton
                loading={!loadedMapa}
                rounded="xl"
                h="100%"
                minH="500px"
                maxH="590px"
                w="100%"
            >
                <Image
                    src={mapas[tematica]}
                    alt={`Mapa das trilha de  ${tematicaLabel}`}
                    objectFit="cover"
                    rounded="2xl"
                    overflow="hidden"
                    boxShadow="map"
                    loading="lazy"
                    h="100%"
                    minH="500px"
                    maxH="590px"
                    w="100%"
                    onLoad={() => setLoadedMapa(true)}
                />
                <HStack
                    position="absolute"
                    top="5"
                    left="5"
                    gap="2"
                    zIndex="2"
                    maxH="15"
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
                        px="4"
                        py="2"
                        borderWidth="1px"
                        borderColor="brand.primaryDark"
                        rounded="sm"
                        textStyle="headingSM"
                        textAlign="center"
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
}

function IconeMissao({
    missao,
    navigate,
    index,
    paramTrilha
}: IconeMissaoProps) {
    const concluido = missao.progresso === 100

    let tentativas = true
    if ("tentativasRealizadas" in missao) {
        tentativas = missao.tentativasRealizadas < 3
        tentativas = false
    }

    /*
     * A associação trilha -> posições virou uma única fonte em
     * config/itensRegional (era um switch aqui dentro), usada também
     * pelo cadastro para limitar quantas missões cabem na trilha.
     */
    const posicoes = posicoesDaTrilha(paramTrilha)
    const posicao = posicoes[index]

    /*
     * Mais missões do que posições no mapa: o índice excedente
     * devolvia undefined e a leitura de posicao.top derrubava a tela
     * inteira. Enquanto o limite do cadastro não estiver aplicado nos
     * dados já existentes, a missão sem posição deixa de ser
     * desenhada em vez de quebrar o mapa.
     */
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
            content={missao.missao.titulo}
        >
            <IconButton
                position="absolute"
                top={posicao.top}
                left={posicao.left}
                transform="translate(-50%, -50%)"
                onClick={() => navigate(rota)}

                aria-label={missao.missao.titulo}
                variant="solid"
                size="lg"
                color="brand.primaryLight"

                w="62px"
                h="62px"
                minW="62px"
                p="0"
                borderRadius="full"

                bg={concluido ? "brand.secondary" : "brand.primaryDark"}
                borderColor={concluido ? "brand.secondary" : "brand.primaryDark"}
                opacity="100%"
            >
                {distintivo}
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