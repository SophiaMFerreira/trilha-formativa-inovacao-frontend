import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

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
import { limitarPercentual, mediaSegura, pontuacaoDoProgresso } from "@/utils/pontuacao";
import { mensagemDeErroDaApi } from "@/utils/erroApi";
import { toaster } from "@/components/commons/toaster";
import { mensagensToastErro } from "@/config/mensagensToaster";
import { mensagensErroConsole } from "@/config/mensagensError";

/**
 * Estado de jogo compartilhado pelas telas.
 *
 * O que mudou aqui, e por quê:
 *
 *  - As três buscas de abertura (temáticas, distintivos e progressos)
 *    saem em PARALELO, em um único efeito preso ao id do usuário.
 *    Antes eram sequenciais e o efeito dependia de callbacks que
 *    mudavam de identidade quando as temáticas chegavam — cada
 *    carregamento disparava o ciclo inteiro outra vez.
 *
 *  - Pontuação, progresso por temática e progresso total passam a ser
 *    DERIVADOS com useMemo. Antes eram estado sincronizado por efeitos
 *    encadeados: cada resposta da API provocava três renderizações em
 *    sequência antes de a tela estabilizar.
 *
 *  - iniciarProgressos() reaproveita a lista de progressos já buscada,
 *    em vez de pedir a mesma lista uma segunda vez.
 */
