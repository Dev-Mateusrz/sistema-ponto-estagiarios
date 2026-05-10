import { useEffect, useState } from "react";

type Academico = {
  id: number;
  matricula: string;
  nome: string;
  email: string;
  senha: string;
  ehAdmin: boolean;
};

type RegistroPonto = {
  id: number;
  data: string;
  horaEntrada: string;
  horaSaida: string | null;
  totalTrabalhado: string | null;
  academico?: {
    matricula: string;
    nome: string;
    email: string;
  };
};

function AdminDashboard() {
  const [academicos, setAcademicos] = useState<Academico[]>([]);
  const [registros, setRegistros] = useState<RegistroPonto[]>([]);

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

  function carregarRegistros() {
    fetch("http://localhost:5294/registros-ponto")
      .then((res) => res.json())
      .then((dados) => setRegistros(dados));
  }

  useEffect(() => {
    carregarAcademicos();
    carregarRegistros();
  }, []);

  async function cadastrarAcademico() {
    const resposta = await fetch("http://localhost:5294/academicos", {
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
    });

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

  async function excluirAcademico(id: number) {
  const confirmar = confirm(
    "Tem certeza que deseja excluir este usuário?"
  );

  if (!confirmar) return;

  const resposta = await fetch(
    `http://localhost:5294/academicos/${id}`,
    {
      method: "DELETE",
    }
  );

  if (resposta.ok) {
    carregarAcademicos();
  } else {
    alert("Erro ao excluir usuário.");
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

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-800">
            Registros de Ponto
          </h2>

          <div className="mt-4 space-y-4">
            {registros.map((registro) => (
              <div key={registro.id} className="rounded-xl border p-4">
                <p>
                  <strong>Matrícula:</strong>{" "}
                  {registro.academico?.matricula ?? "Não informada"}
                </p>

                <p>
                  <strong>Nome:</strong>{" "}
                  {registro.academico?.nome ?? "Não informado"}
                </p>

                <p>
                  <strong>Entrada:</strong>{" "}
                  {new Date(registro.horaEntrada).toLocaleString()}
                </p>

                <p>
                  <strong>Saída:</strong>{" "}
                  {registro.horaSaida
                    ? new Date(registro.horaSaida).toLocaleString()
                    : "Ainda não registrada"}
                </p>

                <p>
                  <strong>Total trabalhado:</strong>{" "}
                  {registro.totalTrabalhado ?? "Em andamento"}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Usuários cadastrados
          </h2>

          
{academicos.map((academico) => (
  <div
    key={academico.id}
    className="rounded-xl border p-4 shadow-sm"
  >
    <div className="flex items-start justify-between gap-4">
      <div>
        <p>Matrícula: {academico.matricula}</p>

        <h2 className="text-xl font-bold">{academico.nome}</h2>

        <p>{academico.email}</p>

        <p>
          Perfil: {academico.ehAdmin ? "Administrador" : "Aluno"}
        </p>
      </div>

      <button
        onClick={() => excluirAcademico(academico.id)}
        className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white transition hover:bg-red-600"
      >
        Excluir
      </button>
    </div>
  </div>
))}

        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
