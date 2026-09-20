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
        const ordemSalva = ordenarPelaResposta(paresA, paresB, value);

        if (ordemSalva) return ordemSalva;

        return {
            colunaA: shuffleArray(paresA) as Alternativa[],
            colunaB: shuffleArray(paresB) as AlternativaAssocida[],
        };
    }, [questao.id]);

    const [colA, setColA] = useState<Alternativa[]>(colunaA);
    const [colB, setColB] = useState<AlternativaAssocida[]>(colunaB);

    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
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