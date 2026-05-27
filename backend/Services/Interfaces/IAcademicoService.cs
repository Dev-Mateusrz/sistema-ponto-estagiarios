using backend.DTOs;
using backend.Models;

namespace backend.Services.Interfaces;

public interface IAcademicoService
{
    Task<LoginResponseDTO?> LoginAsync(
        LoginRequest dadosLogin
    );
}