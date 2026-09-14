import { IntroCarrossel } from "@/types_consts/carrossel";
import { FaBook, FaGamepad, FaRoute, FaTrophy } from "react-icons/fa";

export const carrosselIntroducao : IntroCarrossel[] = [
    {
        id: 1,
        titulo: "Explore as trilhas no seu ritmo!",
        conteudo: "Escolha uma temática e faça as missões na ordem que preferir. Não existe uma sequência obrigatória.",
        icone: <FaRoute size={24} color="brand.primaryDark"/>,
        imagem: "imagemMissoes",
    },
    {
        id: 2,
        titulo: "Aprenda com as missões",
        conteudo: "Algumas missões apresentam um conteúdo para você explorar. Complete as missões que quiser para avançar no seu aprendizado.",
        icone: <FaBook size={24} color="brand.primaryDark"/>,
        imagem: "imagemConteudos",
    },
    {
        id: 3,
        titulo: "Teste seus conhecimentos",
        conteudo: "Ao longo da trilha, você encontrará quizzes com diferentes tipos de questões, como múltipla escolha e ordenação.",
        icone: <FaGamepad size={24} color="brand.primaryDark"/>,
        imagem: "imagemQuiz",
    },
    {
        id: 4,
        titulo: "Conclua a tarefa final",
        conteudo: "Ao finalizar a trilha, realize a tarefa final para colocar seus conhecimentos em prática e conquistar um distintivo.",
        icone: <FaTrophy size={24} color="brand.primaryDark"/>,
        imagem: "imagemTarefaFinal",
    },
];