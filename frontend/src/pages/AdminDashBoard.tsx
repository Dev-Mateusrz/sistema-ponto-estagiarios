import { useEffect, useState } from "react";
import jsPDF from "jspdf";

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
      const erro = await resposta.text();
      alert(erro || "Erro ao cadastrar.");
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

  function pegarStatus(academico: Academico) {
if (academico.ehAdmin) {
return {
texto: "Administrador",
classe: "bg-blue-100 text-blue-700",
};
}

const agora = new Date();

const hoje = agora.toDateString();

const registrosHoje = registros.filter((registro) => {
const dataRegistro = new Date(registro.data).toDateString();

return (
registro.academico?.email === academico.email &&
dataRegistro === hoje
);
});

// horários limite
const limiteAtraso = new Date();
limiteAtraso.setHours(9, 0, 0, 0);

const limiteFalta = new Date();
limiteFalta.setHours(13, 0, 0, 0);

// ainda não registrou ponto
if (registrosHoje.length === 0) {
// entre 09:00 e 12:59 => atrasado
if (agora >= limiteAtraso && agora < limiteFalta) {
return {
texto: "Atrasado",
classe: "bg-yellow-100 text-yellow-700",
};
}

// depois de 13:00 => faltou
if (agora >= limiteFalta) {
return {
texto: "Faltou",
classe: "bg-red-100 text-red-700",
};
}

// antes das 09:00
return {
texto: "Ainda não chegou",
classe: "bg-slate-100 text-slate-700",
};
}

// possui entrada aberta
const temEntradaAberta = registrosHoje.some(
(registro) => registro.horaSaida === null
);

const primeiroRegistro = registrosHoje[0];

const horaEntrada = new Date(primeiroRegistro.horaEntrada);

// chegou depois das 09:00
if (horaEntrada > limiteAtraso) {
if (temEntradaAberta) {
return {
texto: "Em expediente • Chegou com atraso",
classe: "bg-orange-100 text-orange-700",
};
}

return {
texto: "Chegou com atraso",
classe: "bg-orange-100 text-orange-700",
};
}

// em expediente
if (temEntradaAberta) {
return {
texto: "Em expediente",
classe: "bg-green-100 text-green-700",
};
}

// saiu normalmente
return {
texto: "Fora",
classe: "bg-slate-100 text-slate-700",
};
}

const termoBusca = filtroNome.trim().toLowerCase();

  const registrosFiltrados = registros
    .filter((registro) => {
      // Se não tem busca, mostra tudo
      if (!termoBusca) return true;

      const nome = String(registro.academico?.nome || "").toLowerCase();
      const matricula = String(registro.academico?.matricula || "").toLowerCase();
      
      // Filtramos apenas por NOME e MATRÍCULA (removi e-mail para evitar lixo no filtro)
      return nome.includes(termoBusca) || matricula.includes(termoBusca);
    })
    .sort((a, b) => {
      if (!termoBusca) return 0;

      const nomeA = String(a.academico?.nome || "").toLowerCase();
      const nomeB = String(b.academico?.nome || "").toLowerCase();

      // PRIORIDADE 1: Se o nome COMEÇA com o que foi digitado, vai para o topo
      const iniciaA = nomeA.startsWith(termoBusca);
      const iniciaB = nomeB.startsWith(termoBusca);

      if (iniciaA && !iniciaB) return -1;
      if (!iniciaA && iniciaB) return 1;

      // PRIORIDADE 2: Ordem alfabética normal para o restante
      return nomeA.localeCompare(nomeB);
    });

