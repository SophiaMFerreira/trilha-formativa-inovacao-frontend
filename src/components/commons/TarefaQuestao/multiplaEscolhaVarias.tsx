import { Checkbox, CheckboxCard, CheckboxGroup, Fieldset, Grid,Stack, Text } from "@chakra-ui/react"
import CaixaAlternativa from "./caixaAlternativa"
import { estilosAlternativa } from "@/config/alternativasEstiloConfig"

import type {QuestaoProp } from "@/types_consts/questao"
import { shuffleArray } from "@/utils/shuffle"
import { useMemo } from "react"

type QuestaoProps = {
  questao: QuestaoProp;
  value: string[];
  onChange: (value: string[]) => void;
};

export function MultiplaEscolhaVarias({ questao, value, onChange }: QuestaoProps) {
  const alternativas = useMemo(
    () => shuffleArray([...questao.alternativas]),
    [questao.id]
  );

  return (
    <CheckboxGroup
      value={value}
      onValueChange={(values) => onChange(values)}
>
  <Grid
    templateColumns={{
      base: "1fr",
      md: "repeat(2, 1fr)",
    }}
    gap="4"
  >
        {alternativas.map(
          (alternativa, index) => {
            const estilo = estilosAlternativa[index % estilosAlternativa.length]

            return (
              <CheckboxCard.Root
                key={alternativa.id}
                value={String(alternativa.id)}
              >
                <CheckboxCard.HiddenInput />
                <CheckboxCard.Control unstyled>
                  <CaixaAlternativa
                    texto={alternativa.texto}
                    estilo={estilo}
                  />
                </CheckboxCard.Control>
              </CheckboxCard.Root>
            )
          })
        }
    </Grid>
    </CheckboxGroup>
  )
}

type QuestaoCheckboxProps = {
  questao: QuestaoProp;
  index: number;
  value: string[];
  onChange: (value: string[]) => void;
};
export function QuestaoCheckbox({
  questao,
  index,
  value,
  onChange,
}: QuestaoCheckboxProps) {
  const alternativas = useMemo(
    () => shuffleArray([...questao.alternativas]),
    [questao.id]
  );

  return (
    <Fieldset.Root>
      <Fieldset.Legend
        textStyle="bodyTextBold"
        color="brand.primaryDark"
      >
        Questão {String(index + 1).padStart(2, "0")}:
      </Fieldset.Legend>
      <Text mt="1">
        {questao.enunciado}
      </Text>
      <CheckboxGroup
        value={value}
        onValueChange={(values) => onChange(values)}
      >
        <Fieldset.Content
          mt="-2"
          ml="5"
        >
          <Stack gap="1.5">
            {alternativas.map((alternativa) => (
              <Checkbox.Root
                key={alternativa.texto}
                value={alternativa.texto}
                size="sm"
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control
                  borderColor="brand.neutral"
                  _checked={{
                    borderColor: "brand.neutral",
                    bg: "brand.secondary",
                    color: "brand.white",
                  }}

                />
                <Checkbox.Label
                  color="brand.neutral"
                  textStyle="inputPlaceholder"
                >
                  {alternativa.texto}
                </Checkbox.Label>
              </Checkbox.Root>
            ))}
          </Stack>
        </Fieldset.Content>
      </CheckboxGroup>
    </Fieldset.Root>
  )
}