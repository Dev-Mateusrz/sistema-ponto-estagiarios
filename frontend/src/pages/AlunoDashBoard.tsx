import { useEffect, useState } from "react";
import jsPDF from "jspdf";

type Usuario = {
  id: number;
  nome: string;
  email: string;
  matricula: string;
};

type RegistroPonto = {
  id: number;
  data: string;
  horaEntrada: string;
  horaSaida: string | null;
  totalTrabalhado: string | null;
};

function AlunoDashboard() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [registros, setRegistros] = useState<RegistroPonto[]>([]);
  const [horaAtual, setHoraAtual] = useState(new Date());

  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario");

    if (usuarioSalvo) {
      const usuarioConvertido = JSON.parse(usuarioSalvo);
      setUsuario(usuarioConvertido);
      carregarRegistros(usuarioConvertido.id);
    }

    const timer = setInterval(() => {
      setHoraAtual(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  function carregarRegistros(academicoId: number) {
    fetch("http://localhost:5294/registros-ponto")
      .then((res) => res.json())
      .then((dados) => {
        const registrosDoUsuario = dados.filter(
          (registro: any) => registro.academicoId === academicoId
        );

        setRegistros(registrosDoUsuario);
      });
  }

  async function registrarEntrada() {
    if (!usuario) return;

    const resposta = await fetch(
      `http://localhost:5294/registros-ponto/entrada/${usuario.id}`,
      { method: "POST" }
    );

    if (resposta.ok) {
      alert("Entrada registrada!");
      carregarRegistros(usuario.id);
    } else {
      const erro = await resposta.text();
      alert(erro);
    }
  }

  async function registrarSaida() {
    if (!usuario) return;

    const resposta = await fetch(
      `http://localhost:5294/registros-ponto/saida/${usuario.id}`,
      { method: "POST" }
    );

    if (resposta.ok) {
      alert("Saída registrada!");
      carregarRegistros(usuario.id);
    } else {
      alert("Erro ao registrar saída.");
    }
  }

  function formatarHora(data: string | null) {
    if (!data) return "--:--";

    return new Date(data).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  function formatarTotal(total: string | null) {
    if (!total) return "Em andamento";

    return total.split(".")[0];
  }

  function segundosDoRegistro(registro: RegistroPonto) {
    if (!registro.totalTrabalhado) return 0;

    const [horas, minutos, segundos] = registro.totalTrabalhado
      .split(".")[0]
      .split(":")
      .map(Number);

    return horas * 3600 + minutos * 60 + segundos;
  }

  function formatarSegundos(totalSegundos: number) {
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;

    return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(
      2,
      "0"
    )}:${String(segundos).padStart(2, "0")}`;
  }

  function formatarDataInput(data: string) {
    const [ano, mes, dia] = data.split("-").map(Number);

    return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR");
  }

  function formatarDataRelatorio(data: string) {
    const dataSemHora = data.split("T")[0];
    const [ano, mes, dia] = dataSemHora.split("-").map(Number);

    return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function gerarRelatorioIndividual() {
    if (!usuario) return;

    if (!dataInicial || !dataFinal) {
      alert("Selecione o período do relatório.");
      return;
    }

    const [anoInicio, mesInicio, diaInicio] = dataInicial
      .split("-")
      .map(Number);

    const [anoFim, mesFim, diaFim] = dataFinal.split("-").map(Number);

    const inicio = new Date(anoInicio, mesInicio - 1, diaInicio, 0, 0, 0, 0);
    const fim = new Date(anoFim, mesFim - 1, diaFim, 23, 59, 59, 999);

    const registrosPeriodo = registros
      .filter((registro) => {
        const dataRegistro = new Date(registro.data);

        return dataRegistro >= inicio && dataRegistro <= fim;
      })
      .sort(
        (a, b) =>
          new Date(b.data).getTime() - new Date(a.data).getTime()
      );

    if (registrosPeriodo.length === 0) {
      alert("Nenhum registro encontrado nesse período.");
      return;
    }

    const totalSegundos = registrosPeriodo.reduce(
      (total, registro) => total + segundosDoRegistro(registro),
      0
    );

    const registrosAgrupadosPorDia = registrosPeriodo.reduce(
      (grupos: Record<string, RegistroPonto[]>, registro) => {
        const dataFormatada = formatarDataRelatorio(registro.data);

        if (!grupos[dataFormatada]) {
          grupos[dataFormatada] = [];
        }

        grupos[dataFormatada].push(registro);

        return grupos;
      },
      {}
    );

    const pdf = new jsPDF();

    const periodo = `${formatarDataInput(dataInicial)} até ${formatarDataInput(
      dataFinal
    )}`;

    pdf.setFontSize(18);
    pdf.text("Relatório Individual de Ponto", 20, 20);

    pdf.setFontSize(11);
    pdf.text("Subsecretaria de Gestão - Prefeitura do Rio", 20, 30);
    pdf.text(`Nome: ${usuario.nome}`, 20, 40);
    pdf.text(`Matrícula: ${usuario.matricula}`, 20, 48);
    pdf.text(`Período: ${periodo}`, 20, 56);
    pdf.text(`Total de registros: ${registrosPeriodo.length}`, 20, 64);
    pdf.text(`Total trabalhado: ${formatarSegundos(totalSegundos)}`, 20, 72);

    let posicaoY = 90;

    Object.entries(registrosAgrupadosPorDia).forEach(
      ([data, registrosDoDia]) => {
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(data.toUpperCase(), 20, posicaoY);

        posicaoY += 10;

        registrosDoDia.forEach((registro) => {
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");

          pdf.text("Entrada", 25, posicaoY);
          pdf.text("Saída", 80, posicaoY);
          pdf.text("Total", 135, posicaoY);

          posicaoY += 7;

          pdf.setFont("helvetica", "normal");

          pdf.text(formatarHora(registro.horaEntrada), 25, posicaoY);

          pdf.text(
            registro.horaSaida
              ? formatarHora(registro.horaSaida)
              : "Não registrada",
            80,
            posicaoY
          );

          pdf.text(formatarTotal(registro.totalTrabalhado), 135, posicaoY);

          posicaoY += 12;

          if (posicaoY > 270) {
            pdf.addPage();
            posicaoY = 20;
          }
        });

        posicaoY += 8;
      }
    );

    pdf.save(`relatorio-${usuario.nome}.pdf`);
  }

  const registrosHoje = registros.filter((registro) => {
    const dataRegistro = new Date(registro.data).toDateString();
    const hoje = new Date().toDateString();

    return dataRegistro === hoje;
  });

  const entradaAberta = registros.some(
    (registro) => registro.horaSaida === null
  );

  return (
    <div className="min-h-screen bg-slate-50">
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
                Ponto <span className="text-sky-300">Digital</span>
              </h1>
            </div>
          </div>

          <p className="text-xl font-bold">
            {horaAtual.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-8 py-10">
        <p className="text-lg text-slate-500">
          {horaAtual.toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>

        <h1 className="mt-2 text-4xl font-extrabold text-blue-900">
          Dashboard do Estagiário
        </h1>

        <p className="mt-3 text-xl text-slate-500">
          Bem-vindo(a),{" "}
          <strong className="text-slate-900">{usuario?.nome}</strong>. Pronto
          para registrar seu ponto?
        </p>

        <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase text-slate-500">
                Hora atual
              </p>

              <p className="text-4xl font-semibold text-slate-900">
                {horaAtual.toLocaleTimeString("pt-BR")}
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                onClick={registrarEntrada}
                className="rounded-2xl bg-green-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-green-700"
              >
                Registrar Entrada
              </button>

              <button
                onClick={registrarSaida}
                className="rounded-2xl bg-red-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-red-700"
              >
                Registrar Saída
              </button>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-lg text-slate-500">Registros hoje</p>
            <h2 className="mt-4 text-3xl font-semibold">
              {registrosHoje.length}
            </h2>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-lg text-slate-500">Total de registros</p>
            <h2 className="mt-4 text-3xl font-extrabold">
              {registros.length}
            </h2>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-lg text-slate-500">Status</p>
            <h2
              className={`mt-4 text-3xl font-extrabold ${
                entradaAberta ? "text-green-600" : "text-red-600"
              }`}
            >
              {entradaAberta ? "Em expediente" : "Fora"}
            </h2>
          </div>
        </section>

        <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">
              Histórico recente
            </h2>

            <p className="text-slate-500">{registros.length} registro(s)</p>
          </div>

          <div className="mt-6 space-y-4">
            {registros.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center">
                <h3 className="mt-5 text-xl font-bold">
                  Nenhum registro ainda
                </h3>

                <p className="mt-2 text-slate-500">
                  Use os botões acima para registrar seu primeiro ponto.
                </p>
              </div>
            )}

            {registros.map((registro) => (
              <div
                key={registro.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <p className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                  {formatarDataRelatorio(registro.data)}
                </p>

                <p>
                  <strong>Entrada:</strong> {formatarHora(registro.horaEntrada)}
                </p>

                <p>
                  <strong>Saída:</strong>{" "}
                  {registro.horaSaida
                    ? formatarHora(registro.horaSaida)
                    : "Ainda não registrada"}
                </p>

                <p>
                  <strong>Total trabalhado:</strong>{" "}
                  {formatarTotal(registro.totalTrabalhado)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">
            Relatório individual
          </h2>

          <p className="mt-2 text-slate-500">
            Consulte seus registros de horas trabalhadas por período.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
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
            onClick={gerarRelatorioIndividual}
            className="mt-6 rounded-2xl bg-blue-700 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-blue-800"
          >
            Gerar relatório
          </button>
        </section>
      </main>
    </div>
  );
}

export default AlunoDashboard;