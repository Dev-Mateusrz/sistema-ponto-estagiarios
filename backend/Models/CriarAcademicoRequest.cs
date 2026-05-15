namespace backend.Models;

public class CriarAcademicoRequest
{
    public string Matricula { get; set; } = string.Empty;

    public string Nome { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Senha { get; set; } = string.Empty;

    public bool EhAdmin { get; set; } = false;

    public string HorarioEntrada { get; set; } = string.Empty;

    public string HorarioSaida { get; set; } = string.Empty;
}
