namespace backend.Models;

public class Academico
{
    public int Id { get; set; }

    public string Matricula { get; set; } = string.Empty;

    public string Nome { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public bool Ativo { get; set; } = true;
}
