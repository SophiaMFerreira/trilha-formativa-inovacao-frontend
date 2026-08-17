import { useAuth } from "@/hooks/useAuth"
import { Navigate } from "react-router-dom"

type Props = {
  children: React.ReactNode
  roles: string[]
}

export default function RoleRoute({
  children,
  roles,
}: Props) {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (!roles.includes(user.role)) {
    return <Navigate to="/nao-autorizado" replace />
  }

  return children
}