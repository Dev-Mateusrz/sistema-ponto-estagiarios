using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data;

//Contexto principal
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

//Tabela de acad.
    public DbSet<Academico> Academicos { get; set; }

//Tabela de registro de ponto
    public DbSet<RegistroPonto> RegistrosPonto { get; set; }
}
