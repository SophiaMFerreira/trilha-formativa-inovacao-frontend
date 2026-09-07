export type RecuperarSenhaDTO = {
    token: string
    novaSenha: string
    novaSenhaRepeticao: string
}

export type retornoValidarToken = {
    valido: false
    erro: string
} | {
    valido: true
    expiraEm: string
}