namespace backend.Models;

// Representa um acadêmico cadastrado no sistema
public class Academico
{
    public int Id { get; set; }

    public string Matricula { get; set; } = string.Empty;

    public string Nome { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Senha { get; set; } = string.Empty;

    public bool EhAdmin { get; set; } = false;

    public bool Ativo { get; set; } = true;
}

