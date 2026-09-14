import { api } from "./axios";
import type {
    RetornoConfirmarVerificacao,
    RetornoSolicitarVerificacao,
} from "../src/types_consts/verificacaoEmail";

/**
 * Verificação do e-mail antes da criação da conta.
 *
 * O fluxo tem duas etapas: solicitar dispara um código de seis dígitos
 * para o endereço informado; confirmar troca esse código por um
 * comprovante de 256 bits, que é o que autoriza o POST /usuarios.
 *
 * Como na recuperação de senha, o corpo precisa ser um objeto JSON com
 * a chave "correioEletronico": a API lê o corpo com json_decode e
 * enviar a string pura faria o e-mail chegar vazio.
 */
export const VerificacaoEmailAPI = {

    solicitar(correioEletronico: string) {
        return api.post<RetornoSolicitarVerificacao>(
            "api/v1/verificacao-email/solicitar",
            { correioEletronico: correioEletronico.trim() }
        );
    },

    confirmar(correioEletronico: string, codigo: string) {
        return api.post<RetornoConfirmarVerificacao>(
            "api/v1/verificacao-email/confirmar",
            {
                correioEletronico: correioEletronico.trim(),
                codigo: codigo.trim(),
            }
        );
    },
}
