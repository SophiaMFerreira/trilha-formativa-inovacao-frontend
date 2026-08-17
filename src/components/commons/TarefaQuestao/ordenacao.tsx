import { Box, Editable, HStack, List, Stack } from "@chakra-ui/react"
import CaixaAlternativa from "./caixaAlternativa"
import { estilosAlternativa } from "@/config/alternativasEstiloConfig"

import { shuffleArray } from "@/utils/shuffle"
import { QuestaoProp } from "@/types_consts/questao"
import { ReactNode, useEffect, useMemo, useState } from "react"

import { DragDropProvider, useDroppable } from '@dnd-kit/react';
import { move } from '@dnd-kit/helpers';
import { useSortable } from "@dnd-kit/react/sortable"
import { Alternativa, AlternativaOrdenacao, AlternativaOrdenacaoDTO } from "@/types_consts/alternativa"

type OrdenacaoProps = {
    questao: QuestaoProp
    //value: number[]
    onChange: (value: number[]) => void
};

export default function Ordenacao({ questao, onChange }: OrdenacaoProps) {
    const alternativas = useMemo(
        () => shuffleArray([...questao.alternativas]) as AlternativaOrdenacaoDTO[],

        [questao.id]
    );

    const mapaLista = new Map(
        alternativas.map(a => [a.texto, a.id])
    );

    const [listas, setListas] = useState({
        origem: alternativas.map(alternativa => alternativa.texto) as string[],
        resposta: [] as string[],
    });

    function handleDragOver(event: any) {
    const novaLista = move(listas, event);

    setListas(novaLista);

    onChange(
        novaLista.resposta
            .map(texto => mapaLista.get(texto))
            .filter((id): id is number => id !== undefined)
    );
}
    /*useEffect(() => {
        const novaOrigem =
            value.length !== 0
                ? alternativas
                    .filter(alternativa => !value.includes(alternativa.id!))
                    .map(alternativa => alternativa.texto)
                : alternativas.map(alternativa => alternativa.texto);

        const novaResposta = value
            .map(id =>
                alternativas.find(alternativa => alternativa.id === id)?.texto
            )
            .filter((texto): texto is string => texto !== undefined);

        setListas({
            origem: novaOrigem,
            resposta: novaResposta,
        });
    }, [questao.id, alternativas, value]);*/

    const estilos = useMemo(
        () =>
            Object.fromEntries(
                alternativas.map((alternativa, i) => [
                    alternativa.texto,
                    estilosAlternativa[i % estilosAlternativa.length],
                ])
            ),
        [alternativas]
    );

    return (
        <>
            <DragDropProvider
                 onDragOver={handleDragOver}
            >
                <Stack
                    gap="10"
                    w="100%"
                >
                    <HStack
                        w="100%"
                        minH="110px"
                        gap="3"
                        align="stretch"
                        borderRadius="lg"
                        key="origem"
                        id="origem"
                    >
                        {listas.origem.map((alternativa, index) => (
                            <Sortable
                                key={alternativa}
                                id={alternativa}
                                index={index}
                                row="origem"
                                alternativa={alternativa}
                                estilo={estilos[alternativa]}
                            />
                        ))}
                    </HStack>
                    <Linha key="resposta" id="resposta">
                        {listas.resposta.map((alternativa, index) => (
                            <Sortable
                                key={alternativa}
                                id={alternativa}
                                index={index}
                                row="resposta"
                                alternativa={alternativa}
                                estilo={estilos[alternativa]}
                            />
                        ))}
                    </Linha>
                </Stack>
            </DragDropProvider>
        </>
    )
}

type sortableProps = {
    id: string
    index: number
    alternativa: string
    estilo: any
    row: string
}
function Sortable({ id, index, alternativa, estilo, row }: sortableProps) {
    const { ref } = useSortable({
        id,
        index,
        group: row,
        type: 'item',
        accept: ['item'],
    });


    return (
        <Box
            ref={ref}
            w="100%"
            maxW="160px">
            <CaixaAlternativa
                texto={alternativa}
                estilo={estilo}
            />
        </Box>
    )
}

type columnProps = {
    id: string
    children: ReactNode
}
function Linha({ children, id }: columnProps) {
    const { ref } = useDroppable({
        id,
        type: 'row',
        accept: ['item'],
    });

    return (
        <HStack
            ref={ref}
            w="100%"
            minW="500px"
            minH="110px"
            gap="3"
            align="stretch"
            borderRadius="lg"
            bg="#2f9e411f"
        >
            {children}
        </HStack>
    );
}

type OrdenacaoCadastroProps = {
    alternativas: Alternativa[];
    onChange: (value: string, index: number) => void;
};

export function OrdenacaoCadastroQuiz({ alternativas, onChange }: OrdenacaoCadastroProps) {
    return (
        <HStack
            gap="3"
            align="center"
            w="100%"
        >
            {alternativas.map(
                (alternativa, i) => {
                    const estilo = estilosAlternativa[i % estilosAlternativa.length]
                    if (!("numeroSequencia" in alternativa)) return

                    return (
                        <Editable.Root
                            key={alternativa.id}

                            w="100%"
                            textAlign="center"
                            value={alternativa.texto}
                            onValueChange={(e) => onChange(e.value, i)}
                            placeholder="Conteúdo da alternativa"

                            bg={estilo.bg}
                            color={estilo.color}
                            borderColor={estilo.borderColor}
                            borderWidth="1px"
                            rounded="sm"
                            cursor="pointer"
                            minH="110px"
                            shadow="card"
                            textStyle="emphasis"

                            display="flex"
                            alignItems="center"
                            justifyContent="center"

                            px="4"
                            py="3"
                        >
                            <Editable.Preview
                                w="100%"
                            />
                            <Editable.Input />
                        </Editable.Root>
                    )
                }
            )}
        </HStack>
    )
}

export function OrdenacaoCadastroTarefa({ alternativas, onChange }: OrdenacaoCadastroProps) {
    return (
        <List.Root
            as="ol"
            ml="10"
        >
            {alternativas.map((alternativa, i) => {
                if (!("numeroSequencia" in alternativa)) return
                return (
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
                            onValueChange={(e) => onChange(e.value, i)}
                            placeholder="Conteúdo da alternativa"
                        >
                            <Editable.Preview
                                w="100%"
                            />
                            <Editable.Input />
                        </Editable.Root>
                    </List.Item>
                )
            })}
        </List.Root>
    )
}