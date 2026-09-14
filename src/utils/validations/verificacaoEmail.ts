import { TAMANHO_CODIGO_VERIFICACAO } from "@/types_consts/verificacaoEmail"

/**
 * O código precisa ter exatamente seis dígitos.
 *
 * A conferência do lado do cliente não substitui a da API: ela existe
 * para não gastar uma das poucas tentativas do usuário com um código
 * obviamente incompleto. A API queima a verificação após cinco erros,
 * então cada requisição desperdiçada custa caro.
 *
 * O zero à esquerda é significativo — "007321" é um código válido —,
 * por isso a comparação é textual e nunca numérica.
 */
export function validarCodigoVerificacao(codigo: unknown): boolean {
    if (typeof codigo !== "string") {
        return false
    }

    const expressao = new RegExp(`^\\d{${TAMANHO_CODIGO_VERIFICACAO}}$`)

    return expressao.test(codigo.trim())
}
