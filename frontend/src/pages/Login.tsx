import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [manterConectado, setManterConectado] = useState(false);

  const navigate = useNavigate();

  async function fazerLogin() {
    const resposta = await fetch("http://localhost:5294/academicos/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        senha,
      }),
    });

    if (resposta.ok) {
      const usuario = await resposta.json();

      localStorage.setItem("usuario", JSON.stringify(usuario));

      if (usuario.ehAdmin) {
        navigate("/admin");
      } else {
        navigate("/aluno");
      }
    } else {
      alert("Email ou senha inválidos.");
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-slate-50 lg:grid-cols-2">
      <section className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-gradient-to-br from-sky-500 via-blue-700 to-blue-950 p-10 text-white">
        <div>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-white/10 text-2xl">
              🕒
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/80">
                Prefeitura do Rio de Janeiro
              </p>

              <h2 className="text-xl font-bold">
                Subsecretaria de Gestão
              </h2>
            </div>
          </div>
        </div>

        <div className="max-w-xl">
          <h1 className="text-6xl font-extrabold leading-tight">
            Ponto{" "}
            <span className="text-orange-400">
              Digital
            </span>
          </h1>

          <p className="mt-8 text-2xl leading-relaxed text-white/90">
            Registro de jornada simples, transparente e seguro para
            estagiários e equipe administrativa da SUBG.
          </p>

          <div className="mt-12 flex items-center gap-3 text-white/90">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/70 text-sm">
              ◷
            </span>
            <span>Bata ponto em segundos</span>
          </div>
        </div>

        <p className="text-sm text-white/70">
          © 2026 Prefeitura do Rio 
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-8 py-12">
        <div className="w-full max-w-xl">
          <h1 className="text-4xl font-extrabold text-slate-950">
            Bem-vindo de volta
          </h1>

          <p className="mt-4 text-lg text-slate-500">
            Entre com suas credenciais para registrar seu ponto.
          </p>

          <div className="mt-12 space-y-6">
            <div>
              <label className="mb-3 block font-bold text-slate-900">
                E-mail
              </label>

              <div className="flex items-center rounded-2xl border border-slate-300 bg-white px-5 py-4 shadow-sm">
                <span className="mr-4 text-slate-500"></span>

                <input
                  type="email"
                  placeholder=""
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-lg outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="font-bold text-slate-900">
                  Senha
                </label>

                <button
                  type="button"
                  className="text-sm font-semibold text-sky-600"
                >
                  
                </button>
              </div>

              <div className="flex items-center rounded-2xl border border-slate-300 bg-white px-5 py-4 shadow-sm">
                <span className="mr-4 text-slate-500"></span>

                <input
                  type={mostrarSenha ? "text" : "password"}
                  placeholder=""
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full bg-transparent text-lg outline-none placeholder:text-slate-400"
                />

                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="ml-4 text-slate-500"
                >
                  
                </button>
              </div>
            </div>

            <label className="flex items-center gap-3 text-slate-600">
              <input
                type="checkbox"
                checked={manterConectado}
                onChange={(e) => setManterConectado(e.target.checked)}
                className="h-5 w-5 rounded border-slate-300"
              />
              Manter conectado neste dispositivo
            </label>

            <button
              onClick={fazerLogin}
              className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-blue-900 px-6 py-5 text-lg font-bold text-white shadow-xl transition hover:scale-[1.01]"
            >
              Entrar →
            </button>

            <p className="text-center text-sm text-slate-500">
              Problemas para acessar? Procure a coordenação da SUBG.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;
