import { api } from "./axios";
import { OcupacaoDTO } from "../src/types_consts/ocupacao";

export const OcupacaoAPI = {

    listar() {
        return api.get("ocupacoes");
    },

    buscarPorId(idOcupacao: number) {
        return api.get(`ocupacoes/${idOcupacao}`);
    },

    salvar(ocupacao: OcupacaoDTO) {
        return api.post("ocupacoes", ocupacao) ;
    },

    atualizar(idOcupacao: number, ocupacao: OcupacaoDTO) {
        return api.put(`ocupacoes/${idOcupacao}`, ocupacao);
    },

    deletar(idOcupacao: number) {
        return api.delete(`ocupacoes/${idOcupacao}`);
    }
}