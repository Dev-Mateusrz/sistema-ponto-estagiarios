using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("registros-ponto")]
public class RegistrosPontoController : ControllerBase
{
    private readonly AppDbContext _context;

    public RegistrosPontoController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult Get()
    {
        var registros = _context.RegistrosPonto
            .Include(r => r.Academico)
            .ToList();

        return Ok(registros);
    }

    [HttpPost("entrada/{academicoId}")]
    public IActionResult RegistrarEntrada(int academicoId)
    {
        var academicoExiste = _context.Academicos.Any(a => a.Id == academicoId);

        if (!academicoExiste)
        {
            return NotFound("Acadêmico não encontrado.");
        }

        var hoje = DateTime.Today;

        var registrosHoje = _context.RegistrosPonto.Count(r =>
            r.AcademicoId == academicoId &&
            r.Data == hoje
        );

        if (registrosHoje >= 2)
        {
            return BadRequest("Limite diário atingido: são permitidas apenas 2 entradas e 2 saídas por dia.");
        }

        var entradaAberta = _context.RegistrosPonto.Any(r =>
            r.AcademicoId == academicoId &&
            r.HoraSaida == null
        );

        if (entradaAberta)
        {
            return BadRequest("Já existe uma entrada aberta para este acadêmico.");
        }

        var registro = new RegistroPonto
        {
            AcademicoId = academicoId,
            Data = DateTime.Now.Date,
            HoraEntrada = DateTime.Now
        };

        _context.RegistrosPonto.Add(registro);
        _context.SaveChanges();

        return Ok(registro);
    }

    [HttpPost("saida/{academicoId}")]
    public IActionResult RegistrarSaida(int academicoId)
    {
        var hoje = DateTime.Today;

        var saidasHoje = _context.RegistrosPonto.Count(r =>
            r.AcademicoId == academicoId &&
            r.Data == hoje &&
            r.HoraSaida != null
        );

        if (saidasHoje >= 2)
        {
            return BadRequest("Limite diário atingido: são permitidas apenas 2 saídas por dia.");
        }

        var registro = _context.RegistrosPonto
            .Where(r =>
                r.AcademicoId == academicoId &&
                r.HoraSaida == null
            )
            .OrderByDescending(r => r.HoraEntrada)
            .FirstOrDefault();

        if (registro == null)
        {
            return NotFound("Entrada não encontrada.");
        }

        registro.HoraSaida = DateTime.Now;

        registro.TotalTrabalhado =
            registro.HoraSaida.Value - registro.HoraEntrada.Value;

        _context.SaveChanges();

        return Ok(registro);
    }
}
