function AlunoDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="rounded-2xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-blue-600">
          Dashboard do Aluno
        </h1>

        <p className="mt-2 text-gray-600">
          Área do acadêmico
        </p>

        <div className="mt-8 rounded-xl border p-6">
          <h2 className="text-xl font-semibold">
            Registro de Ponto
          </h2>

          <div className="mt-4 flex gap-4">
            <button className="rounded-lg bg-green-600 px-4 py-2 text-white">
              Registrar Entrada
            </button>

            <button className="rounded-lg bg-red-600 px-4 py-2 text-white">
              Registrar Saída
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlunoDashboard;
