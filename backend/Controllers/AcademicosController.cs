using Microsoft.AspNetCore.Mvc;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("academicos")]
public class AcademicosController : ControllerBase
{
    private static List<Academico> academicos = new List<Academico>
    {
        new Academico
        {
            Id = 1,
            Nome = "Maria",
            Email = "maria@email.com",
            Curso = "Sistemas de Informação",
            Ativo = true
        }
    };

    [HttpGet]
    public IActionResult Get()
    {
        return Ok(academicos);
    }
}
