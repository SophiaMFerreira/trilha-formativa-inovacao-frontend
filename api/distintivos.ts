import { api } from "./axios";
import { DistintivoDTO } from "../src/types_consts/distintivo";

export const DistintivoAPI = {

    listar() {
        return api.get("distintivos");
    },

    buscarPorId(idDistintivo: number) {
        return api.get(`/distintivos/${idDistintivo}`);
    },

    salvar(distintivo: DistintivoDTO) {
        return api.post("distintivos", distintivo);
    },

    atualizar(idDistintivo: number, distintivo: DistintivoDTO) {
        return api.put(`distintivos/${idDistintivo}`, distintivo);
    },

    deletar(idDistintivo: number) {
        return api.delete(`distintivos/${idDistintivo}`);
    }
}