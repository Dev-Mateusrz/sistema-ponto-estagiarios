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
        return Ok(_context.Academicos.ToList());
    }

    // Cadastra um novo acadêmico
    [HttpPost]
    public IActionResult Post(Academico academico)
    {
        if (!academico.Email.EndsWith("@gmail.com"))
        {
            return BadRequest("O email deve ser um Gmail válido.");
        }

        _context.Academicos.Add(academico);
        _context.SaveChanges();

        return Created("", academico);
    }

//Vai realizar o login dos academicos
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




    //Deletar pessoas da lista
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
