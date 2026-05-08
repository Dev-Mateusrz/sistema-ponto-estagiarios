import { useEffect, useState } from "react";

type Academico = {
  id: number;
  matricula: string;
  nome: string;
  email: string;
  senha: string;
  ehAdmin: boolean;
};

function AdminDashboard() {
  const [academicos, setAcademicos] = useState<Academico[]>([]);

  const [matricula, setMatricula] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [ehAdmin, setEhAdmin] = useState(false);

  function carregarAcademicos() {
    fetch("http://localhost:5294/academicos")
      .then((res) => res.json())
      .then((dados) => setAcademicos(dados));
  }

  useEffect(() => {
    carregarAcademicos();
  }, []);

  async function cadastrarAcademico() {
    const resposta = await fetch(
      "http://localhost:5294/academicos",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matricula,
          nome,
          email,
          senha,
          ehAdmin,
        }),
      }
    );

    if (resposta.ok) {
      alert("Usuário cadastrado!");

      setMatricula("");
      setNome("");
      setEmail("");
      setSenha("");
      setEhAdmin(false);

      carregarAcademicos();
    } else {
      alert("Erro ao cadastrar.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-blue-600">
          Painel do Administrador
        </h1>

        <div className="mt-8 grid gap-4">
          <input
            type="text"
            placeholder="Matrícula"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            className="rounded-lg border p-3"
          />

          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="rounded-lg border p-3"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border p-3"
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="rounded-lg border p-3"
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={ehAdmin}
              onChange={(e) => setEhAdmin(e.target.checked)}
            />

            Usuário administrador
          </label>

          <button
            onClick={cadastrarAcademico}
            className="rounded-lg bg-blue-600 p-3 text-white"
          >
            Cadastrar Usuário
          </button>
        </div>

        <div className="mt-10 space-y-4">
          {academicos.map((academico) => (
            <div
              key={academico.id}
              className="rounded-xl border p-4"
            >
              <p>Matrícula: {academico.matricula}</p>

              <h2 className="text-xl font-bold">
                {academico.nome}
              </h2>

              <p>{academico.email}</p>

              <p>
                Perfil:{" "}
                {academico.ehAdmin
                  ? "Administrador"
                  : "Aluno"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
