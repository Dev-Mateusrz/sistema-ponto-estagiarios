using Microsoft.AspNetCore.Mvc;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("registros-ponto")]
public class RegistrosPontoController : ControllerBase
{
    private static List<RegistroPonto> registros = new List<RegistroPonto>();

    [HttpPost("entrada/{academicoId}")]
    public IActionResult RegistrarEntrada(int academicoId)
    {
        var registro = new RegistroPonto
        {
            Id = registros.Count + 1,
            AcademicoId = academicoId,
            Data = DateTime.Today,
            HoraEntrada = DateTime.Now
        };

        registros.Add(registro);

        return Ok(registro);
    }

    [HttpPost("saida/{academicoId}")]
    public IActionResult RegistrarSaida(int academicoId)
    {
        var registro = registros.LastOrDefault(r =>
            r.AcademicoId == academicoId &&
            r.Data == DateTime.Today &&
            r.HoraSaida == null);

        if (registro == null)
        {
            return NotFound("Entrada não encontrada.");
        }

        registro.HoraSaida = DateTime.Now;

        return Ok(registro);
    }

    [HttpGet]
    public IActionResult Get()
    {
        return Ok(registros);
    }
}
