using backend.DTOs;

namespace backend.Services.Interfaces;

public interface IRegistroPontoService
{
    Task<List<RegistroPontoResponseDTO>>
        ObterRegistrosAsync(
            int academicoIdLogado,
            bool usuarioEhAdmin,
            DateTime? dataInicio,
            DateTime? dataFim
        );

    Task<bool> RegistrarEntradaAsync(
int academicoId
);
    Task<bool> RegistrarSaidaAsync(
        int academicoId
    );
}