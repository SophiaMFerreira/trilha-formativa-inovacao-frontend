export type ItemMenu = {
  id: number
  posicao: "esquerda" | "direita"
  titulo: string
  rota?: string
  icone?: React.ReactNode
  roles: string[]
  children?: SubItemMenu[]
  variante?: "solid" | "outline" | "ghost"
}

export type SubItemMenu = {
  id: number
  titulo: string
  rota: string
  children?: ItemMenu[]
  variante?: "solid" | "outline" | "ghost"
}