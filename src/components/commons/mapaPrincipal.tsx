import { Button, Image, Skeleton, } from "@chakra-ui/react";
import { useState } from "react";
import CustomTooltip from "./customTooltip";
import { obterNomeTematica, obterRotaTematica, Tematica, TematicaRota } from "@/types_consts/tematica";

import mapaPrincipal from "@/assets/images/Mapas/trilhaFormativaInovacao.png";

import { ProgressoPontosTematicaMap } from "@/types_consts/missao";
import { posicaoDaTematica, posicaoTarefaFinal, proporcaoMapaPrincipal } from "@/config/itensRegional";
import { PROGRESSO_MINIMO_TAREFA_FINAL } from "@/utils/bloqueioTarefa";
import { useGame } from "@/hooks/useGame";

type mapaPrincipalProps = {
    navigate: Function
    progressoPontosTematicas: ProgressoPontosTematicaMap
    progressoTotal: number
}

export default function MapaPrincipal({ navigate, progressoPontosTematicas, progressoTotal }: mapaPrincipalProps) {
    const [loadedMapa, setLoadedMapa] = useState(false)

    /*
     * As temáticas vêm do GameProvider, que já as carregou para calcular
     * o progresso. Buscá-las de novo aqui repetia a requisição e criava
     * duas listas que podiam divergir, e o progresso de cada ícone é
     * procurado justamente pelo título de uma na outra.
     */
    const { tematicas } = useGame()

    return (
        <Skeleton
            loading={!loadedMapa}
            rounded="xl"
            w="100%"
            maxW={`${Math.round(526 * proporcaoMapaPrincipal)}px`}
            mx="auto"
            aspectRatio={proporcaoMapaPrincipal}
            position="relative"
        >
            <Image
                src={mapaPrincipal}
                alt="Mapa da Trilha Formativa para Inovação"
                objectFit="fill"
                rounded="2xl"
                overflow="hidden"
                boxShadow="map"
                loading="lazy"
                h="100%"
                w="100%"
                onLoad={() => setLoadedMapa(true)}
            />
            {tematicas.map((tematica) => {
                const tarefaFinal = tematica.titulo === Tematica.TAREFA_FINAL;

                return (
                    <IconeTrilha
                        key={tematica.id}
                        tematica={tematica.titulo}
                        navigate={navigate}
                        progresso={
                            progressoPontosTematicas
                                .get(tematica.titulo)
                                ?.progresso
                        }
                        tarefaFinal={tarefaFinal}
                        progressoTotal={progressoTotal}
                    />
                );
            })}
        </Skeleton>
    )
}

type IconeTrilhaProps = {
    tarefaFinal: boolean
    progressoTotal: number
    tematica: string
    navigate: Function
    progresso?: number
}

function IconeTrilha({
    tematica,
    navigate,
    progresso,
    tarefaFinal,
    progressoTotal
}: IconeTrilhaProps) {

    const concluido = progresso === 100

    /* Cada temática tem seu laço; nada depende da ordem da API. */
    const posicao = tarefaFinal
        ? posicaoTarefaFinal
        : posicaoDaTematica(tematica);

    if (!posicao) {
        return null;
    }
    const disabled = progressoTotal < PROGRESSO_MINIMO_TAREFA_FINAL && tarefaFinal

    return (
        <CustomTooltip
            content={obterNomeTematica(tematica) || tematica}
        >
            <Button
                position="absolute"
                top={posicao.top}
                left={posicao.left}
                transform="translate(-50%, -50%)"

                onClick={() => { navigate(`/trilhaFormativaInovacao/${obterRotaTematica(tematica) || "tarefaFinal"}`) }}

                disabled={disabled}
                aria-label={obterNomeTematica(tematica) || tematica}
                size="lg"

                w={{ base: "26%", md: "24%" }}
                h="auto"
                minW="unset"
                aspectRatio={1}
                p="0"
                borderRadius="full"

                bg={
                    concluido
                        ? "brand.secondary"
                        : "transparent"
                }

                borderColor="transparent"

                _disabled={{
                    bg: "gray.200"
                }}

                opacity="70%"
            />
        </CustomTooltip >
    )
}