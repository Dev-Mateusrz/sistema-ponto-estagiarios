import { apiFetch } from "../lib/api";

export async function buscarAcademicos() {
  const response = await apiFetch("/academicos");

  const resultado = await response.json();

  return resultado.data;
}

export async function criarAcademico(dados: unknown) {
  const response = await apiFetch("/academicos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  });

  return response;
}

export async function excluirAcademico(id: number) {
  return apiFetch(`/academicos/${id}`, {
    method: "DELETE",
  });
}

export async function buscarUsuarioLogado() {
  const response = await apiFetch("/academicos/me");

  return response.json();
}