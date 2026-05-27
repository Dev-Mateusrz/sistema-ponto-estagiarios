using backend.Services.Interfaces;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("academicos")]
public class AcademicosController : ControllerBase
{
    private readonly AppDbContext _context;

    private readonly IConfiguration _configuration;

    private readonly PasswordHasher<Academico> _passwordHasher = new();

    public AcademicosController(
    AppDbContext context,

    IConfiguration configuration,

    IAcademicoService academicoService
)
    {
        _context = context;
        _configuration = configuration;
        _academicoService = academicoService;
    }

    // Retorna todos os acadêmicos cadastrados
    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var academicos = await _context.Academicos
            .Where(a => a.Ativo)
            .Select(a => new AcademicoResponseDTO
{
    Id = a.Id,

    Matricula = a.Matricula,

    Nome = a.Nome,

    Email = a.Email,

    EhAdmin = a.EhAdmin,

    HorarioEntrada = a.HorarioEntrada,

    HorarioSaida = a.HorarioSaida,

    PrecisaDefinirSenha =
        a.PrecisaDefinirSenha,

    Ativo = a.Ativo
})
            .ToListAsync();

        return Ok(academicos);
    }

    // Cadastra um novo acadêmico ou administrador
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Post(
        CriarAcademicoRequest dadosCadastro
    )
    {
        if (string.IsNullOrWhiteSpace(dadosCadastro.Nome))
        {
            return BadRequest("O nome é obrigatório.");
        }

        if (string.IsNullOrWhiteSpace(dadosCadastro.Email))
        {
            return BadRequest("O email é obrigatório.");
        }

        if (!dadosCadastro.Email.EndsWith("@gmail.com"))
        {
            return BadRequest("O email deve ser um Gmail válido.");
        }

        var emailJaExiste = await _context.Academicos.AnyAsync(a =>
            a.Ativo &&
            a.Email == dadosCadastro.Email
        );

        if (emailJaExiste)
        {
            return BadRequest(
                "Já existe um usuário cadastrado com este email."
            );
        }

        var matriculaJaExiste = await _context.Academicos.AnyAsync(a =>
            a.Ativo &&
            a.Matricula == dadosCadastro.Matricula
        );

        if (matriculaJaExiste)
        {
            return BadRequest(
                "Já existe um usuário cadastrado com esta matrícula."
            );
        }

        var academico = new Academico
        {
            PrimeiroAcessoToken = Guid.NewGuid().ToString(),

            PrimeiroAcessoTokenExpiraEm =
                DateTime.UtcNow.AddHours(24),

            Matricula = dadosCadastro.Matricula,

            Nome = dadosCadastro.Nome,

            Email = dadosCadastro.Email,

            EhAdmin = dadosCadastro.EhAdmin,

            HorarioEntrada =
                dadosCadastro.HorarioEntrada,

            HorarioSaida =
                dadosCadastro.HorarioSaida,

            PrecisaDefinirSenha = true,

            Ativo = true
        };

        try
        {
            _context.Academicos.Add(academico);

            await _context.SaveChangesAsync();
        }
        catch
        {
            return BadRequest(
                "Já existe um usuário com este email ou matrícula."
            );
        }

        return Created("", new
        {
            academico.Id,
            academico.Matricula,
            academico.Nome,
            academico.Email,
            academico.EhAdmin,
            academico.HorarioEntrada,
            academico.HorarioSaida,
            academico.PrecisaDefinirSenha,
            academico.Ativo,

            primeiroAcessoToken =
                academico.PrimeiroAcessoToken
        });
    }

    // Realiza login
    [AllowAnonymous]
[EnableRateLimiting("login")]
[HttpPost("login")]
public async Task<IActionResult> Login(
    LoginRequest dadosLogin
)
{
    var resultado =
        await _academicoService
            .LoginAsync(dadosLogin);

    if (resultado == null)
    {
        return Unauthorized(
            "Email ou senha inválidos."
        );
    }

    return Ok(resultado);
}

    // Primeiro acesso
    [AllowAnonymous]
    [HttpPost("primeiro-acesso")]
    public async Task<IActionResult> PrimeiroAcesso(
        PrimeiroAcessoRequest dadosPrimeiroAcesso
    )
    {
        if (
            string.IsNullOrWhiteSpace(
                dadosPrimeiroAcesso.Email
            )
        )
        {
            return BadRequest(
                "O email é obrigatório."
            );
        }

        if (
            string.IsNullOrWhiteSpace(
                dadosPrimeiroAcesso.NovaSenha
            )
        )
        {
            return BadRequest(
                "A nova senha é obrigatória."
            );
        }

        if (
            dadosPrimeiroAcesso.NovaSenha.Length < 6
        )
        {
            return BadRequest(
                "A nova senha deve ter pelo menos 6 caracteres."
            );
        }

        var academico =
            await _context.Academicos
                .FirstOrDefaultAsync(a =>
                    a.Ativo &&
                    a.Email ==
                        dadosPrimeiroAcesso.Email &&
                    a.PrimeiroAcessoToken ==
                        dadosPrimeiroAcesso.Token &&
                    a.PrimeiroAcessoTokenExpiraEm >
                        DateTime.UtcNow
                );

        if (academico == null)
        {
            return NotFound(
                "Usuário não encontrado."
            );
        }

        if (!academico.PrecisaDefinirSenha)
        {
            return BadRequest(
                "A senha deste usuário já foi definida."
            );
        }

        academico.Senha =
            _passwordHasher.HashPassword(
                academico,
                dadosPrimeiroAcesso.NovaSenha
            );

        academico.PrecisaDefinirSenha = false;

        academico.PrimeiroAcessoToken = null;

        academico.PrimeiroAcessoTokenExpiraEm =
            null;

        await _context.SaveChangesAsync();

        return Ok(
            "Senha definida com sucesso. Faça login para continuar."
        );
    }

    private PasswordVerificationResult VerificarSenha(
        Academico academico,
        string senhaInformada
    )
    {
        try
        {
            return _passwordHasher
                .VerifyHashedPassword(
                    academico,
                    academico.Senha,
                    senhaInformada
                );
        }
        catch
        {
            return PasswordVerificationResult.Failed;
        }
    }

    // Exclui acadêmico
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var academico =
            await _context.Academicos.FindAsync(id);

        if (academico == null || !academico.Ativo)
        {
            return NotFound(
                "Acadêmico não encontrado."
            );
        }

        academico.Ativo = false;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    private readonly IAcademicoService
    _academicoService;
}