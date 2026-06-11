import { apiFetch } from "../lib/api";

export async function buscarRegistros() {
  const response = await apiFetch("/registros-ponto");

  const resultado = await response.json();

  return resultado.data;
}

export async function registrarEntrada() {
  const response = await apiFetch(
    "/registros-ponto/entrada",
    {
      method: "POST",
    }
  );

  return response;
}

export async function registrarSaida() {
  const response = await apiFetch(
    "/registros-ponto/saida",
    {
      method: "POST",
    }
  );

  return response;
}