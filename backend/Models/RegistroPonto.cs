namespace backend.Models;


public class RegistroPonto
{
    public int Id { get; set; }

    
    public int AcademicoId { get; set; }

    
    public DateTime Data { get; set; }

    
    public DateTime? HoraEntrada { get; set; }

   
    public DateTime? HoraSaida { get; set; }

    
    public string? TotalTrabalhado { get; set; }

   
    public Academico? Academico { get; set; }
}
