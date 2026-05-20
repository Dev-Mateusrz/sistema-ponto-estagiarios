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

    public AcademicosController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    // Retorna todos os acadêmicos cadastrados
    [Authorize(Roles = "Admin")]
    [HttpGet]
    public IActionResult Get()
    {
        var academicos = _context.Academicos
            .Where(a => a.Ativo)
            .Select(a => new
            {
                a.Id,
                a.Matricula,
                a.Nome,
                a.Email,
                a.EhAdmin,
                a.HorarioEntrada,
                a.HorarioSaida,
                a.PrecisaDefinirSenha,
                a.Ativo
            })
            .ToList();

        return Ok(academicos);
    }

    // Cadastra um novo acadêmico ou administrador
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public IActionResult Post(CriarAcademicoRequest dadosCadastro)
    {
        if (string.IsNullOrWhiteSpace(dadosCadastro.Matricula))
        {
            return BadRequest("A matrícula é obrigatória.");
        }

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

        var emailJaExiste = _context.Academicos.Any(a =>
            a.Ativo &&
            a.Email == dadosCadastro.Email
        );

        if (emailJaExiste)
        {
            return BadRequest("Já existe um usuário cadastrado com este email.");
        }

        var matriculaJaExiste = _context.Academicos.Any(a =>
            a.Ativo &&
            a.Matricula == dadosCadastro.Matricula
        );

        if (matriculaJaExiste)
        {
            return BadRequest("Já existe um usuário cadastrado com esta matrícula.");
        }

        var academico = new Academico
        {
            Matricula = dadosCadastro.Matricula,
            Nome = dadosCadastro.Nome,
            Email = dadosCadastro.Email,
            EhAdmin = dadosCadastro.EhAdmin,
            HorarioEntrada = dadosCadastro.HorarioEntrada,
            HorarioSaida = dadosCadastro.HorarioSaida,
            PrecisaDefinirSenha = true,
            Ativo = true
        };

        _context.Academicos.Add(academico);
        _context.SaveChanges();

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
            academico.Ativo
        });
    }

    // Realiza o login dos acadêmicos e administradores
    [AllowAnonymous]
    [HttpPost("login")]
    public IActionResult Login(LoginRequest dadosLogin)
    {
        var academico = _context.Academicos.FirstOrDefault(a =>
            a.Ativo &&
            a.Email == dadosLogin.Email
        );

        if (academico == null || !academico.Ativo)
        {
            return Unauthorized("Email ou senha inválidos.");
        }

        if (academico.PrecisaDefinirSenha)
        {
            return StatusCode(403, "Primeiro acesso pendente. Defina sua senha para continuar.");
        }

        var resultadoSenha = VerificarSenha(academico, dadosLogin.Senha);

        if (resultadoSenha == PasswordVerificationResult.Failed)
        {
            return Unauthorized("Email ou senha inválidos.");
        }

        if (resultadoSenha == PasswordVerificationResult.SuccessRehashNeeded)
        {
            academico.Senha = _passwordHasher.HashPassword(
                academico,
                dadosLogin.Senha
            );

            _context.SaveChanges();
        }

        var role = academico.EhAdmin ? "Admin" : "Academico";

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, academico.Id.ToString()),
            new Claim(ClaimTypes.Name, academico.Nome),
            new Claim(ClaimTypes.Email, academico.Email),
            new Claim(ClaimTypes.Role, role)
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!)
        );

        var credentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256
        );

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            claims: claims,
            expires: DateTime.Now.AddHours(8),
            signingCredentials: credentials
        );

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        return Ok(new
        {
            token = tokenString,
            academico.Id,
            academico.Matricula,
            academico.Nome,
            academico.Email,
            academico.EhAdmin,
            academico.HorarioEntrada,
            academico.HorarioSaida,
            academico.PrecisaDefinirSenha,
            academico.Ativo
        });
    }

    [AllowAnonymous]
    [HttpPost("primeiro-acesso")]
    public IActionResult PrimeiroAcesso(PrimeiroAcessoRequest dadosPrimeiroAcesso)
    {
        if (string.IsNullOrWhiteSpace(dadosPrimeiroAcesso.Email))
        {
            return BadRequest("O email é obrigatório.");
        }

        if (string.IsNullOrWhiteSpace(dadosPrimeiroAcesso.Matricula))
        {
            return BadRequest("A matrícula é obrigatória.");
        }

        if (string.IsNullOrWhiteSpace(dadosPrimeiroAcesso.NovaSenha))
        {
            return BadRequest("A nova senha é obrigatória.");
        }

        if (dadosPrimeiroAcesso.NovaSenha.Length < 6)
        {
            return BadRequest("A nova senha deve ter pelo menos 6 caracteres.");
        }

        var academico = _context.Academicos.FirstOrDefault(a =>
            a.Ativo &&
            a.Email == dadosPrimeiroAcesso.Email &&
            a.Matricula == dadosPrimeiroAcesso.Matricula
        );

        if (academico == null)
        {
            return NotFound("Usuário não encontrado.");
        }

        if (!academico.PrecisaDefinirSenha)
        {
            return BadRequest("A senha deste usuário já foi definida.");
        }

        academico.Senha = _passwordHasher.HashPassword(
            academico,
            dadosPrimeiroAcesso.NovaSenha
        );
        academico.PrecisaDefinirSenha = false;

        _context.SaveChanges();

        return Ok("Senha definida com sucesso. Faça login para continuar.");
    }

    private PasswordVerificationResult VerificarSenha(
        Academico academico,
        string senhaInformada
    )
    {
        if (academico.Senha == senhaInformada)
        {
            return PasswordVerificationResult.SuccessRehashNeeded;
        }

        try
        {
            return _passwordHasher.VerifyHashedPassword(
                academico,
                academico.Senha,
                senhaInformada
            );
        }
        catch (FormatException)
        {
            return PasswordVerificationResult.Failed;
        }
    }

    // Exclui um acadêmico ou administrador pelo ID
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        var academico = _context.Academicos.Find(id);

        if (academico == null || !academico.Ativo)
        {
            return NotFound("Acadêmico não encontrado.");
        }

        academico.Ativo = false;
        _context.SaveChanges();

        return NoContent();
    }
}
