import { Box, Editable, List, SimpleGrid, Stack, Text } from "@chakra-ui/react"
import CaixaAlternativa from "./caixaAlternativa"
import { estilosAlternativa } from "@/config/alternativasEstiloConfig"

import { shuffleArray } from "@/utils/shuffle"
import { useEffect, useMemo, useRef, useState } from "react"

import { DragDropProvider } from '@dnd-kit/react';
import { move } from '@dnd-kit/helpers';
import { useSortable } from '@dnd-kit/react/sortable';
import { QuestaoProp } from "@/types_consts/questao"
import { Alternativa, AlternativaAssociacao, AlternativaAssocida, AlternativaMarcadaAssociacaoDTO, AlternativaMarcadaDTO } from "@/types_consts/alternativa"

export type colunasAssociadas = {
    colunaA: Alternativa[]
    colunaB: AlternativaAssocida[]
    index?: number
}
type AssociacaoProps = {
    questao: QuestaoProp;
    /**
     * Resposta já registrada para esta questão, usada para remontar a
     * ordem das colunas quando a tela volta a exibi-la.
     */
    value?: AlternativaMarcadaDTO[];
    onChange: (alternativasAssociadasresposta: colunasAssociadas) => void;
};

/**
 * Reconstrói a ordem das colunas a partir da resposta já registrada.
 *
 * Devolve null quando não há resposta utilizável — primeira visita à
 * questão, resposta de outra questão, ou questão editada depois de
 * respondida. Nesses casos o componente embaralha, que é o
 * comportamento de quem está vendo a questão pela primeira vez.
 */
function ordenarPelaResposta(
    paresA: AlternativaAssociacao[],
    paresB: AlternativaAssocida[],
    value: AlternativaMarcadaDTO[] | undefined
): { colunaA: Alternativa[]; colunaB: AlternativaAssocida[] } | null {
    if (!value || value.length !== paresA.length) return null;

    const porIdA = new Map(paresA.map(a => [a.id, a]));
    const porIdB = new Map(paresB.map(b => [b.id, b]));

    const colunaA: Alternativa[] = [];
    const colunaB: AlternativaAssocida[] = [];

    for (const marcada of value) {
        const alternativa = porIdA.get(marcada.idAlternativa);

        const idAssociada =
            (marcada as AlternativaMarcadaAssociacaoDTO)
                .idAlternativaAssociadaRespondida;

        const associada = idAssociada === undefined
            ? undefined
            : porIdB.get(idAssociada);

        if (!alternativa || !associada) return null;

        colunaA.push(alternativa);
        colunaB.push(associada);
    }

    return { colunaA, colunaB };
}
/**
 * Emparelha as duas colunas pela posição, que é como o usuário lê a
 * tela: a linha 1 da coluna A responde a linha 1 da coluna B.
 *
 * As listas são truncadas ao menor comprimento. Uma questão de
 * associação gravada pela metade (alternativa sem par) deixava
 * `colunaB[i]` indefinido e o consumidor estourava ao ler `.id`.
 */
function emparelhar(
    colunaA: Alternativa[],
    colunaB: AlternativaAssocida[]
): colunasAssociadas {
    const tamanho = Math.min(colunaA.length, colunaB.length);

    return {
        colunaA: colunaA.slice(0, tamanho),
        colunaB: colunaB.slice(0, tamanho),
    };
}

