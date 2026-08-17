import { User } from "@/contexts/AuthContext"
import type { ItemMenu } from "@/types_consts/menu"
import { FaMap, FaMapSigns, FaBook, FaPencilAlt, FaUserAlt, FaEye, FaPuzzlePiece, FaAward, } from "react-icons/fa"

export function getMenuItens(user: User | null): ItemMenu[] {
  return [
    /*{   id: 1,
        posicao: "esquerda",
        titulo: "Trilha Formativa para Inovação",
        rota: "#hero",
        icone: <FaMap size={20} color="brand.primaryDark"/>,
        roles: [""]
    }, {
        id: 2,
        posicao: "esquerda",
        titulo: "A Trilha",
        rota: "#info",
        icone: <FaMapSigns size={20} color="brand.primaryDark" />,
        roles: [""]
    }, {
        id: 3,
        posicao: "esquerda",
        titulo: "Gamificação",
        rota: "#gamification",
        icone: <FaGamepad size={25} color="brand.primaryDark" />,
        roles: [""]
    },*/ {
        id: 4,
        posicao: "esquerda",
        titulo: "Textos e Vídeo",
        rota: "/banco-materiais",
        icone: <FaBook size={20} color="brand.primaryDark" />,
        roles: ["admin"]
    }, {
        id: 16,
        posicao: "esquerda",
        titulo: "Missões Atividade",
        rota: "/banco-missoes-atividade",
        icone: <FaPuzzlePiece size={20} color="brand.primaryDark" />,
        roles: ["admin"]
    }, {
        id: 5,
        posicao: "esquerda",
        titulo: "Questões",
        rota: "/banco-questoes",
        icone: <FaPencilAlt size={20} color="brand.primaryDark" />,
        roles: ["admin"]
    }, /*{
        id: 6,
        posicao: "esquerda",
        titulo: "Modo Aventureiro",
        icone: <FaEye size={20} color="brand.primaryDark" />,
        roles: ["admin"],
        children: [
            {   id: 1,
                titulo: "Mapa", 
                rota: "/tela-principal",
            }, {   id: 2,
                titulo: "Trilhas Temáticas", 
                rota: "/tela-principal",
                /*
                    {   id: 1,
                titulo: "Temática de Legislação", 
                rota: "/tela-principal/legislacao",
            }, {

                id: 2,
                titulo: "Temática de Transferência Tecnológica",
                rota: "/tela-principal/transferenciaTecnologica",
            }, {

                id: 3,
                titulo: "Temática de Propriedade Intelectual",
                rota: "/tela-principal/propriedadeIntelectual",
            }, {
                id: 4,
                titulo: "Temática de Ambientes de Inovação",
                rota: "/tela-principal/ambientesInovacao",
            }
                */
            /*}, {   id: 3,
                titulo: "Distintivos", 
                rota: "/distintivos",
            }],
    },*/ {
        id: 7,
        posicao: "esquerda",
        titulo: "Mapa",
        rota: "/trilhaFormativaInovacao",
        icone: <FaMap size={20} color="brand.primaryDark" />,
        roles: ["usuario"]
    }, {
        id: 8,
        posicao: "esquerda",
        titulo: "Trilhas Temáticas",
        rota: "#",
        icone: <FaMapSigns size={20} color="brand.primaryDark" />,
        roles: ["usuario"],
        children: [
            {
                id: 4,
                titulo: "Temática de Ambientes de Inovação",
                rota: "/trilhaFormativaInovacao/ambientesInovacao",
            }, {   id: 1,
                titulo: "Temática de Legislação", 
                rota: "/trilhaFormativaInovacao/legislacao",
            }, {

                id: 3,
                titulo: "Temática de Propriedade Intelectual",
                rota: "/trilhaFormativaInovacao/propriedadeIntelectual",
            }, {

                id: 2,
                titulo: "Temática de Transferência Tecnológica",
                rota: "/trilhaFormativaInovacao/transferenciaTecnologica",
            }],
    }, {
        id: 9,
        posicao: "esquerda",
        titulo: "Distintivos",
        rota: "/distintivos",
        icone: <FaAward size={20} color="brand.primaryDark" />,
        roles: ["usuario"]
    }, /*{
        id: 10,
        posicao: "esquerda",
        titulo: "Concluir",
        rota: "/concluir/:idParam?",
        icone: <FaTrophy size={20} color="brand.primaryDark" />,
        roles: ["usuario"]
    },*/ {
        id: 11,
        posicao: "esquerda",
        titulo: user?.nomeAventureiro ?? "Nome Aventureiro",
        rota: "/dadosAventureiro",
        icone: <FaUserAlt size={20} color="brand.primaryDark" />,
        roles: ["usuario"],
    }, {
        id: 12,
        posicao: "esquerda",
        titulo: "Sair",
        rota: "/",
        roles: ["admin", "usuario"],
    }, {
        id: 13,
        posicao: "direita",
        titulo: "Home",
        rota: "/",
        roles: [""],
        variante: "ghost"
    }, {
        id: 14,
        posicao: "direita",
        titulo: "Entrar",
        rota: "/login",
        roles: [""],
        variante: "outline"
    }, {
        id: 15,
        posicao: "direita",
        titulo: "Começar Jornada",
        rota: "/cadastroAventureiro",
        roles: [""],
        variante: "solid"
    }
]
}