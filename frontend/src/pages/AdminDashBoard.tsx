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

  const [filtroNome, setFiltroNome] = useState("");

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
    const confirmar = confirm("Tem certeza que deseja excluir este usuário?");

    if (!confirmar) return;

    const resposta = await fetch(`http://localhost:5294/academicos/${id}`, {
      method: "DELETE",
    });

    if (resposta.ok) {
      carregarAcademicos();
      carregarRegistros();
    } else {
      alert("Erro ao excluir usuário.");
    }
  }

  function formatarData(data: string) {
    return new Date(data).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });
  }

  function formatarHora(data: string | null) {
    if (!data) return "--:--";

    return new Date(data).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatarTotal(total: string | null) {
    if (!total) return "Em andamento";

    return total.split(".")[0];
  }

  const registrosFiltrados = filtroNome
    ? registros.filter(
        (registro) =>
          registro.academico?.nome.toLowerCase() === filtroNome.toLowerCase()
      )
    : registros;

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-gradient-to-r from-blue-900 via-blue-700 to-sky-500 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              🕒
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest">
                Prefeitura do Rio · Subsecretaria de Gestão
              </p>

              <h1 className="text-xl font-bold">
                Ponto <span className="text-orange-400">Digital</span>
              </h1>
            </div>
          </div>

          <p className="text-xl font-bold">
            {new Date().toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-8 py-8 lg:grid-cols-[420px_1fr]">
        <section className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-blue-900">
              Painel do Administrador
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Cadastre usuários do sistema.
            </p>

            <div className="mt-6 grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-600">
                    Matrícula
                  </label>
                  <input
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-600">
                    Nome
                  </label>
                  <input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600">
                  Senha
                </label>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 outline-none focus:border-blue-500"
                />
              </div>

              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={ehAdmin}
                  onChange={(e) => setEhAdmin(e.target.checked)}
                />
                Usuário administrador
              </label>

              <button
                onClick={cadastrarAcademico}
                className="rounded-xl bg-blue-700 p-3 font-bold text-white transition hover:bg-blue-800"
              >
                Cadastrar Usuário
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800">
              Usuários cadastrados
            </h2>

            <div className="mt-4 space-y-3">
              {academicos.map((academico) => (
                <div
                  key={academico.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-800">
                        {academico.nome}
                      </h3>

                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700">
                        {academico.ehAdmin ? "ADMINISTRADOR" : "ACADÊMICO BOLSISTA"}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500">
                      {academico.matricula} · {academico.email}
                    </p>
                  </div>

                  <button
                    onClick={() => excluirAcademico(academico.id)}
                    className="rounded-lg px-3 py-2 text-red-500 transition hover:bg-red-50"
                  >
                    ❌
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-800">
              Registros de Ponto
            </h2>

            <select
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
              className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 font-semibold text-slate-700 outline-none"
            >
              <option value="">Todos</option>

             {academicos
  .filter((academico) => !academico.ehAdmin)
  .map((academico) => (
    <option key={academico.id} value={academico.nome}>
      {academico.nome}
    </option>
  ))}

            </select>
          </div>

          <div className="mt-6 space-y-5">
            {registrosFiltrados.length === 0 && (
              <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
                Nenhum registro encontrado.
              </p>
            )}

            {registrosFiltrados.map((registro) => (
              <div key={registro.id}>
                <p className="mb-2 text-sm font-bold uppercase text-slate-500">
                  {formatarData(registro.data)}
                </p>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                  <div>
                    <p className="font-bold text-slate-800">
                      {registro.academico?.nome ?? "Não informado"}
                    </p>

                    <p className="text-sm text-slate-500">
                      Matrícula:{" "}
                      {registro.academico?.matricula ?? "Não informada"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-600">
                      {formatarHora(registro.horaEntrada)} →{" "}
                      {formatarHora(registro.horaSaida)}
                    </p>

                    <span className="mt-1 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                      {formatarTotal(registro.totalTrabalhado)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
