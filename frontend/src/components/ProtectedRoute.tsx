import { Navigate } from "react-router-dom";

type ProtectedRouteProps = {
  children: React.ReactNode;

  adminOnly?: boolean;

  alunoOnly?: boolean;
};

function ProtectedRoute({
  children,

  adminOnly = false,

  alunoOnly = false,
}: ProtectedRouteProps) {
  const token = localStorage.getItem("token");

  const usuarioString =
    localStorage.getItem("usuario");

  if (!token || !usuarioString) {
    return <Navigate to="/" replace />;
  }

  const usuario = JSON.parse(usuarioString);

  if (adminOnly && !usuario.ehAdmin) {
    return <Navigate to="/" replace />;
  }

  if (alunoOnly && usuario.ehAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;