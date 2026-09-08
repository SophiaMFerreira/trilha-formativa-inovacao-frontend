/**
 * Chave do localStorage com o e-mail informado na solicitação.
 * Compartilhada entre as duas telas do fluxo para que o reenvio do
 * link não precise pedir o endereço novamente.
 */
export const CHAVE_EMAIL_RECUPERACAO = "correioEletronico"

export type RecuperarSenhaDTO = {
    token: string
    novaSenha: string
    novaSenhaRepeticao: string
}

export type RetornoSolicitarRecuperacao = {
    mensagem: string
}

export type RetornoRedefinirSenha = {
    mensagem: string
}

export type RetornoValidarToken = {
    valido: false
    erro: string
} | {
    valido: true
    /** Data ISO 8601 devolvida pelo backend (DateTime::ATOM). */
    expiraEm: string
}

/**
 * Situação do link de redefinição na tela de nova senha.
 *
 * "verificando" cobre o intervalo entre abrir a tela e o backend
 * responder: nesse período o formulário não deve ser submetido nem
 * a contagem regressiva exibida.
 */
export type SituacaoTokenRecuperacao =
    | "verificando"
    | "valido"
    | "invalido"
