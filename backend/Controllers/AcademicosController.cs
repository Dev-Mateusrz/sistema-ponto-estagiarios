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
            Matricula = "20240001",
            Nome = "Maria",
            Email = "maria@email.com",
            Ativo = true
        }
    };

    [HttpGet]
    public IActionResult Get()
    {
        return Ok(academicos);
    }

    [HttpPost]
    public IActionResult Post(Academico academico)
    {
        academico.Id = academicos.Count + 1;
        academicos.Add(academico);

        return Created("", academico);
    }
}
