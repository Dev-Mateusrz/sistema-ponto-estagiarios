import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const navigate = useNavigate();

  async function fazerLogin() {
    const resposta = await fetch(
      "http://localhost:5294/academicos/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          senha,
        }),
      }
    );

    if (resposta.ok) {
      const usuario = await resposta.json();

localStorage.setItem("usuario", JSON.stringify(usuario));

      if (usuario.ehAdmin) {
        navigate("/admin");
      } else {
        navigate("/aluno");
      }

      console.log(usuario);
    } else {
      alert("Email ou senha inválidos.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="mb-6 text-3xl font-bold text-blue-600">
          Login
        </h1>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border p-3"
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full rounded-lg border p-3"
          />

          <button
            onClick={fazerLogin}
            className="w-full rounded-lg bg-blue-600 p-3 text-white"
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
