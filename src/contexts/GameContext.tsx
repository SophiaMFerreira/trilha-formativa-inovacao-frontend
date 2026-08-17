import { Distintivo } from "@/types_consts/distintivo";
import { ProgressoMissao } from "@/types_consts/missao";
import { createContext } from "react";


export type GameContextType = {
    carregando: boolean
    pontuacao: number
    progressoTotal: number
    distintivos: Distintivo[]
    progressoMissoes: ProgressoMissao[]
    atualizar(): Promise<void>;
    atualizarDistintivos: () => Promise<void>
    atualizarProgresso: () => Promise<void>
    atualizarPontuacaoProgressoTotal: () => void
}

export const GameContext = createContext<GameContextType>(
    {} as GameContextType
);