import { useEffect, useState } from "react";

type Academico = {
  id: number;
  matricula: string;
  nome: string;
  email: string;
  ativo: boolean;
};

function App() {
  const [academicos, setAcademicos] = useState<Academico[]>([]);

  const [matricula, setMatricula] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");

  function carregarAcademicos() {
    fetch("http://localhost:5294/academicos")
      .then((resposta) => resposta.json())
      .then((dados) => setAcademicos(dados));
  }

  useEffect(() => {
    carregarAcademicos();
  }, []);

  function cadastrarAcademico() {
    fetch("http://localhost:5294/academicos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        matricula,
        nome,
        email,
        ativo: true,
      }),
    })
      .then(() => {
        carregarAcademicos();

        setMatricula("");
        setNome("");
        setEmail("");
      })
      .catch((erro) => console.error(erro));
  }

  function registrarEntrada(id: number) {
    fetch(`http://localhost:5294/registros-ponto/entrada/${id}`, {
      method: "POST",
    })
      .then(() => alert("Entrada registrada!"))
      .catch((erro) => console.error(erro));
  }

  function registrarSaida(id: number) {
    fetch(`http://localhost:5294/registros-ponto/saida/${id}`, {
      method: "POST",
    })
      .then(() => alert("Saída registrada!"))
      .catch((erro) => console.error(erro));
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-blue-600">
          Sistema de Ponto de Estagiários
        </h1>

        <div className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Matrícula"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            className="w-full rounded-lg border p-3"
          />

          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full rounded-lg border p-3"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border p-3"
          />

          <button
            type="button"
            onClick={cadastrarAcademico}
            className="w-full rounded-lg bg-blue-600 p-3 text-white"
          >
            Cadastrar Acadêmico
          </button>
        </div>

        <div className="mt-10 space-y-4">
          {academicos.map((academico) => (
            <div
              key={academico.id}
              className="rounded-xl border border-gray-200 p-4"
            >
              <p className="text-sm text-gray-500">
                Matrícula: {academico.matricula}
              </p>

              <h2 className="text-xl font-semibold">
                {academico.nome}
              </h2>

              <p>{academico.email}</p>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => registrarEntrada(academico.id)}
                  className="rounded-lg bg-green-600 px-4 py-2 text-white"
                >
                  Registrar Entrada
                </button>

                <button
                  onClick={() => registrarSaida(academico.id)}
                  className="rounded-lg bg-red-600 px-4 py-2 text-white"
                >
                  Registrar Saída
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
