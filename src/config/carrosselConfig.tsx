import { CardCarrossel } from "@/types_consts/carrossel";
import { FaAward, FaBookOpen, FaGamepad, FaRegFlag, FaShieldAlt, FaStar } from "react-icons/fa";

export const carrosselConteudo: CardCarrossel[] = [
    {   
        id: 1,
        titulo: "Leituras",
        conteudo: "Explore conteúdos cuidadosamente preparados para ampliar seus conhecimentos de forma prática e envolvente.",
        icone: <FaBookOpen size={60} color="brand.primaryDark"/>
    }, {   
        id: 2,
        titulo: "Missões",
        conteudo: "Complete missões, avance na trilha e transforme seu aprendizado em conquistas.",
        icone: <FaRegFlag size={60} color="brand.primaryDark"/>
    }, {   
        id: 3,
        titulo: "Jogos",
        conteudo: "Aprenda enquanto se diverte com jogos interativos que tornam cada etapa mais dinâmica.",
        icone: <FaGamepad size={60} color="brand.primaryDark"/>
    }, {   
        id: 4,
        titulo: "Desafios",
        conteudo: "Teste seus conhecimentos em desafios e mostre que você está pronto para o próximo nível.",
        icone: <FaShieldAlt size={60} color="brand.primaryDark"/>
    }, {   
        id: 5,
        titulo: "Pontos",
        conteudo: "Ganhe pontos a cada conquista e acompanhe sua evolução ao longo da jornada.",
        icone: <FaStar size={60} color="brand.primaryDark"/>
    }, {   
        id: 6,
        titulo: "Distintivos",
        conteudo: "Colecione distintivos exclusivos e registre suas principais conquistas durante a trilha.",
        icone: <FaAward size={60} color="brand.primaryDark"/>
    }
]