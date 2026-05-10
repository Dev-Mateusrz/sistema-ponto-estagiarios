import { useEffect, useState } from "react";

type Usuario = {
  id: number;
  nome: string;
  email: string;
  matricula: string;
};

function AlunoDashboard() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario");

    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
  }, []);

  async function registrarEntrada() {
    if (!usuario) {
      alert("Usuário não encontrado. Faça login novamente.");
      return;
    }

    const resposta = await fetch(
      `http://localhost:5294/registros-ponto/entrada/${usuario.id}`,
      { method: "POST" }
    );

    if (resposta.ok) {
      alert("Entrada registrada!");
    } else {
      alert("Erro ao registrar entrada.");
    }
  }

  async function registrarSaida() {
    if (!usuario) {
      alert("Usuário não encontrado. Faça login novamente.");
      return;
    }

    const resposta = await fetch(
      `http://localhost:5294/registros-ponto/saida/${usuario.id}`,
      { method: "POST" }
    );

    if (resposta.ok) {
      alert("Saída registrada!");
    } else {
      alert("Erro ao registrar saída.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-blue-600">
          Dashboard do Aluno
        </h1>

        <p className="mt-2 text-gray-600">
          Bem-vindo(a), {usuario?.nome}
        </p>

        <div className="mt-8 rounded-xl border p-6">
          <h2 className="text-xl font-semibold">
            Registro de Ponto
          </h2>

          <div className="mt-4 flex gap-4">
            <button
              onClick={registrarEntrada}
              className="rounded-lg bg-green-600 px-4 py-2 text-white"
            >
              Registrar Entrada
            </button>

            <button
              onClick={registrarSaida}
              className="rounded-lg bg-red-600 px-4 py-2 text-white"
            >
              Registrar Saída
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlunoDashboard;
