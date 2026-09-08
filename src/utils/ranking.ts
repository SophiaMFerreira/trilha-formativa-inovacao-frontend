/**
 * Regras de montagem do ranking exibido.
 *
 * Ficava dentro de ranking.tsx. Foi extraído para cá porque é lógica
 * pura, testável isoladamente, e porque um arquivo de componente que
 * também exporta funções quebra o fast refresh do Vite.
 */

export type RankingUsuario = {
    indice: number;
    id: number;
    nomeAventureiro: string;
    imagem: string | undefined;
    pontuacao: number;
}

export type RankingResumido = {
    rankingExibido: RankingUsuario[];
    meuRanking: number;
};

/** Quantidade máxima de linhas exibidas no ranking expandido. */
export const LIMITE_LINHAS_RANKING = 8;

/**
 * Monta a versão resumida: pódio, vizinhos do usuário logado e o que
 * couber até o limite de linhas.
 *
 * A versão anterior localizava o usuário pelo nome de aventureiro e
 * empilhava ranking[indice - 1] / ranking[indice + 1] sem checar os
 * limites do array. Com o ranking vazio ou com o usuário fora dele,
 * entravam posições undefined na lista e o filtro seguinte quebrava
 * ao ler .id de undefined — o componente inteiro deixava de renderizar.
 */
export function gerarRankingResumido(
    ranking: RankingUsuario[],
    idUsuario: number | undefined
): RankingResumido {
    if (ranking.length === 0) {
        return { rankingExibido: [], meuRanking: 0 };
    }

    const indice = idUsuario === undefined
        ? -1
        : ranking.findIndex(u => u.id === idUsuario);

    const selecionados = new Map<number, RankingUsuario>();

    const incluir = (posicao: number) => {
        if (posicao < 0 || posicao >= ranking.length) return;
        if (selecionados.size >= LIMITE_LINHAS_RANKING) return;

        const usuario = ranking[posicao];

        if (!usuario) return;

        selecionados.set(usuario.id, usuario);
    };

    /* Pódio. */
    [0, 1, 2].forEach(incluir);

    /* Usuário logado e seus vizinhos imediatos. */
    if (indice >= 0) {
        incluir(indice - 1);
        incluir(indice);
        incluir(indice + 1);
    }

    /* Completa com as posições seguintes até o limite. */
    for (let posicao = 3; posicao < ranking.length; posicao++) {
        if (selecionados.size >= LIMITE_LINHAS_RANKING) break;
        incluir(posicao);
    }

    const rankingExibido = [...selecionados.values()]
        .sort((a, b) => a.indice - b.indice);

    return {
        rankingExibido,
        meuRanking: indice >= 0 ? ranking[indice].indice : 0,
    }
}
