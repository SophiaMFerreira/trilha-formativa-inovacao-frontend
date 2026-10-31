import { Tooltip } from "@chakra-ui/react"
import type { ReactNode } from "react"

type CustomTooltipProps = {
  content: string
  children: ReactNode
  open?: boolean
}

export default function CustomTooltip({ content,  children, open }: CustomTooltipProps) {
  return (
    <Tooltip.Root 
      openDelay={800}
      open={open}
    >
      <Tooltip.Trigger asChild>
        {children}
      </Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content
          bg="brand.primaryDark"
          color="brand.white"
          px="3"
          py="2"
          rounded="md"
          textStyle="inputPlaceholder"
          animationDuration="fast"
          borderStyle="none"
        >
          {content}
        </Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  )
}