import { Button, Image, Skeleton, } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import CustomTooltip from "./customTooltip";
import { obterNomeTematica, obterRotaTematica, TematicaDTO, TematicaRota, tematicaRotaLabel } from "@/types_consts/tematica";

import mapaPrincipal from "@/assets/images/Mapas/trilhaFormativaInovacao.png";

import { ProgressoPontosTematicaMap } from "@/types_consts/missao";
import { posicaoTarefaFinal, posicoesTematicas } from "@/config/itensRegional";
import { TematicaAPI } from "../../../api/tematica";
import { toaster } from "./toaster";
import { mensagensToastErro } from "@/config/mensagensToaster";
import { mensagensErroConsole } from "@/config/mensagensError";

type mapaPrincipalProps = {
    navigate: Function
    progressoPontosTematicas: ProgressoPontosTematicaMap
    progressoTotal: number
}

export default function MapaPrincipal({ navigate, progressoPontosTematicas, progressoTotal }: mapaPrincipalProps) {
    const [loadedMapa, setLoadedMapa] = useState(false)
    const [tematicas, setTematicas] = useState<TematicaDTO[]>([])

    useEffect(() => {
        async function carregarDados() {
            try {
                const tematicaResponse = await TematicaAPI.listar()

                if (!tematicaResponse.data) {
                    toaster.create(mensagensToastErro.carregarTematicas)
                    return
                }

                const tematicas = tematicaResponse.data as TematicaDTO[]
                setTematicas(tematicas)
            } catch (erro) {
                console.error(mensagensErroConsole.buscarTematica, erro);
                navigate("/");
            }
        }
        carregarDados();
    }, []);

    Object.values(TematicaRota) as TematicaRota[]

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
                    key={tematica.id}
                    index={index}
                    tematica={tematica.titulo}
                    navigate={navigate}
                    progresso={progressoPontosTematicas.get(tematica.titulo)?.progresso}
                    tarefaFinal={tematica.titulo === "tarefa final"}
                    progressoTotal={progressoTotal}
                />
            ))}
        </Skeleton>
    )
}

type IconeTrilhaProps = {
    tarefaFinal: boolean
    progressoTotal: number
    tematica: string
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
    let posicao = !tarefaFinal ? posicoesTematicas[index] : posicaoTarefaFinal
    const disabled = progressoTotal < 90 && tarefaFinal

    return (
        <CustomTooltip
            content={obterNomeTematica(tematica) || tematica}
        >
            <Button
                position="absolute"
                top={posicao.top}
                left={posicao.left}
                transform="translate(-50%, -50%)"

                onClick={() => { navigate(`/trilhaFormativaInovacao/${obterRotaTematica(tematica)}`)}}

                disabled={disabled}
                aria-label={obterNomeTematica(tematica) || tematica}
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