export default function Associacao({ questao, value, onChange }: AssociacaoProps) {
    const { colunaA, colunaB } = useMemo(() => {
        const alternativas = questao.alternativas as AlternativaAssociacao[]
        const paresA: AlternativaAssociacao[] = [];
        const paresB: AlternativaAssocida[] = [];

        for (const alternativa of alternativas) {
            if (!alternativa?.alternativaAssociada) continue;

            paresA.push(alternativa);
            paresB.push(alternativa.alternativaAssociada);
        }

        /*
         * No quiz cada pergunta é montada e desmontada conforme o
         * aventureiro navega, e a chave é o id da questão: voltar para
         * uma questão já respondida remontava o componente do zero e
         * embaralhava tudo de novo, descartando a associação que ele
         * tinha acabado de montar. Retomar a ordem da resposta já
         * registrada resolve — o embaralhamento fica só para a
         * primeira visita.
         *
         * O valor é lido apenas na montagem, de propósito: depois
         * disso quem manda na ordem é o arraste.
         */
        const ordemSalva = ordenarPelaResposta(paresA, paresB, value);

        if (ordemSalva) return ordemSalva;

        return {
            colunaA: shuffleArray(paresA) as Alternativa[],
            colunaB: shuffleArray(paresB) as AlternativaAssocida[],
        };
    }, [questao.id]);

    const [colA, setColA] = useState<Alternativa[]>(colunaA);
    const [colB, setColB] = useState<AlternativaAssocida[]>(colunaB);

    /*
     * O onChange chega como arrow nova a cada renderização do pai;
     * guardá-lo em ref é o que permite reagir só à mudança das
     * colunas, sem reemitir a cada render.
     */
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    /*
     * A resposta sobe daqui, e não de um onChange no <Stack>.
     *
     * O <Stack> vira uma <div> e os itens arrastáveis não têm
     * controle de formulário algum: o evento DOM "change" nunca
     * borbulhava até ele, então a associação NUNCA era reportada ao
     * quiz e o payload ia para a API com idAlternativa -1. Reagir à
     * mudança das colunas cobre os dois caminhos — o arraste e o
     * emparelhamento inicial, que é uma resposta válida por si só,
     * já que as colunas chegam embaralhadas.
     */
    useEffect(() => {
        onChangeRef.current(emparelhar(colA, colB));
    }, [colA, colB]);

    const estiloClaro = estilosAlternativa.find(
        (estilo) => estilo.className === "itemPLight"
    )
    const estiloEscuro = estilosAlternativa.find(
        (estilo) => estilo.className === "itemPDark"
    )

    return (
        <SimpleGrid
            columns={{ base: 1, lg: 2 }}
            gap="6"
            w="100%"
        >
            {/*
              * Reordenação pelo helper move() do @dnd-kit, como já era
              * feito em ordenacao.tsx.
              *
              * A versão anterior lia event.operation.source.data.index.
              * "data" é o objeto arbitrário que o consumidor passa a
              * useSortable e aqui ele nunca foi passado, então vinha
              * {} e data.index era undefined: a guarda logo abaixo
              * descartava todo arraste e a lista nunca mudava. O índice
              * existe, mas direto no sortable (source.index), e não
              * dentro de data — e move() já resolve isso sozinho.
              *
              * onDragOver, e não onDragEnd: é o que reordena durante o
              * arraste, em vez de o item voltar ao lugar e só então
              * saltar para a posição nova.
              */}
            <DragDropProvider
                onDragOver={(event) => {
                    setColA((items) => move(items, event));
                }}
            >
                <Stack gap="5">
                    {colA.map((alternativa, index) => (
                        <Sortable
                            key={alternativa.id}
                            id={alternativa.id}
                            index={index}
                            alternativa={alternativa.texto}
                            estilo={estiloClaro}
                        />
                    ))}
                </Stack>
            </DragDropProvider>
            <DragDropProvider
                onDragOver={(event) => {
                    setColB((items) => move(items, event));
                }}
            >
                <Stack gap="5">
                    {colB.map((alternativa, index) => (
                        <Sortable
                            key={alternativa.id}
                            id={alternativa.id}
                            index={index}
                            alternativa={alternativa.texto}
                            estilo={estiloEscuro}
                        />
                    ))}
                </Stack>
            </DragDropProvider>
        </SimpleGrid>
    )
}

type sortableProps = {
    id: number
    index: number
    alternativa: string
    estilo: any
}
function Sortable({ id, index, alternativa, estilo }: sortableProps) {
    const { ref } = useSortable({ id, index });
    return (
        <Box
            ref={ref}
        >
            <CaixaAlternativa
                texto={alternativa}
                estilo={estilo}
                minH={true}
            />
        </Box>
    )
}

