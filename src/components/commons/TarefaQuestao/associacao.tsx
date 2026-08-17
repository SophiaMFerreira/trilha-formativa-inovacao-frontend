import { Box, Editable, List, SimpleGrid, Stack, Text } from "@chakra-ui/react"
import CaixaAlternativa from "./caixaAlternativa"
import { estilosAlternativa } from "@/config/alternativasEstiloConfig"

import { shuffleArray } from "@/utils/shuffle"
import { useMemo, useState } from "react"

import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { QuestaoProp } from "@/types_consts/questao"
import { Alternativa, AlternativaAssociacao } from "@/types_consts/alternativa"

export type colunasAssociadas = {
    colunaA: Alternativa[]
    colunaB: Alternativa[]
}
type AssociacaoProps = {
    questao: QuestaoProp;
    onChange: (value: colunasAssociadas) => void;
};
export default function Associacao({ questao, onChange }: AssociacaoProps) {
    const { colunaA, colunaB } = useMemo(() => {
        const colunaA = [];
        const colunaB = [];
        const usadas = new Set<number>();
        const alternativas = questao.alternativas as AlternativaAssociacao[]

        for (const alternativa of alternativas) {
            if (usadas.has(alternativa.id)) continue;

            const associada = questao.alternativas.find(
                a => a.id === alternativa.alternativaAssociada.id
            );

            if (!associada) continue;

            colunaA.push(alternativa);
            colunaB.push(associada);

            usadas.add(alternativa.id);
            usadas.add(associada.id);
        }

        return {
            colunaA: shuffleArray(colunaA),
            colunaB: shuffleArray(colunaB),
        };
    }, [questao.id]);

    const [colA, setColA] = useState<Alternativa[]>(colunaA);
    const [colB, setColB] = useState<Alternativa[]>(colunaB);

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
                onDragEnd={(event) => {
                    const from = event.operation.source?.data.index;
                    const to = event.operation.target?.data.index;

                    if (from == null || to == null) return;

                    setColA((items) => {
                        const novo = [...items];
                        const [item] = novo.splice(from, 1);
                        novo.splice(to, 0, item);
                        return novo;
                    });
                }}
            >
                <Stack gap="5"
                    onChange={() => onChange({
                        colunaA: colA,
                        colunaB: colB
                    } as colunasAssociadas
                    )}
                >
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
                onDragEnd={(event) => {
                    const from = event.operation.source?.data.index;
                    const to = event.operation.target?.data.index;

                    if (from == null || to == null) return;

                    setColB((items) => {
                        const novo = [...items];
                        const [item] = novo.splice(from, 1);
                        novo.splice(to, 0, item);
                        return novo;
                    });
                }}
            >
                <Stack gap="5"
                    onChange={() => onChange({
                        colunaA: colA,
                        colunaB: colB
                    } as colunasAssociadas
                    )}
                >
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
    const colunaB: Alternativa[] = [];
    const usadas = new Set<number>();

    for (const alternativa of alternativas) {
        if (!("alternativaAssociada" in alternativa)) return;
        if (usadas.has(alternativa.id)) continue;

        const associada = alternativas.find(
            a => a.id === alternativa.alternativaAssociada.id
        );

        if (!associada) continue;

        colunaA.push(alternativa);
        colunaB.push(associada);

        usadas.add(alternativa.id);
        usadas.add(associada.id);
    }

    const estiloClaro = estilosAlternativa[0]
    const estiloEscuro = estilosAlternativa[1]

    return (
        <SimpleGrid
            columns={{ base: 1, lg: 2 }}
            gap="6"
            w="100%"
        >
            <Stack gap="5">
                {colunaA.map(alternativa => (
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
            <Stack gap="5"
                onChange={() => onChange({
                    colunaA: colunaA,
                    colunaB: colunaB
                } as colunasAssociadas
                )}
            >
                {colunaB.map(alternativa => (
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
    const colunaB: Alternativa[] = [];
    const usadas = new Set<number>();

    for (const alternativa of alternativas) {
        if (!("alternativaAssociada" in alternativa)) return;
        if (usadas.has(alternativa.id)) continue;

        const associada = alternativas.find(
            a => a.id === alternativa.alternativaAssociada.id
        );

        if (!associada) continue;

        colunaA.push(alternativa);
        colunaB.push(associada);

        usadas.add(alternativa.id);
        usadas.add(associada.id);
    }

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
                    {colunaA.map(alternativa => (
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
                    {colunaB.map(alternativa => (
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