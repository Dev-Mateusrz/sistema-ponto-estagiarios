using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
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

    private int? ObterAcademicoIdLogado()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (int.TryParse(idClaim, out var academicoId))
        {
            return academicoId;
        }

        return null;
    }

    private bool UsuarioEhAdmin()
    {
        return User.IsInRole("Admin");
    }

    [Authorize]
    [HttpGet]
    public IActionResult Get()
    {
        var academicoIdLogado = ObterAcademicoIdLogado();

        if (academicoIdLogado == null)
        {
            return Unauthorized();
        }

        var usuarioEhAdmin = UsuarioEhAdmin();

        var registros = _context.RegistrosPonto
            .Include(r => r.Academico)
            .Where(r => usuarioEhAdmin || r.AcademicoId == academicoIdLogado.Value)
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

    [Authorize]
    [HttpPost("entrada")]
    public IActionResult RegistrarEntrada()
    {
        var academicoId = ObterAcademicoIdLogado();

        if (academicoId == null)
        {
            return Unauthorized();
        }

        var academicoExiste = _context.Academicos.Any(a =>
            a.Id == academicoId.Value &&
            a.Ativo
        );

        if (!academicoExiste)
        {
            return NotFound("Academico nao encontrado.");
        }

        var hoje = DateTime.Today;

        var registrosHoje = _context.RegistrosPonto.Count(r =>
            r.AcademicoId == academicoId.Value &&
            r.Data == hoje
        );

        if (registrosHoje >= 2)
        {
            return BadRequest("Limite diário atingido: são permitidas apenas 2 entradas e 2 saídas por dia.");
        }

        var entradaAberta = _context.RegistrosPonto.Any(r =>
            r.AcademicoId == academicoId.Value &&
            r.Data == hoje &&
            r.HoraSaida == null
        );

        if (entradaAberta)
        {
            return BadRequest("Já existe uma entrada aberta para este acadêmico.");
        }

        var registro = new RegistroPonto
        {
            AcademicoId = academicoId.Value,
            Data = DateTime.Now.Date,
            HoraEntrada = DateTime.Now
        };

        _context.RegistrosPonto.Add(registro);
        _context.SaveChanges();

        return Ok(registro);
    }

    [Authorize]
    [HttpPost("saida")]
    public IActionResult RegistrarSaida()
    {
        var academicoId = ObterAcademicoIdLogado();

        if (academicoId == null)
        {
            return Unauthorized();
        }

        var hoje = DateTime.Today;

        var academicoExiste = _context.Academicos.Any(a =>
            a.Id == academicoId.Value &&
            a.Ativo
        );

        if (!academicoExiste)
        {
            return NotFound("Academico nao encontrado.");
        }

        var saidasHoje = _context.RegistrosPonto.Count(r =>
            r.AcademicoId == academicoId.Value &&
            r.Data == hoje &&
            r.HoraSaida != null
        );

        if (saidasHoje >= 2)
        {
            return BadRequest("Limite diário atingido: são permitidas apenas 2 saídas por dia.");
        }

        var registro = _context.RegistrosPonto
            .Where(r =>
                r.AcademicoId == academicoId.Value &&
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
