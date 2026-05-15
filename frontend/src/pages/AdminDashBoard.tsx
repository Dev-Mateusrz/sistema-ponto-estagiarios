import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { Trash2 } from "lucide-react";

type Academico = {
  id: number;
  matricula: string;
  nome: string;
  email: string;
  ehAdmin: boolean;
  horarioEntrada: string;
  horarioSaida: string;
  ativo: boolean;
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

type StatusAcademico = {
  texto: string;
};

function AdminDashboard() {
  const [academicos, setAcademicos] = useState<Academico[]>([]);
  const [registros, setRegistros] = useState<RegistroPonto[]>([]);

  const [matricula, setMatricula] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [ehAdmin, setEhAdmin] = useState(false);

  const [horarioEntrada, setHorarioEntrada] = useState("");
  const [horarioSaida, setHorarioSaida] = useState("");

  const [filtroNome, setFiltroNome] = useState("");
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);
  const [mesSelecionado, setMesSelecionado] = useState(new Date());

  const [toast, setToast] = useState("");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");

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
    if (!ehAdmin && (!horarioEntrada || !horarioSaida)) {
      alert("Informe os horários do acadêmico.");
      return;
    }

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
        horarioEntrada,
        horarioSaida,
      }),
    });

    if (resposta.ok) {
      alert("Usuário cadastrado!");

      setMatricula("");
      setNome("");
      setEmail("");
      setSenha("");
      setEhAdmin(false);
      setHorarioEntrada("");
      setHorarioSaida("");

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
    const dataSemHora = data.split("T")[0];
    const [ano, mes, dia] = dataSemHora.split("-").map(Number);
    const dataLocal = new Date(ano, mes - 1, dia);

    return dataLocal.toLocaleDateString("pt-BR", {
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

  function obterDiaRegistro(data: string) {
    const dataSemHora = data.split("T")[0];
    const [, , dia] = dataSemHora.split("-").map(Number);
    return dia;
  }

  function obterMesRegistro(data: string) {
    const dataSemHora = data.split("T")[0];
    const [, mes] = dataSemHora.split("-").map(Number);
    return mes - 1;
  }

  function obterAnoRegistro(data: string) {
    const dataSemHora = data.split("T")[0];
    const [ano] = dataSemHora.split("-").map(Number);
    return ano;
  }

  function criarDataComHorario(horario: string) {
    const [hora, minuto] = horario.split(":").map(Number);
    const data = new Date();

    data.setHours(hora, minuto, 0, 0);

    return data;
  }

  function pegarStatus(academico: Academico): StatusAcademico | null {
    if (academico.ehAdmin) return null;

    const agora = new Date();
    const hoje = agora.toDateString();

    const registrosHoje = registros
      .filter((registro) => {
        const dataRegistro = new Date(registro.data).toDateString();

        return (
          registro.academico?.email === academico.email &&
          dataRegistro === hoje
        );
      })
      .sort(
        (a, b) =>
          new Date(a.horaEntrada).getTime() -
          new Date(b.horaEntrada).getTime()
      );

    const limiteAtraso = criarDataComHorario(academico.horarioEntrada);
    const limiteFalta = criarDataComHorario(academico.horarioSaida);

    const toleranciaMinutos = 10;
    limiteAtraso.setMinutes(limiteAtraso.getMinutes() + toleranciaMinutos);

    if (registrosHoje.length === 0) {
      if (agora >= limiteAtraso && agora < limiteFalta) {
        return {
          texto: `Atrasado • Entrada prevista: ${academico.horarioEntrada}`,
        };
      }

      if (agora >= limiteFalta) {
        return {
          texto: `Faltou • Expediente encerrado às ${academico.horarioSaida}`,
        };
      }

      return {
        texto: `Ainda não chegou • Entrada às ${academico.horarioEntrada}`,
      };
    }

    const temEntradaAberta = registrosHoje.some(
      (registro) => registro.horaSaida === null
    );

    const primeiroRegistro = registrosHoje[0];
    const horaEntrada = new Date(primeiroRegistro.horaEntrada);

    if (horaEntrada > limiteAtraso) {
      if (temEntradaAberta) {
        return {
          texto: "Em expediente • Chegou com atraso",
        };
      }

      return {
        texto: "Chegou com atraso",
      };
    }

    if (temEntradaAberta) {
      return {
        texto: `Em expediente até ${academico.horarioSaida}`,
      };
    }

    return {
      texto: "Fora",
    };
  }

  async function gerarPdfRelatorio() {
    if (!dataInicial || !dataFinal) {
      alert("Selecione o periodo do relatorio.");
      return;
    }

    function formatarDataInput(data: string) {
      const [ano, mes, dia] = data.split("-").map(Number);
      return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR");
    }

    function formatarDataRegistro(data: string) {
      const dataSemHora = data.split("T")[0];
      const [ano, mes, dia] = dataSemHora.split("-").map(Number);
      return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR");
    }

    async function carregarImagemRelatorio() {
      const resposta = await fetch("/logo-relatorio-subg.png");
      const blob = await resposta.blob();

      return await new Promise<string>((resolve, reject) => {
        const leitor = new FileReader();
        leitor.onloadend = () => resolve(String(leitor.result));
        leitor.onerror = reject;
        leitor.readAsDataURL(blob);
      });
    }

    function desenharCabecalho(pdf: jsPDF, logoRelatorio?: string) {
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, 210, 297, "F");

      pdf.setFillColor(15, 76, 117);
      pdf.rect(0, 0, 210, 7, "F");

      if (logoRelatorio) {
        pdf.addImage(logoRelatorio, "PNG", 18, 14, 28, 28);
      } else {
        pdf.setFillColor(15, 76, 117);
        pdf.circle(32, 28, 14, "F");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(13);
        pdf.setTextColor(255, 255, 255);
        pdf.text("SUBG", 32, 31, { align: "center" });
      }

      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(8);
      pdf.text("PREFEITURA DA CIDADE DO", 52, 22);

      pdf.setFontSize(13);
      pdf.text("RIO DE JANEIRO", 52, 29);

      pdf.setFontSize(10);
      pdf.text("SECRETARIA MUNICIPAL DE SAUDE", 52, 36);

      pdf.setDrawColor(226, 232, 240);
      pdf.line(20, 48, 190, 48);
    }

    function desenharTitulo(pdf: jsPDF, periodo: string) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.setTextColor(15, 23, 42);
      pdf.text("Relatorio de Ponto", 20, 63);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(71, 85, 105);
      pdf.text("Subsecretaria de Gestao", 20, 71);
      pdf.text(`Periodo: ${periodo}`, 20, 78);
      pdf.text(
        `Gerado em: ${new Date().toLocaleDateString("pt-BR")}`,
        20,
        85
      );
    }

    function desenharCabecalhoTabela(pdf: jsPDF, posicaoY: number) {
      pdf.setFillColor(15, 76, 117);
      pdf.roundedRect(20, posicaoY, 170, 10, 2, 2, "F");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(255, 255, 255);
      pdf.text("Nome", 24, posicaoY + 6.5);
      pdf.text("Data", 78, posicaoY + 6.5);
      pdf.text("Entrada", 108, posicaoY + 6.5);
      pdf.text("Saida", 138, posicaoY + 6.5);
      pdf.text("Total", 164, posicaoY + 6.5);
    }

    const [anoInicio, mesInicio, diaInicio] = dataInicial
      .split("-")
      .map(Number);
    const [anoFim, mesFim, diaFim] = dataFinal.split("-").map(Number);

    const inicio = new Date(anoInicio, mesInicio - 1, diaInicio, 0, 0, 0, 0);
    const fim = new Date(anoFim, mesFim - 1, diaFim, 23, 59, 59, 999);

    if (inicio >= fim) {
      alert("A data inicial deve ser menor que a data final.");
      return;
    }

    const registrosPeriodo = registros
      .filter((registro) => {
        const dataRegistro = new Date(registro.data);

        return dataRegistro >= inicio && dataRegistro <= fim;
      })
      .sort(
        (a, b) =>
          new Date(a.horaEntrada).getTime() -
          new Date(b.horaEntrada).getTime()
      );

    if (registrosPeriodo.length === 0) {
      alert("Nenhum registro encontrado nesse periodo.");
      return;
    }

    const registrosPorPessoa = registrosPeriodo.reduce(
      (grupos: Record<string, RegistroPonto[]>, registro) => {
        const nome = registro.academico?.nome ?? "Nao informado";

        if (!grupos[nome]) {
          grupos[nome] = [];
        }

        grupos[nome].push(registro);

        return grupos;
      },
      {}
    );

    const pdf = new jsPDF();
    let logoRelatorio: string | undefined;

    try {
      logoRelatorio = await carregarImagemRelatorio();
    } catch {
      logoRelatorio = undefined;
    }

    const periodo = `${formatarDataInput(dataInicial)} ate ${formatarDataInput(
      dataFinal
    )}`;

    desenharCabecalho(pdf, logoRelatorio);
    desenharTitulo(pdf, periodo);

    let posicaoY = 98;

    Object.values(registrosPorPessoa).forEach((registrosPessoa) => {
      if (posicaoY > 242) {
        pdf.addPage();
        desenharCabecalho(pdf, logoRelatorio);
        desenharTitulo(pdf, periodo);
        posicaoY = 98;
      }

      desenharCabecalhoTabela(pdf, posicaoY);
      posicaoY += 14;

      registrosPessoa.forEach((registro, indice) => {
        if (posicaoY > 260) {
          pdf.addPage();
          desenharCabecalho(pdf, logoRelatorio);
          desenharTitulo(pdf, periodo);
          posicaoY = 98;
          desenharCabecalhoTabela(pdf, posicaoY);
          posicaoY += 14;
        }

        if (indice % 2 === 0) {
          pdf.setFillColor(248, 250, 252);
          pdf.rect(20, posicaoY - 6, 170, 11, "F");
        }

        pdf.setDrawColor(226, 232, 240);
        pdf.line(20, posicaoY + 6, 190, posicaoY + 6);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(15, 23, 42);
        pdf.text(registro.academico?.nome ?? "Nao informado", 24, posicaoY);

        pdf.setTextColor(51, 65, 85);
        pdf.text(formatarDataRegistro(registro.data), 78, posicaoY);
        pdf.text(formatarHora(registro.horaEntrada), 108, posicaoY);
        pdf.text(formatarHora(registro.horaSaida), 138, posicaoY);
        pdf.text(formatarTotal(registro.totalTrabalhado), 164, posicaoY);

        posicaoY += 12;
      });

      posicaoY += 8;
    });

    if (posicaoY > 236) {
      pdf.addPage();
      desenharCabecalho(pdf, logoRelatorio);
      desenharTitulo(pdf, periodo);
      posicaoY = 100;
    }

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(15, 23, 42);
    pdf.text("Assinatura do responsavel:", 20, posicaoY + 18);
    pdf.setDrawColor(100, 116, 139);
    pdf.line(20, posicaoY + 42, 120, posicaoY + 42);

    pdf.save("relatorio-ponto.pdf");

    setToast("Relatorio gerado com sucesso!");

    setTimeout(() => {
      setToast("");
    }, 3000);
  }

const mesAtual = mesSelecionado.getMonth();
const anoAtual = mesSelecionado.getFullYear();

const diasDoMes = Array.from(
  { length: new Date(anoAtual, mesAtual + 1, 0).getDate() },
  (_, i) => i + 1
);

  function nomeMesAtual() {
    return mesSelecionado.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
  }

  function mesAnterior() {
    setMesSelecionado(new Date(anoAtual, mesAtual - 1, 1));
    setDiaSelecionado(null);
  }

  function proximoMes() {
    setMesSelecionado(new Date(anoAtual, mesAtual + 1, 1));
    setDiaSelecionado(null);
  }

  function registrosDoDia(dia: number) {
    return registros.some(
      (registro) =>
        obterDiaRegistro(registro.data) === dia &&
        obterMesRegistro(registro.data) === mesAtual &&
        obterAnoRegistro(registro.data) === anoAtual
    );
  }

  const termoBusca = filtroNome.trim().toLowerCase();

  const registrosFiltrados = registros
    .filter((registro) => {
      const nome = String(registro.academico?.nome || "").toLowerCase();
      const matricula = String(
        registro.academico?.matricula || ""
      ).toLowerCase();

      const passouBusca =
        !termoBusca ||
        nome.includes(termoBusca) ||
        matricula.includes(termoBusca);

      const passouDia =
        diaSelecionado === null ||
        obterDiaRegistro(registro.data) === diaSelecionado;

      const passouMes = obterMesRegistro(registro.data) === mesAtual;
      const passouAno = obterAnoRegistro(registro.data) === anoAtual;

      return passouBusca && passouDia && passouMes && passouAno;
    })
    .sort((a, b) => {
      const dataA = new Date(a.horaEntrada).getTime();
      const dataB = new Date(b.horaEntrada).getTime();

      return dataB - dataA;
    });

  const registrosAgrupadosPorDia = registrosFiltrados.reduce(
    (grupos: Record<string, RegistroPonto[]>, registro) => {
      const dataFormatada = formatarData(registro.data).toUpperCase();

      if (!grupos[dataFormatada]) {
        grupos[dataFormatada] = [];
      }

      grupos[dataFormatada].push(registro);

      return grupos;
    },
    {}
  );

  return (
    <div className="min-h-screen bg-slate-100">
      {toast && (
        <div className="fixed right-6 top-6 z-50 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}

      <header className="bg-gradient-to-r from-blue-900 via-blue-700 to-sky-500 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest">
              Prefeitura do Rio · Subsecretaria de Gestão
            </p>

            <h1 className="text-xl font-bold">
              Ponto <span className="text-sky-300">Digital</span>
            </h1>
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

              {!ehAdmin && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-slate-600">
                      Horário de entrada
                    </label>

                    <input
                      type="time"
                      value={horarioEntrada}
                      onChange={(e) => setHorarioEntrada(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-600">
                      Horário de saída
                    </label>

                    <input
                      type="time"
                      value={horarioSaida}
                      onChange={(e) => setHorarioSaida(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-600">
                    Data inicial
                  </label>

                  <input
                    type="date"
                    value={dataInicial}
                    onChange={(e) => setDataInicial(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-600">
                    Data final
                  </label>

                  <input
                    type="date"
                    value={dataFinal}
                    onChange={(e) => setDataFinal(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={gerarPdfRelatorio}
                className="rounded-xl bg-green-600 p-3 font-bold text-white transition hover:bg-green-700"
              >
                Gerar Relatório
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

                        {status?.texto.includes("Em expediente") && (
                          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                            Em expediente
                          </span>
                        )}

                        {status?.texto.includes("Chegou com atraso") && (
                          <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-bold text-yellow-700">
                            Chegou com atraso
                          </span>
                        )}

                        {status?.texto.includes("Atrasado") && (
                          <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-bold text-orange-700">
                            Atrasado
                          </span>
                        )}

                        {status?.texto.includes("Faltou") && (
                          <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
                            Faltou
                          </span>
                        )}

                        {status?.texto === "Fora" && (
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                            Fora
                          </span>
                        )}

                        {status?.texto.includes("Ainda não chegou") && (
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                            Ainda não chegou
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        {academico.matricula} · {academico.email}
                      </p>
                    </div>

                    {!academico.ehAdmin && (
                      <p className="text-xs text-slate-400">
                        Expediente: {academico.horarioEntrada} às{" "}
                        {academico.horarioSaida}
                      </p>
                    )}

                    <button
                      onClick={() => excluirAcademico(academico.id)}
                      className="flex items-center justify-center rounded-xl p-2 text-red-500 transition hover:bg-red-100 hover:text-red-700"
                    >
                      <Trash2 size={18} strokeWidth={2.2} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900">
              Registros de Ponto
            </h2>

            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Buscar por nome ou matrícula"
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                {nomeMesAtual()}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={mesAnterior}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1 font-bold text-slate-700 hover:bg-slate-50"
                >
                  &lt;
                </button>

                <button
                  onClick={proximoMes}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1 font-bold text-slate-700 hover:bg-slate-50"
                >
                  &gt;
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setDiaSelecionado(null)}
                className={`relative rounded-lg border px-4 py-2 text-sm font-bold transition ${
                  diaSelecionado === null
                    ? "border-blue-700 bg-blue-700 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                Todos
              </button>

              {diasDoMes.map((dia) => (
                <button
                  key={dia}
                  onClick={() => setDiaSelecionado(dia)}
                  className={`relative rounded-lg border px-4 py-2 text-sm font-bold transition ${
                    diaSelecionado === dia
                      ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {dia}

                  {registrosDoDia(dia) && (
                    <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-orange-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 space-y-7">
            {registrosFiltrados.length === 0 && (
              <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
                Nenhum registro encontrado.
              </p>
            )}

            {Object.entries(registrosAgrupadosPorDia).map(
              ([data, registrosDoGrupo]) => (
                <div key={data}>
                  <p className="mb-4 text-sm font-extrabold uppercase tracking-wide text-blue-900">
                    {data}
                  </p>

                  <div className="space-y-3">
                    {registrosDoGrupo.map((registro) => (
                      <div
                        key={registro.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4"
                      >
                        <div className="flex items-start justify-between gap-8">
                          <div>
                            <p className="text-lg font-bold text-slate-900">
                              {registro.academico?.nome ?? "Não informado"}
                            </p>

                            <p className="text-sm text-slate-500">
                              Matrícula:{" "}
                              {registro.academico?.matricula ??
                                "Não informada"}
                            </p>
                          </div>

                          <div className="flex gap-10 text-sm">
                            <div>
                              <p className="font-bold text-slate-700">
                                Entrada
                              </p>

                              <p className="mt-1 text-slate-900">
                                {formatarHora(registro.horaEntrada)}
                              </p>
                            </div>

                            <div>
                              <p className="font-bold text-slate-700">
                                Saída
                              </p>

                              <p className="mt-1 text-slate-900">
                                {formatarHora(registro.horaSaida)}
                              </p>
                            </div>

                            <div>
                              <p className="font-bold text-slate-700">
                                Total
                              </p>

                              <span className="mt-1 inline-block rounded-full bg-blue-100 px-3 py-1 font-bold text-blue-700">
                                {formatarTotal(registro.totalTrabalhado)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
