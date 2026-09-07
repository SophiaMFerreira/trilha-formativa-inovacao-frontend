import { api } from "./axios";
import { RecuperarSenhaDTO } from "../src/types_consts/recuperarSenha";

export const RecuperarSenhaAPI = {

    solicitar(correioEletronico: string) {
        return api.post("/api/v1/recuperacao-senha/solicitar", correioEletronico);
    },

    validar(token: string) {
        return api.get(`/api/v1/recuperacao-senha/validar?=token${token}`);
    },

    redefinir(novoAcesso: RecuperarSenhaDTO) {
        return api.post(`/api/v1/recuperacao-senha/redefinir`, novoAcesso);
    },
}