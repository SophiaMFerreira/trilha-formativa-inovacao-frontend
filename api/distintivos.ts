import { api } from "./axios";
import { DistintivoDTO } from "../src/types_consts/distintivo";

export const DistintivoAPI = {

    listar() {
        return api.get("api/v1/distintivos");
    },

    buscarPorId(idDistintivo: number) {
        return api.get(`api/v1/distintivos/${idDistintivo}`);
    },

    salvar(distintivo: DistintivoDTO) {
        return api.post("api/v1/distintivos", distintivo);
    },

    atualizar(idDistintivo: number, distintivo: DistintivoDTO) {
        return api.put(`api/v1/distintivos/${idDistintivo}`, distintivo);
    },

    deletar(idDistintivo: number) {
        return api.delete(`api/v1/distintivos/${idDistintivo}`);
    }
}