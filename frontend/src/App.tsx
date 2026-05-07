import { useEffect, useState } from "react";

type Academico = {
  id: number;
  nome: string;
  email: string;
  curso: string;
  ativo: boolean;
};

function App() {
  const [academicos, setAcademicos] = useState<Academico[]>([]);

  useEffect(() => {
    fetch("http://localhost:5294/academicos")
      .then((resposta) => resposta.json())
      .then((dados) => setAcademicos(dados))
      .catch((erro) => console.error("Erro ao buscar acadêmicos:", erro));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-blue-600">
          Sistema de Ponto de Estagiários
        </h1>

        <p className="mt-2 text-gray-600">
          Lista de acadêmicos cadastrados
        </p>

        <div className="mt-6 space-y-4">
          {academicos.map((academico) => (
            <div
              key={academico.id}
              className="rounded-xl border border-gray-200 p-4"
            >
              <h2 className="text-xl font-semibold">{academico.nome}</h2>
              <p className="text-gray-600">{academico.email}</p>
              <p className="text-gray-600">{academico.curso}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
