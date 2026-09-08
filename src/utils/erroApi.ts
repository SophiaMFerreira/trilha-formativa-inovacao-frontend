import axios from "axios";

/**
 * Leitura dos erros devolvidos pela API.
 *
 * A API responde falhas de negócio no formato { "erro": "..." } com
 * status 400/404 e falhas internas com 500. Estas funções isolam esse
 * contrato para que as telas decidam qual toaster exibir sem precisar
 * conhecer a estrutura do AxiosError — e sem jamais colocar o texto
 * técnico na frente do usuário.
 */

export function statusDoErro(erro: unknown): number | undefined {
    if (axios.isAxiosError(erro)) {
        return erro.response?.status;
    }

    return undefined;
}

/**
 * Mensagem de negócio devolvida pela API, quando existir.
 *
 * Serve para log e para decisões de fluxo. Não use direto no toaster:
 * a mensagem amigável ao usuário fica em mensagensToaster.
 */
export function mensagemDeErroDaApi(erro: unknown): string | undefined {
    if (!axios.isAxiosError(erro)) {
        return undefined;
    }

    const dados = erro.response?.data;

    if (dados && typeof dados === "object" && "erro" in dados) {
        const mensagem = (dados as { erro?: unknown }).erro;

        if (typeof mensagem === "string" && mensagem.trim().length > 0) {
            return mensagem;
        }
    }

    return undefined;
}

/**
 * Distingue "a API recusou o pedido" (validação/regra de negócio) de
 * "a API falhou" (rede, 500). O toaster muda em cada caso.
 */
export function erroDeValidacaoDaApi(erro: unknown): boolean {
    const status = statusDoErro(erro);

    return status !== undefined && status >= 400 && status < 500;
}
