import { ProgressoMissao, ProgressoMissaoAtividade } from "@/types_consts/missao";

export function calcularPontuacaoEProgressoGeral(
    progressoMissoes: ProgressoMissao[]
) {
    let pontuacao = 0
    let progressoTot = 0

    for (const progresso of progressoMissoes) {
        if ("tipoMaterial" in progresso.missao) {
            pontuacao += (Number(progresso.progresso) || 0) ?
                Number(progresso.missao.pontuacao) : 0
        } else {
            let atividade = progresso as ProgressoMissaoAtividade
            pontuacao += Number(atividade.pontuacaoObtida) || 0
        }

        progressoTot += progresso.progresso
    }

    return {
        pontuacao,
        progressoTotal: (progressoTot / progressoMissoes.length)
    };
}