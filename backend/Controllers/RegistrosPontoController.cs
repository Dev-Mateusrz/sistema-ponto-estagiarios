using backend.DTOs;
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
public async Task<IActionResult> Get(
    DateTime? dataInicio,
    DateTime? dataFim
)
{
    var academicoIdLogado =
        ObterAcademicoIdLogado();

    if (academicoIdLogado == null)
    {
        return Unauthorized(
            "Usuário não autenticado."
        );
    }

    var usuarioEhAdmin =
        UsuarioEhAdmin();

    var query = _context.RegistrosPonto
        .Include(r => r.Academico)
        .AsQueryable();

    if (!usuarioEhAdmin)
    {
        query = query.Where(r =>
            r.AcademicoId ==
            academicoIdLogado.Value
        );
    }

    if (dataInicio.HasValue)
    {
        query = query.Where(r =>
            r.HoraEntrada >=
            dataInicio.Value
        );
    }

    if (dataFim.HasValue)
    {
        query = query.Where(r =>
            r.HoraEntrada <=
            dataFim.Value
        );
    }

    var registros = await query
        .OrderByDescending(r => r.HoraEntrada)
        .Select(r => new RegistroPontoResponseDTO
        {
            Id = r.Id,

            AcademicoId =
                r.AcademicoId,

            NomeAcademico =
    r.Academico != null
        ? r.Academico.Nome
        : "Acadêmico não encontrado",

            Entrada =
                r.HoraEntrada,

            Saida =
                r.HoraSaida,

            TotalHoras =
                r.TotalTrabalhado
        })
        .ToListAsync();

    return Ok(registros);
}

    [Authorize]
    [HttpPost("entrada")]
    public async Task<IActionResult> RegistrarEntrada()
    {
        var academicoId = ObterAcademicoIdLogado();

        if (academicoId == null)
        {
            return Unauthorized();
        }

        var academicoExiste = await _context.Academicos.AnyAsync(a =>
            a.Id == academicoId.Value &&
            a.Ativo
        );

        if (!academicoExiste)
        {
            return NotFound("Academico nao encontrado.");
        }

        var hoje = DateTime.Today;

        var registrosHoje = await _context.RegistrosPonto.CountAsync(r =>
            r.AcademicoId == academicoId.Value &&
            r.Data.Date == hoje
        );

        if (registrosHoje >= 2)
        {
            return BadRequest("Limite diário atingido: máximo de 2 expedientes por dia.");
        }

        var entradaAberta = await _context.RegistrosPonto.AnyAsync(r =>
            r.AcademicoId == academicoId.Value &&
            r.Data.Date == hoje &&
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
        await _context.SaveChangesAsync();

        return Ok(registro);
    }

    [Authorize]
    [HttpPost("saida")]
    public async Task<IActionResult> RegistrarSaida()
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


        var registro = await _context.RegistrosPonto
            .Where(r =>
                r.AcademicoId == academicoId.Value &&
                r.Data.Date == hoje &&
                r.HoraSaida == null
            )
            .OrderByDescending(r => r.HoraEntrada)
            .FirstOrDefaultAsync();

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

       await _context.SaveChangesAsync();

        return Ok(registro);
    }
}
