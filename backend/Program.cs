using backend.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

//Permite usar os controllers da API
builder.Services.AddControllers();

//Libera o front consumir a API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

//Configura conexão com SQL server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ));

var app = builder.Build();

//Aplica configuração do CORS (faz o backend usar as regras de acesso)
app.UseCors("AllowFrontend");

//Ativa rota dos controllers
app.MapControllers();

app.Run();
