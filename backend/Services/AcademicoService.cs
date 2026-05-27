using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services.Interfaces;

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Services;

public class AcademicoService
    : IAcademicoService
{
    private readonly AppDbContext _context;

    private readonly IConfiguration _configuration;

    private readonly PasswordHasher<Academico>
        _passwordHasher = new();

    public AcademicoService(
        AppDbContext context,
        IConfiguration configuration
    )
    {
        _context = context;

        _configuration = configuration;
    }

    public async Task<LoginResponseDTO?> LoginAsync(
        LoginRequest dadosLogin
    )
    {
        var academico =
            await _context.Academicos
                .FirstOrDefaultAsync(a =>
                    a.Ativo &&
                    a.Email == dadosLogin.Email
                );

        if (
            academico == null ||
            !academico.Ativo
        )
        {
            return null;
        }

        if (academico.PrecisaDefinirSenha)
        {
            return null;
        }

        var resultadoSenha =
            _passwordHasher.VerifyHashedPassword(
                academico,
                academico.Senha,
                dadosLogin.Senha
            );

        if (
            resultadoSenha ==
            PasswordVerificationResult.Failed
        )
        {
            return null;
        }

        var role = academico.EhAdmin
            ? "Admin"
            : "Academico";

        var claims = new[]
        {
            new Claim(
                ClaimTypes.NameIdentifier,
                academico.Id.ToString()
            ),

            new Claim(
                ClaimTypes.Name,
                academico.Nome
            ),

            new Claim(
                ClaimTypes.Email,
                academico.Email
            ),

            new Claim(
                ClaimTypes.Role,
                role
            )
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(
                _configuration["Jwt:Key"]!
            )
        );

        var credentials =
            new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256
            );

        var token = new JwtSecurityToken(
            issuer:
                _configuration["Jwt:Issuer"],

            audience:
                _configuration["Jwt:Audience"],

            claims: claims,

            expires:
                DateTime.UtcNow.AddHours(2),

            signingCredentials:
                credentials
        );

        var tokenString =
            new JwtSecurityTokenHandler()
                .WriteToken(token);

        return new LoginResponseDTO
        {
            Token = tokenString,

            Id = academico.Id,

            Matricula = academico.Matricula,

            Nome = academico.Nome,

            Email = academico.Email,

            EhAdmin = academico.EhAdmin,

            HorarioEntrada =
                academico.HorarioEntrada,

            HorarioSaida =
                academico.HorarioSaida,

            PrecisaDefinirSenha =
                academico.PrecisaDefinirSenha,

            Ativo = academico.Ativo
        };
    }
}