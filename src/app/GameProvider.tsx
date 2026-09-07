import { ReactNode, useCallback, useEffect, useState } from "react";

import { Distintivo, DistintivoAdquirido } from "@/types_consts/distintivo";
import { useAuth } from "@/hooks/useAuth";
import { Missao, ProgressoMissao, ProgressoMissaoDTO, ProgressoPontosTematicaMap } from "@/types_consts/missao";
import { DistintivoAPI } from "../../api/distintivos";
import { DistintivoAdquiridoAPI } from "../../api/distintivoAdquirido";
import { ProgressoMissaoAPI } from "../../api/progressoMissao";
import { GameContext } from "@/contexts/GameContext";
import { MissaoAPI } from "../../api/missao";
import { TematicaDTO } from "@/types_consts/tematica";
import { TematicaAPI } from "../../api/tematica";

export function GameProvider({
    children,
}: {
    children: ReactNode;
}) {
    const { user } = useAuth();
    const [carregando, setCarregando] = useState(true);

    const [pontuacao, setPontuacao] = useState<number>(0);
    const [progressoTotal, setProgressoTotal] = useState<number>(0);
    const [distintivos, setDistintivos] =
        useState<Distintivo[]>([]);

    const [progressoMissoes, setProgressoMissoes] =
        useState<ProgressoMissao[]>([])
    const [progressoPontosTematicas, setProgressoPontosTematicas] =
        useState<ProgressoPontosTematicaMap>(new Map())

    const atualizarDistintivos = useCallback(async () => {
        if (!user) return;

        const [
            distintivosResponse,
            distintivosAdquiridosResponse,
        ] = await Promise.all([
            DistintivoAPI.listar(),
            DistintivoAdquiridoAPI.listarPorUsuario(user.id),
        ]);

        const listaDistintivos = distintivosResponse.data as Distintivo[]
        const listaDistintivosAdquiridos = distintivosAdquiridosResponse.data as DistintivoAdquirido[]

        const adquiridos = new Set(
            listaDistintivosAdquiridos.map(
                da => da.distintivo.id
            )
        );
        const distintivos: Distintivo[] = listaDistintivos.map(distintivo => ({
            ...distintivo,
            adquirido: adquiridos.has(distintivo.id)
        }));

        setDistintivos(distintivos)
    }, [user?.id]);

    const [tematicas, setTematicas] = useState<TematicaDTO[]>([]);
    const carregarTematicas = useCallback(async () => {
        if (tematicas.length > 0) return;

        const response = await TematicaAPI.listar();

        if (response.data) {
            setTematicas(response.data as TematicaDTO[]);
        }
    }, [tematicas.length]);

    const atualizarProgresso = useCallback(async () => {
        if (!user?.id) return;

        const response = await ProgressoMissaoAPI.listarPorUsuario(user.id);
        if (!response.data) return;

        const progressos = response.data as ProgressoMissao[];

        const mapa: ProgressoPontosTematicaMap = new Map(
            tematicas.map(({ titulo }) => [
                titulo,
                {
                    progresso: 0,
                    pontuacao: 0,
                },
            ])
        );

        const quantidadeMissoesPorTematica = new Map<string, number>();

        for (const progresso of progressos) {
            const titulo = progresso.missao.tematica.titulo;
            const tematica = mapa.get(titulo);

            if (!tematica) continue;

            const quantidade = quantidadeMissoesPorTematica.get(titulo) ?? 0;
            quantidadeMissoesPorTematica.set(titulo, quantidade + 1);

            tematica.progresso += Number(progresso.progresso) || 0;

            tematica.pontuacao +=
                "pontuacaoObtida" in progresso
                    ? Number(progresso.pontuacaoObtida) || 0
                    : (Number(progresso.progresso) || 0) ?
                        Number(progresso.missao.pontuacao) : 0
        }

        for (const [titulo, tematica] of mapa) {
            const quantidade = quantidadeMissoesPorTematica.get(titulo) ?? 0;

            if (quantidade > 0) {
                tematica.progresso =
                    tematica.progresso / quantidade;
            }
        }

        setProgressoMissoes(progressos);
        setProgressoPontosTematicas(mapa);
    }, [user?.id, tematicas]);

    const atualizarPontuacaoProgressoTotal = useCallback(() => {
        if (!progressoMissoes) return;
        let progressoTotal = 0;
        let pontuacaoTotal = 0;

        for (const { progresso, pontuacao } of progressoPontosTematicas.values()) {
            progressoTotal += progresso;
            pontuacaoTotal += pontuacao;
        }

        setPontuacao(pontuacaoTotal);
        setProgressoTotal(progressoTotal / tematicas.length);
    }, [progressoMissoes]);


    const atualizar = useCallback(async () => {
        try {
            setCarregando(true);

            await Promise.all([
                carregarTematicas(),
                atualizarDistintivos(),
                atualizarProgresso(),
            ]);
        } catch (e) {
            console.error(e)
            //MENSAGEM DE ERRO
        } finally {
            setCarregando(false);
        }
    }, [
        carregarTematicas,
        atualizarDistintivos,
        atualizarProgresso,
    ]);

    const iniciarProgressos = useCallback(async () => {
        if (!user) return
        if (!user.id) return
        try {
            const [
                missoesResponse,
                progressoMissaoResponse,
            ] = await Promise.all([
                MissaoAPI.listar(),
                ProgressoMissaoAPI.listarPorUsuario(user.id),
            ]);
            if (!missoesResponse.data) return //MENSAGEM ERRO
            if (!progressoMissaoResponse.data) return //MENSAGEM ERRO

            const missoes = missoesResponse.data as Missao[]
            if (!missoes.length) return //MENSAGEM ERRO

            const progressos = progressoMissaoResponse.data as ProgressoMissao[]
            if (progressos.length === missoes.length) return //MENSAGEM ERRO

            const idsMissoesComProgresso = new Set(
                progressos.map(progresso => progresso.missao.id)
            );

            const payloadsProgressos = missoes
                .filter(missao => !idsMissoesComProgresso.has(missao.id))
                .map(missao => {
                    if ("tipoMaterial" in missao) {
                        return {
                            idUsuario: user.id,
                            idMissao: missao.id,
                            progresso: 0,
                        };
                    }

                    return {
                        idUsuario: user.id,
                        idMissao: missao.id,
                        progresso: 0,
                        tentativasRealizadas: 0,
                        pontuacaoObtida: 0,
                    };
                });

            if (payloadsProgressos.length === 0) return;

            await Promise.all(
                payloadsProgressos.map(payload =>
                    ProgressoMissaoAPI.salvar(
                        payload as ProgressoMissaoDTO
                    )
                )
            );
        } catch (e) {
            console.error(e)
            //MENSAGEM DE ERRO
        }
    }, [user?.id]);

    useEffect(() => {
        if (!user?.id) return;

        const inicializar = async () => {
            await carregarTematicas();
            await iniciarProgressos();
            await atualizar();
        };

        inicializar();
    }, [user?.id, iniciarProgressos, atualizar, carregarTematicas]);

    useEffect(() => {
        atualizarPontuacaoProgressoTotal();
    }, [progressoMissoes]);

    return (
        <GameContext.Provider
            value={{
                carregando,
                pontuacao,
                progressoTotal,
                progressoPontosTematicas,
                distintivos,
                progressoMissoes,

                atualizar,
                atualizarDistintivos,
                atualizarProgresso,
                atualizarPontuacaoProgressoTotal
            }}
        >
            {children}
        </GameContext.Provider>
    );
}
