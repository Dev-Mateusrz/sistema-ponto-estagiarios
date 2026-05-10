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
        var academicos = _context.Academicos.ToList();

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

        var emailJaExiste = _context.Academicos.Any(a => a.Email == academico.Email);

        if (emailJaExiste)
        {
            return BadRequest("Já existe um usuário cadastrado com este email.");
        }

        var matriculaJaExiste = _context.Academicos.Any(a => a.Matricula == academico.Matricula);

        if (matriculaJaExiste)
        {
            return BadRequest("Já existe um usuário cadastrado com esta matrícula.");
        }

        _context.Academicos.Add(academico);
        _context.SaveChanges();

        return Created("", academico);
    }

    // Realiza o login dos acadêmicos e administradores
    [HttpPost("login")]
    public IActionResult Login(Academico dadosLogin)
    {
        var academico = _context.Academicos.FirstOrDefault(a =>
            a.Email == dadosLogin.Email &&
            a.Senha == dadosLogin.Senha
        );

        if (academico == null)
        {
            return Unauthorized("Email ou senha inválidos.");
        }

        return Ok(academico);
    }

    // Exclui um acadêmico ou administrador pelo ID
    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        var academico = _context.Academicos.Find(id);

        if (academico == null)
        {
            return NotFound("Acadêmico não encontrado.");
        }

        _context.Academicos.Remove(academico);
        _context.SaveChanges();

        return NoContent();
    }
}
