namespace backend.Models;

public class PrimeiroAcessoRequest
{
    public string Email { get; set; } = string.Empty;

    public string Matricula { get; set; } = string.Empty;

    public string NovaSenha { get; set; } = string.Empty;
}
