/** Quantidade de dígitos do código enviado por e-mail pela API. */
export const TAMANHO_CODIGO_VERIFICACAO = 6

/**
 * Intervalo mínimo, em segundos, entre dois pedidos de código a partir
 * da mesma tela.
 *
 * O limite real é da API (EMAIL_VERIFICATION_MAX_REQUESTS, 3 por
 * janela de 15 minutos). Esta espera do lado do cliente existe só para
 * o usuário não gastar a cota em cliques seguidos e acabar travado sem
 * entender o motivo.
 */
export const ESPERA_REENVIO_SEGUNDOS = 60

export type RetornoSolicitarVerificacao = {
    mensagem: string
    expiraEmMinutos: number
}

export type RetornoConfirmarVerificacao = {
    mensagem: string
    comprovanteVerificacao: string
    expiraEmMinutos: number
}

/**
 * Situação da tela de verificação.
 *
 * "enviando" cobre o intervalo entre abrir o diálogo e a API confirmar
 * o disparo do e-mail: nesse período não há código para digitar.
 * "indisponivel" é o estado terminal em que não adianta insistir —
 * e-mail já cadastrado ou cota de envios esgotada.
 */
export type SituacaoVerificacaoEmail =
    | "enviando"
    | "aguardandoCodigo"
    | "confirmando"
    | "indisponivel"
