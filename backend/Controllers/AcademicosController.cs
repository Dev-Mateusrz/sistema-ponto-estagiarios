using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("academicos")]
public class AcademicosController : ControllerBase
{
    private readonly AppDbContext _context;

    public AcademicosController(AppDbContext context)
    {
        _context = context;
    }

    // Retorna todos os acadêmicos cadastrados
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
                a.Ativo
            })
            .ToList();

        return Ok(academicos);
    }

    // Cadastra um novo acadêmico ou administrador
    [HttpPost]
    public IActionResult Post(Academico academico)
    {
        if (string.IsNullOrWhiteSpace(academico.Matricula))
        {
            return BadRequest("A matrícula é obrigatória.");
        }

        if (string.IsNullOrWhiteSpace(academico.Nome))
        {
            return BadRequest("O nome é obrigatório.");
        }

        if (string.IsNullOrWhiteSpace(academico.Email))
        {
            return BadRequest("O email é obrigatório.");
        }

        if (!academico.Email.EndsWith("@gmail.com"))
        {
            return BadRequest("O email deve ser um Gmail válido.");
        }

        if (string.IsNullOrWhiteSpace(academico.Senha))
        {
            return BadRequest("A senha é obrigatória.");
        }

        var emailJaExiste = _context.Academicos.Any(a =>
            a.Ativo &&
            a.Email == academico.Email
        );

        if (emailJaExiste)
        {
            return BadRequest("Já existe um usuário cadastrado com este email.");
        }

        var matriculaJaExiste = _context.Academicos.Any(a =>
            a.Ativo &&
            a.Matricula == academico.Matricula
        );

        if (matriculaJaExiste)
        {
            return BadRequest("Já existe um usuário cadastrado com esta matrícula.");
        }

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
            academico.Ativo
        });
    }

    // Realiza o login dos acadêmicos e administradores
    [HttpPost("login")]
    public IActionResult Login(Academico dadosLogin)
    {
        var academico = _context.Academicos.FirstOrDefault(a =>
            a.Ativo &&
            a.Email == dadosLogin.Email &&
            a.Senha == dadosLogin.Senha
        );

        if (academico == null || !academico.Ativo)
        {
            return Unauthorized("Email ou senha inválidos.");
        }

        return Ok(new
        {
            academico.Id,
            academico.Matricula,
            academico.Nome,
            academico.Email,
            academico.EhAdmin,
            academico.HorarioEntrada,
            academico.HorarioSaida,
            academico.Ativo
        });
    }

    // Exclui um acadêmico ou administrador pelo ID
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
