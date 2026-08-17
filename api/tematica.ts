import { api } from "./axios";
import { TematicaDTO } from "../src/types_consts/tematica";

export const TematicaAPI = {

    listar() {
        return api.get("tematicas");
    },

    buscarPorId(idTematca: number) {
        return api.get(`tematicas/${idTematca}`);
    },

    salvar(tematica: TematicaDTO) {
        return api.post("tematicas", tematica);
    },

    atualizar(idTematca: number, tematica: TematicaDTO) {
        return api.put(`tematicas/${idTematca}`, tematica);
    },

    deletar(idTematca: number) {
        return api.delete(`tematicas/${idTematca}`);
    }
}