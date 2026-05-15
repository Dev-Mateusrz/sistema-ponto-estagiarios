# Sistema de Ponto para Estagiários

Aplicação fullstack para controle de entrada, saída, presença, ausência e relatórios de ponto de acadêmicos bolsistas/estagiários.

## Funcionalidades

- Login de usuários
- Cadastro de acadêmicos e administradores
- Registro de entrada e saída
- Controle de status: aguardando entrada, atrasado, no expediente, ausente e expediente encerrado
- Painel administrativo
- Painel do acadêmico
- Relatório administrativo em PDF com status de presença
- Relatório individual em PDF
- API documentada com Swagger

## Tecnologias

- C#
- ASP.NET Core
- Entity Framework Core
- SQL Server LocalDB
- React
- TypeScript
- Vite
- Tailwind CSS
- jsPDF
- Swagger

## Como executar

### Backend

cd backend
dotnet run

Swagger:
http://localhost:4000/swagger/index.html

### Frontend

cd frontend
npm install
npm run dev

Frontend:
http://localhost:5174

## Banco de dados

O projeto usa SQL Server LocalDB. A estrutura do banco é criada a partir das migrations do Entity Framework Core.
