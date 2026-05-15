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
            .OrderByDescending(r => r.HoraEntrada)
            .Select(r => new
            {
                r.Id,
                r.AcademicoId,
                r.Data,
                r.HoraEntrada,
                r.HoraSaida,
                r.TotalTrabalhado,
                Academico = r.Academico == null ? null : new
                {
                    r.Academico.Matricula,
                    r.Academico.Nome,
                    r.Academico.Email,
                    r.Academico.EhAdmin,
                    r.Academico.HorarioEntrada,
                    r.Academico.HorarioSaida,
                    r.Academico.Ativo
                }
            })
            .ToList();

        return Ok(registros);
    }

    [HttpPost("entrada/{academicoId}")]
    public IActionResult RegistrarEntrada(int academicoId)
    {
        var academicoExiste = _context.Academicos.Any(a =>
            a.Id == academicoId &&
            a.Ativo
        );

        if (!academicoExiste)
        {
            return NotFound("Academico nao encontrado.");
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
            r.Data == hoje &&
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

        var academicoExiste = _context.Academicos.Any(a =>
            a.Id == academicoId &&
            a.Ativo
        );

        if (!academicoExiste)
        {
            return NotFound("Academico nao encontrado.");
        }

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
                r.Data == hoje &&
                r.HoraSaida == null
            )
            .OrderByDescending(r => r.HoraEntrada)
            .FirstOrDefault();

        if (registro == null)
        {
            return NotFound("Entrada não encontrada.");
        }

        if (registro.HoraEntrada == null)
        {
            return BadRequest("Registro de entrada invalido.");
        }

        var horaSaida = DateTime.Now;

        registro.HoraSaida = horaSaida;
        registro.TotalTrabalhado = horaSaida - registro.HoraEntrada.Value;

        _context.SaveChanges();

        return Ok(registro);
    }
}