type AssociacaoCadastroProps = {
    alternativas: Alternativa[]
    onChange: (value: colunasAssociadas) => void;
}
export function AssociacaoCadastroQuiz({ alternativas, onChange }: AssociacaoCadastroProps) {
    const colunaA: Alternativa[] = [];
    const colunaB: AlternativaAssocida[] = [];

    alternativas.map(alternativa => {
        if (!("alternativaAssociada" in alternativa)) return;

        colunaA.push(alternativa);
        colunaB.push(alternativa.alternativaAssociada);
    })

    const estiloClaro = estilosAlternativa[0]
    const estiloEscuro = estilosAlternativa[1]

    return (
        <SimpleGrid
            columns={{ base: 1, lg: 2 }}
            gap="6"
            w="100%"
        >
            <Stack gap="5">
                {colunaA.map((alternativa, index) => (
                    <Box
                        key={alternativa.id}

                        bg={estiloClaro.bg}
                        color={estiloClaro.color}
                        borderColor={estiloClaro.borderColor}
                        borderWidth="1px"
                        rounded="sm"
                        cursor="pointer"
                        minH="16"
                        shadow="card"
                        textStyle="emphasis"

                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        textAlign="center"

                        px="4"
                        py="3"
                    >
                        <Editable.Root
                            w="100%"
                            textAlign="center"
                            value={alternativa.texto}
                            placeholder="Conteúdo da alternativa"
                            onValueChange={(e) => {
                                const novasColA = colunaA.map(a =>
                                    a.id === alternativa.id
                                        ? { ...a, texto: e.value }
                                        : a
                                );

                                onChange({
                                    colunaA: novasColA,
                                    colunaB,
                                    index
                                })
                            }}
                        >
                            <Editable.Preview
                                w="100%"
                            />
                            <Editable.Input />
                        </Editable.Root>
                    </Box>
                ))}
            </Stack>
            {/*
              * Sem onChange no Stack: o evento change do input interno
              * borbulhava até aqui e chamava onChange SEM o índice da
              * linha, fazendo o consumidor ler colunaA[undefined] e
              * estourar ao acessar .id. Quem notifica a alteração é o
              * Editable.Root de cada célula, que sabe o índice.
              */}
            <Stack gap="5">
                {colunaB.map((alternativa, index) => (
                    <Box
                        key={alternativa.id}

                        bg={estiloEscuro.bg}
                        color={estiloEscuro.color}
                        borderColor={estiloEscuro.borderColor}
                        borderWidth="1px"
                        rounded="sm"
                        cursor="pointer"
                        minH="16"
                        shadow="card"
                        textStyle="emphasis"

                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        textAlign="center"

                        px="4"
                        py="3"
                    >
                        <Editable.Root
                            w="100%"
                            textAlign="center"
                            value={alternativa.texto}
                            placeholder="Conteúdo da alternativa associada"
                            onValueChange={(e) => {
                                const novasColB = colunaB.map(a =>
                                    a.id === alternativa.id
                                        ? { ...a, texto: e.value }
                                        : a
                                );

                                onChange({
                                    colunaA,
                                    colunaB: novasColB,
                                    index
                                })
                            }}
                        >
                            <Editable.Preview
                                w="100%"
                            />
                            <Editable.Input />
                        </Editable.Root>
                    </Box>
                ))}
            </Stack>
        </SimpleGrid >
    )
}


export function AssociacaoCadastroTarefa({ alternativas, onChange }: AssociacaoCadastroProps) {
    const colunaA: Alternativa[] = [];
    const colunaB: AlternativaAssocida[] = [];
    
    alternativas.map(alternativa => {
        if (!("alternativaAssociada" in alternativa)) return;

        colunaA.push(alternativa);
        colunaB.push(alternativa.alternativaAssociada);
    })

    return (
        <SimpleGrid
            columns={{ base: 1, lg: 2 }}
            gap="6"
            w="100%"
        >
            <Stack gap="5">
                <Text
                    color="brand.primaryDark"
                    textStyle="bodyTextBold"
                    textAlign="center"
                >
                    Coluna A
                </Text>
                <List.Root
                    as="ol"
                    listStyle="upper-alpha"
                    ml="10"
                    color="brand.neutral"
                    textStyle="bodyTextLong"
                >
                    {colunaA.map((alternativa, index) => (
                        <List.Item
                            key={alternativa.id}
                            _marker={{
                                color: "brand.neutral"
                            }}
                            color="brand.neutral"
                            textStyle="bodyTextLong"
                        >
                            <Editable.Root
                                w="100%"
                                textAlign="justify"
                                value={alternativa.texto}
                                placeholder="Conteúdo da alternativa"
                                onValueChange={(e) => {
                                    const novasColA = colunaA.map(a =>
                                        a.id === alternativa.id
                                            ? { ...a, texto: e.value }
                                            : a
                                    );

                                    onChange({
                                        colunaA: novasColA,
                                        colunaB,
                                        index
                                    })
                                }}
                            >
                                <Editable.Preview
                                    w="100%"
                                />
                                <Editable.Input />
                            </Editable.Root>
                        </List.Item>
                    )
                    )}
                </List.Root>
            </Stack>
            <Stack gap="5">
                <Text
                    color="brand.primaryDark"
                    textStyle="bodyTextBold"
                    textAlign="center"
                >
                    Coluna B
                </Text>
                <List.Root
                    as="ol"
                    listStyle="upper-roman"
                    ml="10"
                    color="brand.neutral"
                    textStyle="bodyTextLong"
                >
                    {colunaB.map((alternativa, index) => (
                        <List.Item
                            key={alternativa.id}
                            _marker={{
                                color: "brand.neutral"
                            }}
                            color="brand.neutral"
                            textStyle="bodyTextLong"
                        >
                            <Editable.Root
                                w="100%"
                                textAlign="justify"
                                value={alternativa.texto}
                                placeholder="Conteúdo da alternativa"
                                onValueChange={(e) => {
                                    const novasColB = colunaB.map(a =>
                                        a.id === alternativa.id
                                            ? { ...a, texto: e.value }
                                            : a
                                    );

                                    onChange({
                                        colunaA,
                                        colunaB: novasColB,
                                        index
                                    })
                                }}
                            >
                                <Editable.Preview
                                    w="100%"
                                />
                                <Editable.Input />
                            </Editable.Root>
                        </List.Item>
                    )
                    )}
                </List.Root>
            </Stack>
        </SimpleGrid >
    )
}