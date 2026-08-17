import { Avatar, Box, IconButton, Input } from "@chakra-ui/react";
import { ChangeEvent, useRef } from "react";
import { FaCamera } from "react-icons/fa";
import CustomTooltip from "./commons/customTooltip";

type AvatarUsuarioProps = {
  imagem?: string;
  onChange: (file: File, preview: string) => void;
};

export function AvatarUsuario({
  imagem,
  onChange,
}: AvatarUsuarioProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const selecionarImagem = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const preview = URL.createObjectURL(file);

    onChange(file, preview);
  };

  return (
    <Box position="relative" w="fit-content">
      <Avatar.Root
        h={{ base: "24", md: "32", lg: "36" }}
        w={{ base: "24", md: "32", lg: "36" }}
        bg="gray.200"
      >
        <Avatar.Fallback color="brand.neutral" />
        <Avatar.Image src={imagem} />
      </Avatar.Root>
      <CustomTooltip
        content="Alterar foto"
      >
        <IconButton
          aria-label="Alterar foto"
          size="sm"
          rounded="full"
          position="absolute"
          bottom="2"
          right="2"
          variant="solid"
          onClick={() => inputRef.current?.click()}
        >
          <FaCamera />
        </IconButton>
      </CustomTooltip>
      <Input
        ref={inputRef}
        type="file"
        accept="image/*"
        display="none"
        onChange={selecionarImagem}
      />
    </Box>
  );
}