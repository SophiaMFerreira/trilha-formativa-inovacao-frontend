/** Cronômetro do quiz preservado entre navegações. */
export type TempoQuizSalvo = {
    /** Segundos restantes por questão, na ordem exibida. */
    restante: number[]
    /** Questão em que o aventureiro parou. */
    idQuestao: number
};

export function chaveTempoQuiz(
    idUsuario: number | undefined,
    idMissao: string | number | undefined
): string | null {
    if (idUsuario === undefined || idMissao === undefined) return null;

    return `trilhaFormativa:tempoQuiz:${idUsuario}:${idMissao}`;
}

/**
 * Lê o tempo gravado. Devolve o padrão quando não há registro, quando
 * o registro está corrompido ou quando a quantidade de questões mudou
 * (missão editada entre uma sessão e outra).
 */
export function lerTempoQuiz(
    chave: string | null,
    quantidadeQuestoes: number,
    tempoPorQuestao: number
): TempoQuizSalvo {
    const padrao: TempoQuizSalvo = {
        restante: Array(quantidadeQuestoes).fill(tempoPorQuestao),
        idQuestao: 0,
    };

    if (!chave) return padrao;

    try {
        const bruto = window.sessionStorage.getItem(chave);

        if (!bruto) return padrao;

        const salvo = JSON.parse(bruto) as Partial<TempoQuizSalvo>;

        if (!Array.isArray(salvo?.restante)) return padrao;
        if (salvo.restante.length !== quantidadeQuestoes) return padrao;

        const restante = salvo.restante.map(valor => {
            const numero = Number(valor);

            if (!Number.isFinite(numero)) return tempoPorQuestao;

            return Math.min(Math.max(Math.trunc(numero), 0), tempoPorQuestao);
        });

        const idQuestao = Number(salvo.idQuestao);

        return {
            restante,
            idQuestao:
                Number.isInteger(idQuestao)
                    && idQuestao >= 0
                    && idQuestao < quantidadeQuestoes
                    ? idQuestao
                    : 0,
        };
    } catch {
        return padrao;
    }
}

export function gravarTempoQuiz(
    chave: string | null,
    valor: TempoQuizSalvo
): void {
    if (!chave) return;

    try {
        window.sessionStorage.setItem(chave, JSON.stringify(valor));
    } catch {
    }
}

export function limparTempoQuiz(chave: string | null): void {
    if (!chave) return;

    try {
        window.sessionStorage.removeItem(chave);
    } catch {
        /* Ver gravarTempoQuiz. */
    }
}
