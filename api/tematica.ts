import { api } from "./axios";
import { TematicaDTO } from "../src/types_consts/tematica";

export const TematicaAPI = {

    listar() {
        return api.get("api/v1/tematicas");
    },

    buscarPorId(idTematca: number) {
        return api.get(`api/v1/tematicas/${idTematca}`);
    },

    salvar(tematica: TematicaDTO) {
        return api.post("api/v1/tematicas", tematica);
    },

    atualizar(idTematca: number, tematica: TematicaDTO) {
        return api.put(`api/v1/tematicas/${idTematca}`, tematica);
    },

    deletar(idTematca: number) {
        return api.delete(`api/v1/tematicas/${idTematca}`);
    }
}