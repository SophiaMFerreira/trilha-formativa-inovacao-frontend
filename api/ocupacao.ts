import { api } from "./axios";
import { OcupacaoDTO } from "../src/types_consts/ocupacao";

export const OcupacaoAPI = {

    listar() {
        return api.get("api/v1/ocupacoes");
    },

    buscarPorId(idOcupacao: number) {
        return api.get(`api/v1/ocupacoes/${idOcupacao}`);
    },

    salvar(ocupacao: OcupacaoDTO) {
        return api.post("api/v1/ocupacoes", ocupacao) ;
    },

    atualizar(idOcupacao: number, ocupacao: OcupacaoDTO) {
        return api.put(`api/v1/ocupacoes/${idOcupacao}`, ocupacao);
    },

    deletar(idOcupacao: number) {
        return api.delete(`api/v1/ocupacoes/${idOcupacao}`);
    }
}