export function GameProvider({
    children,
}: {
    children: ReactNode;
}) {
    const { user } = useAuth();
    const idUsuario = user?.id;

    /*
     * "carregando" é derivado: sem usuário não há nada a carregar, e
     * atribuir o valor dentro do efeito provocava renderização em
     * cascata.
     */
    const [carregandoDados, setCarregandoDados] = useState(true);
    const carregando = Boolean(idUsuario) && carregandoDados;

    const [distintivos, setDistintivos] = useState<Distintivo[]>([]);
    const [tematicas, setTematicas] = useState<TematicaDTO[]>([]);
    const [progressoMissoes, setProgressoMissoes] = useState<ProgressoMissao[]>([]);

    /* Garante que a criação dos progressos iniciais aconteça uma vez por usuário. */
    const progressosIniciados = useRef<number | null>(null);

    const buscarDistintivos = useCallback(async (): Promise<Distintivo[]> => {
        if (!idUsuario) return [];

        const [
            distintivosResponse,
            distintivosAdquiridosResponse,
        ] = await Promise.all([
            DistintivoAPI.listar(),
            DistintivoAdquiridoAPI.listarPorUsuario(idUsuario),
        ]);

        const listaDistintivos = Array.isArray(distintivosResponse.data)
            ? distintivosResponse.data as Distintivo[]
            : [];

        const listaAdquiridos = Array.isArray(distintivosAdquiridosResponse.data)
            ? distintivosAdquiridosResponse.data as DistintivoAdquirido[]
            : [];

        const adquiridos = new Set(
            listaAdquiridos
                .map(da => da?.distintivo?.id)
                .filter((id): id is number => typeof id === "number")
        );

        return listaDistintivos.map(distintivo => ({
            ...distintivo,
            adquirido: adquiridos.has(distintivo.id),
        }));
    }, [idUsuario]);

    const buscarProgressos = useCallback(async (): Promise<ProgressoMissao[]> => {
        if (!idUsuario) return [];

        const response = await ProgressoMissaoAPI.listarPorUsuario(idUsuario);

        return Array.isArray(response.data)
            ? response.data as ProgressoMissao[]
            : [];
    }, [idUsuario]);

    const buscarTematicas = useCallback(async (): Promise<TematicaDTO[]> => {
        const response = await TematicaAPI.listar();

        return Array.isArray(response.data)
            ? response.data as TematicaDTO[]
            : [];
    }, []);

    /**
     * Cria os registros de progresso que ainda não existem para o
     * usuário, a partir dos progressos já carregados.
     */
    const iniciarProgressos = useCallback(async (
        progressosAtuais: ProgressoMissao[]
    ): Promise<ProgressoMissao[] | null> => {
        if (!idUsuario) return null;

        const missoesResponse = await MissaoAPI.listar();

        const missoes = Array.isArray(missoesResponse.data)
            ? missoesResponse.data as Missao[]
            : [];

        if (missoes.length === 0) return null;
        if (progressosAtuais.length >= missoes.length) return null;

        const idsComProgresso = new Set(
            progressosAtuais.map(progresso => progresso.missao?.id)
        );

        const novosProgressos = missoes
            .filter(missao => !idsComProgresso.has(missao.id))
            .map(missao => {
                if ("tipoMaterial" in missao) {
                    return {
                        idUsuario,
                        idMissao: missao.id,
                        progresso: 0,
                    };
                }

                return {
                    idUsuario,
                    idMissao: missao.id,
                    progresso: 0,
                    tentativasRealizadas: 0,
                    pontuacaoObtida: 0,
                };
            });

        if (novosProgressos.length === 0) return null;

        await Promise.all(
            novosProgressos.map(payload =>
                ProgressoMissaoAPI.salvar(payload as ProgressoMissaoDTO)
            )
        );

        /* Só relê a lista quando algo foi realmente criado. */
        return buscarProgressos();
    }, [idUsuario, buscarProgressos]);

    const atualizarDistintivos = useCallback(async () => {
        try {
            setDistintivos(await buscarDistintivos());
        } catch (erro) {
            console.error(
                mensagensErroConsole.buscarDistintivo,
                mensagemDeErroDaApi(erro) ?? erro
            );
            toaster.create(mensagensToastErro.carregarDistintivos);
        }
    }, [buscarDistintivos]);

    const atualizarProgresso = useCallback(async () => {
        try {
            setProgressoMissoes(await buscarProgressos());
        } catch (erro) {
            console.error(
                mensagensErroConsole.buscarProgressos,
                mensagemDeErroDaApi(erro) ?? erro
            );
            toaster.create(mensagensToastErro.carregarGenerico);
        }
    }, [buscarProgressos]);

    const atualizar = useCallback(async () => {
        try {
            setCarregandoDados(true);

            const [tematicasCarregadas, distintivosCarregados, progressosCarregados] =
                await Promise.all([
                    buscarTematicas(),
                    buscarDistintivos(),
                    buscarProgressos(),
                ]);

            setTematicas(tematicasCarregadas);
            setDistintivos(distintivosCarregados);
            setProgressoMissoes(progressosCarregados);
        } catch (erro) {
            console.error(
                mensagensErroConsole.buscarGenerico,
                mensagemDeErroDaApi(erro) ?? erro
            );
            toaster.create(mensagensToastErro.carregarGenerico);
        } finally {
            setCarregandoDados(false);
        }
    }, [buscarTematicas, buscarDistintivos, buscarProgressos]);

    useEffect(() => {
        if (!idUsuario) return;

        let ativo = true;

        async function inicializar() {
            try {
                const [tematicasCarregadas, distintivosCarregados, progressosCarregados] =
                    await Promise.all([
                        buscarTematicas(),
                        buscarDistintivos(),
                        buscarProgressos(),
                    ]);

                if (!ativo) return;

                setTematicas(tematicasCarregadas);
                setDistintivos(distintivosCarregados);
                setProgressoMissoes(progressosCarregados);

                /*
                 * A criação dos progressos que faltam acontece depois
                 * de a tela já ter dados para mostrar, e só uma vez
                 * por usuário.
                 */
                if (progressosIniciados.current === idUsuario) return;
                progressosIniciados.current = idUsuario ?? null;

                const progressosAposCriacao = await iniciarProgressos(progressosCarregados);

                if (ativo && progressosAposCriacao) {
                    setProgressoMissoes(progressosAposCriacao);
                }
            } catch (erro) {
                if (!ativo) return;

                console.error(
                    mensagensErroConsole.buscarGenerico,
                    mensagemDeErroDaApi(erro) ?? erro
                );
                toaster.create(mensagensToastErro.carregarGenerico);
            } finally {
                if (ativo) setCarregandoDados(false);
            }
        }

        inicializar();

        return () => { ativo = false };
    }, [idUsuario, buscarTematicas, buscarDistintivos, buscarProgressos, iniciarProgressos]);

    /**
     * Progresso e pontuação por temática, recalculados apenas quando
     * as temáticas ou os progressos realmente mudam.
     */
    const progressoPontosTematicas = useMemo<ProgressoPontosTematicaMap>(() => {
        const mapa: ProgressoPontosTematicaMap = new Map(
            tematicas.map(({ titulo }) => [
                titulo,
                { progresso: 0, pontuacao: 0 },
            ])
        );

        const quantidadePorTematica = new Map<string, number>();

        for (const progresso of progressoMissoes) {
            const titulo = progresso?.missao?.tematica?.titulo;

            if (!titulo) continue;

            const tematica = mapa.get(titulo);

            if (!tematica) continue;

            quantidadePorTematica.set(
                titulo,
                (quantidadePorTematica.get(titulo) ?? 0) + 1
            );

            tematica.progresso += Number(progresso.progresso) || 0;

            /* Mesma regra usada pelo Ranking, para os totais coincidirem. */
            tematica.pontuacao += pontuacaoDoProgresso(progresso);
        }

        for (const [titulo, tematica] of mapa) {
            const quantidade = quantidadePorTematica.get(titulo) ?? 0;

            /* Sem missões na temática o progresso é 0, não uma divisão por zero. */
            tematica.progresso = quantidade > 0
                ? limitarPercentual(tematica.progresso / quantidade)
                : 100;
        }

        return mapa;
    }, [tematicas, progressoMissoes]);

    const pontuacao = useMemo(() => {
        let total = 0;

        for (const { pontuacao } of progressoPontosTematicas.values()) {
            total += pontuacao;
        }

        return total;
    }, [progressoPontosTematicas]);

    /*
     * Média dos progressos das temáticas. Dividir pela quantidade de
     * temáticas sem checá-la produzia NaN enquanto a lista não havia
     * carregado — e o NaN chegava às barras de progresso e ao ranking.
     */
    const progressoTotal = useMemo(
        () => limitarPercentual(
            mediaSegura(
                [...progressoPontosTematicas.values()].map(t => t.progresso)
            )
        ),
        [progressoPontosTematicas]
    );

    const valor = useMemo(() => ({
        carregando,
        pontuacao,
        progressoTotal,
        progressoPontosTematicas,
        distintivos,
        progressoMissoes,

        atualizar,
        atualizarDistintivos,
        atualizarProgresso,
    }), [
        carregando,
        pontuacao,
        progressoTotal,
        progressoPontosTematicas,
        distintivos,
        progressoMissoes,
        atualizar,
        atualizarDistintivos,
        atualizarProgresso,
    ]);

    return (
        <GameContext.Provider value={valor}>
            {children}
        </GameContext.Provider>
    );
}
