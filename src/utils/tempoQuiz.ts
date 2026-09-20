/**
 * Cronômetro do quiz preservado entre navegações.
 *
 * O tempo restante ficava apenas em estado de componente: bastava o
 * aventureiro sair para a trilha e voltar para o relógio recomeçar do
 * zero em todas as perguntas. O estado passa a ser gravado no
 * sessionStorage, por usuário e por missão, e é lido de volta quando
 * a tela monta.
 *
 * Guardamos o tempo RESTANTE, não um horário de expiração: o relógio
 * congela enquanto o aventureiro está fora do quiz. A alternativa
 * (descontar o tempo de ausência) puniria quem abriu o conteúdo para
 * consultar algo, o que não é o comportamento pedido.
 *
 * sessionStorage e não localStorage: a sessão do navegador é o escopo
 * certo, fechar o navegador encerra a tentativa. E todo acesso vai
 * dentro de try/catch porque em navegação privativa ou com cookies
 * bloqueados a simples leitura da API lança.
 */

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
        /*
         * Persistir é uma conveniência, não um requisito: se o
         * navegador recusar a escrita o quiz continua funcionando com
         * o cronômetro apenas em memória.
         */
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
