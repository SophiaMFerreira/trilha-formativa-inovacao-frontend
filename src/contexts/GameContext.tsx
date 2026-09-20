import { Distintivo } from "@/types_consts/distintivo";
import { ProgressoMissao, ProgressoPontosTematicaMap } from "@/types_consts/missao";
import { TematicaDTO } from "@/types_consts/tematica";
import { createContext } from "react";

export type GameContextType = {
    carregando: boolean
    pontuacao: number
    progressoTotal: number
    progressoPontosTematicas: ProgressoPontosTematicaMap
    distintivos: Distintivo[]
    progressoMissoes: ProgressoMissao[]
    /** Temáticas da trilha, na ordem devolvida pela API. */
    tematicas: TematicaDTO[]
    atualizar(): Promise<void>;
    atualizarDistintivos: () => Promise<void>
    atualizarProgresso: () => Promise<void>
}

export const GameContext = createContext<GameContextType>(
    {} as GameContextType
);