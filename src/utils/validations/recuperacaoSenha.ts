import { validarSenhas } from "./senha"

export type ResultadoValidacaoRecuperacaoSenha = {
    invalido: boolean
    tempo: boolean
    senha: boolean
    confirmarSenha: boolean
    token: boolean
};

export function validarRecuperacaoSenha(
    tempo: unknown,
    senha: unknown,
    confirmarSenha: unknown,
    token: unknown
): ResultadoValidacaoRecuperacaoSenha {
    // TEMPO
    const tempoValido =
        typeof tempo === "number" &&
        tempo > 0

    // SENHAS
    const resultadoValidacaoSenhas = validarSenhas(senha, confirmarSenha, false)

    // TOKEN
    const tokenValido = typeof token === "string" &&
        token.trim().length > 0

    return {
        invalido: !(tempoValido &&
            resultadoValidacaoSenhas.senha &&
            resultadoValidacaoSenhas.confirmarSenha &&
            tokenValido),
        tempo: !tempoValido,
        senha: !resultadoValidacaoSenhas.senha,
        confirmarSenha: !resultadoValidacaoSenhas.confirmarSenha,
        token: !tokenValido
    }
}
