import { api } from "./axios";
import {
    RecuperarSenhaDTO,
    RetornoSolicitarRecuperacao,
    RetornoRedefinirSenha,
    RetornoValidarToken,
} from "../src/types_consts/recuperarSenha";

export const RecuperarSenhaAPI = {

    /**
     * O backend lê o corpo com json_decode e procura a chave
     * "correioEletronico". Enviar a string pura faz o json_decode
     * devolver null, o backend interpretar o e-mail como vazio e
     * encerrar a solicitação em silêncio — resposta 200 sem token
     * gravado e sem e-mail enviado.
     */
    solicitar(correioEletronico: string) {
        return api.post<RetornoSolicitarRecuperacao>(
            "api/v1/recuperacao-senha/solicitar",
            { correioEletronico: correioEletronico.trim() }
        );
    },

    validar(token: string) {
        return api.get<RetornoValidarToken>(
            "api/v1/recuperacao-senha/validar",
            { params: { token } }
        );
    },

    redefinir(novoAcesso: RecuperarSenhaDTO) {
        return api.post<RetornoRedefinirSenha>(
            "api/v1/recuperacao-senha/redefinir",
            novoAcesso
        );
    },
}
