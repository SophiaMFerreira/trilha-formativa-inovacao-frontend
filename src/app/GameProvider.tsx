import { ReactNode, useCallback, useEffect, useState } from "react";

import { Distintivo, DistintivoAdquirido } from "@/types_consts/distintivo";
import { useAuth } from "@/hooks/useAuth";
import { Missao, ProgressoMissao, ProgressoMissaoDTO } from "@/types_consts/missao";
import { DistintivoAPI } from "../../api/distintivos";
import { DistintivoAdquiridoAPI } from "../../api/distintivoAdquirido";
import { ProgressoMissaoAPI } from "../../api/progressoMissao";
import { GameContext } from "@/contexts/GameContext";
import { calcularPontuacaoEProgressoGeral } from "@/utils/pontuacaoProgressoGeral";
import { MissaoAPI } from "../../api/missao";


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
    }, [user]);

    const atualizarProgresso = useCallback(async () => {
        if (!user) return;

        const progressoMissaoResponse = await ProgressoMissaoAPI.listarPorUsuario(user.id)
        const progressos = progressoMissaoResponse.data as ProgressoMissao[]

        if (progressos === progressoMissoes) return
        setProgressoMissoes(progressos)
    }, [user]);

    const atualizarPontuacaoProgressoTotal = useCallback(() => {
        if (!progressoMissoes) return;

        const { pontuacao, progressoTotal } = calcularPontuacaoEProgressoGeral(progressoMissoes);

        setPontuacao(pontuacao);
        setProgressoTotal(progressoTotal);
    }, [progressoMissoes]);


    const atualizar = useCallback(async () => {
        try {
            setCarregando(true);

            await Promise.all([
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
    }, [user]);

    useEffect(() => {
        if (!user?.id) return;

        const inicializar = async () => {
            await iniciarProgressos();
            await atualizar();
        };

        inicializar();
    }, [user, iniciarProgressos, atualizar]);

    useEffect(() => {
        atualizarPontuacaoProgressoTotal();
    }, [progressoMissoes]);

    return (
        <GameContext.Provider
            value={{
                carregando,
                pontuacao,
                progressoTotal,
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
