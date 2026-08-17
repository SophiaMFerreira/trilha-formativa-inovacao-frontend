import { Button, Image, Skeleton, } from "@chakra-ui/react";
import { useState } from "react";
import CustomTooltip from "./customTooltip";
import { TematicaRota, tematicaRotaLabel } from "@/types_consts/tematica";

import mapaPrincipal from "@/assets/images/Mapas/trilhaFormativaInovacao.png";

import { MissaoTarefa, ProgressoMissao } from "@/types_consts/missao";
import { posicaoTarefaFinal, posicoesTematicas } from "@/config/itensRegional";

type mapaPrincipalProps = {
    navigate: Function
    progressos: ProgressoMissao[]
    progressoTotal: number
}

export default function MapaPrincipal({ navigate, progressos, progressoTotal }: mapaPrincipalProps) {

    const [loadedMapa, setLoadedMapa] = useState(false)
    const tematicas = Object.values(TematicaRota) as TematicaRota[]

    const progressosPorTematica = tematicas.reduce(
        (acc, tematica) => {
            acc[tematica] = 0;
            return acc;
        },
        {} as Record<string, number>
    );

    progressos.forEach(progresso => {
        const tematica = progresso.missao.tematica.titulo

        if (tematica in progressosPorTematica) {
            progressosPorTematica[tematica] += progresso.progresso;
        }
    });

    return (
        <Skeleton
            loading={!loadedMapa}
            rounded="xl"
            h="100%"
            minH="500px"
            maxH="590px"
            w="100%"
        >
            <Image
                src={mapaPrincipal}
                alt={`Mapa da trilha de Trilha Formativa para Inovação`}
                objectFit="cover"
                rounded="2xl"
                overflow="hidden"
                boxShadow="map"
                loading="lazy"
                h="100%"
                minH="500px"
                maxH="526px"
                w="100%"
                onLoad={() => setLoadedMapa(true)}
            />
            {tematicas.map((tematica, index) => (
                <IconeTrilha
                    key={tematica}
                    index={index}
                    tematica={tematica}
                    navigate={navigate}
                    progresso={progressosPorTematica[tematica]}
                    tarefaFinal={false}
                    progressoTotal={progressoTotal}
                />
            ))}
            <IconeTrilha
                    key={"tarefaFinal"}
                    navigate={navigate}
                    index={0}
                    progresso={7}
                    tarefaFinal={true}
                    progressoTotal={progressoTotal}
                />
        </Skeleton>
    )
}

type IconeTrilhaProps = {
    tarefaFinal: boolean
    progressoTotal: number
    tematica?: TematicaRota
    navigate: Function
    index: number
    progresso?: number
}

function IconeTrilha({
    tematica,
    navigate,
    index,
    progresso,
    tarefaFinal, 
    progressoTotal
}: IconeTrilhaProps) {
    const concluido = progresso === 100

    let posicao = tematica ? posicoesTematicas[index] : posicaoTarefaFinal

    const disabled = progressoTotal < 90 && tarefaFinal

    return (
        <CustomTooltip
            content={
                tematica
                    ? tematicaRotaLabel[tematica]
                    : "Tarefa final"
            }
        >
            <Button
                position="absolute"
                top={posicao.top}
                left={posicao.left}
                transform="translate(-50%, -50%)"

                onClick={() => {
                    if (tematica) {
                        navigate(
                            `/trilhaFormativaInovacao/${tematica}`
                        );
                    } else {
                        navigate("/trilhaFormativaInovacao/tarefaFinal");
                    }
                }}

                disabled={disabled}

                aria-label={
                    tematica
                        ? tematicaRotaLabel[tematica]
                        : "Tarefa final"
                }
                size="lg"

                w="52"
                h="52"
                minW="52"
                p="0"
                borderRadius="full"

                bg={
                    concluido
                        ? "brand.secondary"
                        : "transparent"
                }

                borderColor={
                    concluido
                        ? "brand.secondary"
                        : "transparent"
                }

                _disabled={{
                    bg: "gray.200"
                }}

                opacity="70%"
            />
        </CustomTooltip >
    )
}