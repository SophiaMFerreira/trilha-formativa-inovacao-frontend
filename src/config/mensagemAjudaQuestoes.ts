import { SubtipoAlternativa, TipoAlternativa } from "@/types_consts/alternativa";

export const mensagensAjudaQuestoesModal: Record<
    TipoAlternativa | SubtipoAlternativa,
    string
> = {
    [TipoAlternativa.ASSOCIACAO]: "Preencha os itens da primeira coluna e, ao lado, informe a alternativa correspondente a cada um deles. Cada linha deve representar um par de associação correto.",
    [TipoAlternativa.ORDENACAO]: "Preencha os itens que deverão ser organizados pelo participante considerando a sequência esperada como resposta.",
    [SubtipoAlternativa.MULTIPLA_ESCOLHA]: "Preencha cada alternativa com uma possível resposta para a questão. Em seguida, selecione apenas a alternativa que corresponde à resposta correta.",
    [SubtipoAlternativa.VERDADEIRO_FALSO]: "Preencha as duas alternativas com as opções “Verdadeiro” e “Falso” ou similar. Em seguida, selecione a alternativa que representa a resposta correta.",
    [SubtipoAlternativa.MULTIPLAS_CORRETAS]: "Preencha cada alternativa com uma possível resposta para a questão. Em seguida, selecione todas as alternativas que devem ser consideradas corretas.",
}

export const mensagensAjudaQuestoes: Record<
    TipoAlternativa | SubtipoAlternativa,
    string
> = {
    [TipoAlternativa.ASSOCIACAO]: "Preencha os pares correspondentes em cada linha.",
    [TipoAlternativa.ORDENACAO]: "Adicione os itens já na sequência correta.",
    [SubtipoAlternativa.MULTIPLA_ESCOLHA]: "Adicione as opções e selecione a resposta correta.",
    [SubtipoAlternativa.VERDADEIRO_FALSO]: "Informe as duas opções e selecione a resposta correta.",
    [SubtipoAlternativa.MULTIPLAS_CORRETAS]: "Adicione as opções e selecione todas as respostas corretas.",
}