function gerarRelatorioSemanal() {
  const hoje = new Date();

  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - hoje.getDay());
  inicioSemana.setHours(0, 0, 0, 0);

  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 6);
  fimSemana.setHours(23, 59, 59, 999);

  return academicos
    .filter((academico) => !academico.ehAdmin)
    .map((academico) => {
      const registrosDaSemana = registros.filter((registro) => {
        const dataRegistro = new Date(registro.data);

        return (
          registro.academico?.email === academico.email &&
          dataRegistro >= inicioSemana &&
          dataRegistro <= fimSemana
        );
      });

      const totalSegundos = registrosDaSemana.reduce((total, registro) => {
        if (!registro.totalTrabalhado) return total;

        const [horas, minutos, segundos] = registro.totalTrabalhado
          .split(".")[0]
          .split(":")
          .map(Number);

        return total + horas * 3600 + minutos * 60 + segundos;
      }, 0);

      const horas = Math.floor(totalSegundos / 3600);
      const minutos = Math.floor((totalSegundos % 3600) / 60);
      const segundos = totalSegundos % 60;

      return {
        nome: academico.nome,
        matricula: academico.matricula,
        totalRegistros: registrosDaSemana.length,
        totalHoras: `${String(horas).padStart(2, "0")}:${String(
          minutos
        ).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`,
      };
    });
}

function gerarPdfRelatorioSemanal() {
  const relatorio = gerarRelatorioSemanal();

  const pdf = new jsPDF();

  pdf.setFontSize(18);
  pdf.text("Relatório Semanal de Ponto", 20, 20);

  pdf.setFontSize(11);
  pdf.text("Subsecretaria de Gestão - Prefeitura do Rio", 20, 30);

  pdf.text(
    `Gerado em: ${new Date().toLocaleDateString("pt-BR")}`,
    20,
    40
  );

  let posicaoY = 55;

  relatorio.forEach((item) => {
    pdf.setFontSize(12);

    pdf.text(`Nome: ${item.nome}`, 20, posicaoY);
    pdf.text(`Matrícula: ${item.matricula}`, 20, posicaoY + 8);
    pdf.text(`Registros na semana: ${item.totalRegistros}`, 20, posicaoY + 16);
    pdf.text(`Total semanal: ${item.totalHoras}`, 20, posicaoY + 24);

    posicaoY += 40;

    if (posicaoY > 270) {
      pdf.addPage();
      posicaoY = 20;
    }
  });

  pdf.save("relatorio-semanal-ponto.pdf");
}


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

<button
  onClick={gerarPdfRelatorioSemanal}
  className="rounded-xl bg-green-600 p-3 font-bold text-white transition hover:bg-green-700"
>
  Gerar Relatório Semanal
</button>


            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800">
              Usuários cadastrados
            </h2>

            <div className="mt-4 space-y-3">
              {academicos.map((academico) => {
                const status = pegarStatus(academico);

                return (
                  <div
                    key={academico.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-800">
                          {academico.nome}
                        </h3>

                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700">
                          {academico.ehAdmin
                            ? "ADMINISTRADOR"
                            : "ACADÊMICO BOLSISTA"}
                        </span>

                        <div className="flex flex-wrap items-center gap-2">
{status.texto.includes("Em expediente") && (
<span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
Em expediente
</span>
)}

{status.texto.includes("Chegou com atraso") && (
<span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-bold text-yellow-700">
Chegou com atraso
</span>
)}

{status.texto === "Atrasado" && (
<span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-bold text-orange-700">
Atrasado
</span>
)}

{status.texto === "Faltou" && (
<span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
Faltou
</span>
)}

{status.texto === "Fora" && (
<span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
Fora
</span>
)}

{status.texto === "Ainda não chegou" && (
<span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
Ainda não chegou
</span>
)}

{status.texto === "Administrador" && (
<span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700">
Administrador
</span>
)}
</div>
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
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
                );
              })}
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-800">
              Registros de Ponto
            </h2>

            <div className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder="Buscar por nome ou matrícula"
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 font-semibold text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              {filtroNome && (
                <button
                  onClick={() => setFiltroNome("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

         <div className="mt-6 space-y-5">
  {registrosFiltrados.length === 0 && (
    <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
      Nenhum registro encontrado.
    </p>
  )}

  {registrosFiltrados.length > 0 && (
    <p className="mb-2 text-sm font-bold uppercase text-slate-500">
      {formatarData(registrosFiltrados[0].data)}
    </p>
  )}

  {registrosFiltrados.map((registro) => (
    <div
      key={registro.id}
      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4"
    >
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
  ))}
</div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
