# Convenções do Projeto — Sistema de Ponto (Estagiários)

## Stack do projeto

**Backend:** C# / ASP.NET Core (.NET 9.0), Entity Framework Core 9.0.0, JWT Bearer, Swagger/Swashbuckle.

**Frontend:** React 19.2.5, TypeScript 6.0.2, Vite 8.0.10, React Router DOM 7.15.0, Tailwind CSS 4.2.4, jsPDF (geração de relatórios em PDF), Lucide React (ícones).

**Ferramentas:** ESLint + TypeScript-ESLint (lint do frontend), npm (gerenciador de pacotes do frontend), dotnet CLI (build/run do backend).

### Banco de dados — situação atual (transitório)

| Branch | Banco de dados |
|---|---|
| `main` / `develop` | SQL Server |
| `feat/arquitetura-sistema` | PostgreSQL |
| `feat/auth-segura` | PostgreSQL |
| `feat/refactor-admin-dashboard` | PostgreSQL |

As três branches de feature acima já foram migradas de SQL Server para **PostgreSQL** (via `Npgsql.EntityFrameworkCore.PostgreSQL`), mas ainda estão em análise para aprovação de merge em `develop`. **Enquanto isso não acontece**, `main` e `develop` continuam em SQL Server.

> ⚠️ Esta seção é transitória. Quando as três branches forem mergeadas em `develop`, atualizar este arquivo: remover a tabela acima, trocar a referência de banco para PostgreSQL em todo o documento, e voltar a usar `develop` como base padrão para novas branches (ver seção abaixo).

> Ainda **não há projeto de testes automatizados** (nem backend `.Tests`, nem runner de testes no frontend). As regras abaixo refletem isso — ajustar quando os testes forem criados.

## Estrutura de branches principais

- `main`: produção. Protegida — nunca commitar nem dar push direto aqui.
- `develop`: desenvolvimento. Base padrão para criar branches de `feature`, `fix`, `chore`, `docs`, `refactor`, `test` — **quando não houver exceção transitória ativa** (ver abaixo).

### Regra ATUAL para novas branches (enquanto a migração de banco não for mergeada)

- Criar a branch a partir de **`feat/arquitetura-sistema`** (não de `develop`), para herdar a migração de PostgreSQL e evitar conflitos futuros de banco.
- Abrir o PR com destino (`base`) em **`feat/arquitetura-sistema`**, não em `develop`, até que essa branch seja aprovada e mergeada.
- Assim que `feat/arquitetura-sistema`, `feat/auth-segura` e `feat/refactor-admin-dashboard` forem mergeadas em `develop`, esta regra deixa de existir — voltar para "Regra geral" abaixo e remover este bloco do arquivo.

### Regra geral (válida após a migração ser mergeada em develop)

- Criar a branch a partir de `develop`.
- Abrir o PR com destino (`base`) em `develop`, nunca em `main`.

### Regra de hotfix (exceção)

- Criar a branch a partir de `main` (não de `develop`), porque o hotfix corrige algo que já está em produção e não pode vir misturado com código de `develop` ainda não liberado.
- Abrir **dois PRs**: um para `main` (leva a correção pra produção) e outro para `develop` (evita que o bug volte numa release futura).
- Atenção: enquanto `main` ainda estiver em SQL Server e o restante do projeto migrando para PostgreSQL, confirmar manualmente qual banco o hotfix precisa afetar antes de abrir o PR.

## Branches — formato de nome

Formato: `<tipo>/<descricao-curta-em-kebab-case>`

Tipos válidos (alinhados com os tipos de commit): `feature`, `fix`, `hotfix`, `chore`, `docs`, `refactor`, `test`

Sem ID de task — esse projeto não usa sistema de tickets.

Exemplo: `feature/relatorio-pdf-estagiarios`

## Commits

- Prefira mensagens em pt-br, descrevendo o que mudou e por que, quando couber em uma linha.
- Use Conventional Commits, sempre em mensagem curta e objetiva.

Tipos e exemplos:

```
feat: adiciona geração de relatório em PDF
fix: corrige cálculo de horas extras no ponto
docs: atualiza guia de configuração do ambiente
refactor: reorganiza serviço de autenticação JWT
test: cobre validação de horário de entrada
chore: ajusta configuração do Vite
```

### Antes de commitar

Revisar escopo sempre:

```
git status
git diff
```

Depois:

```
git add caminho/do/arquivo
git commit -m "tipo: resumo objetivo da mudança"
```

**Nunca usar `git add .` sem revisar antes.**

## Checks obrigatórios (rodar conforme o que foi alterado)

| Mudança | Check mínimo |
|---|---|
| Backend | `dotnet build --configuration Release` (ajustar para o `.csproj`/`.sln` correto se houver mais de um no repositório) |
| Backend com regra de negócio | Ainda não há projeto de testes — documentar validação manual no PR, descrevendo o cenário testado |
| Frontend | `npm run build` |
| Frontend com comportamento novo | Ainda não há runner de testes — documentar validação manual no PR |
| Frontend com lint relevante | `npm run lint`, se o lint estiver limpo no contexto |
| Migration EF Core | Revisar a migration gerada e confirmar que aponta para o banco correto da branch base atual (PostgreSQL em `feat/arquitetura-sistema` e branches derivadas; SQL Server em `main`/`develop`/hotfix) |
| Documentação | Reler comandos, URLs e variáveis citadas |

Se a mudança tocar mais de uma camada (ex: backend + frontend), aplicar **todos** os checks correspondentes às camadas alteradas — não apenas um deles.

## Abrindo Pull Request

### Antes do PR

1. Garantir que a branch está atualizada com a base correta (atualmente `feat/arquitetura-sistema` enquanto a migração não for mergeada; depois disso, `develop` na regra geral, `main` em hotfix — ver "Estrutura de branches principais").
2. Rodar os checks mínimos conforme a tabela acima.
3. Confirmar que não há secrets novos, `.env.local`, dumps ou arquivos temporários (atenção especial à connection string, que muda entre SQL Server e PostgreSQL dependendo da branch).
4. Confirmar que migrations do EF Core estão explicadas no PR, incluindo qual banco elas afetam.

### Push

```
git push -u origin feature/relatorio-pdf-estagiarios
```

### Título do PR

Seguir Conventional Commits, igual ao commit principal:

```
feat: adiciona geração de relatório em PDF
```

### Descrição do PR (template)

```
## Resumo
- O que mudou
- Por que mudou

## Validação
- [ ] dotnet build --configuration Release
- [ ] npm run build
- [ ] npm run lint
- [ ] teste manual do fluxo afetado
- [ ] prints/vídeo quando houver mudança visual

## Riscos / observações
- Migrations EF Core:
- Variáveis de ambiente:
- Validação manual realizada (já que não há testes automatizados ainda):
```

Marcar no checklist apenas os itens aplicáveis à mudança feita (ver tabela de checks acima).

### Regra adicional

Se o PR tocar frontend visual, incluir print ou descrever claramente o fluxo testado.
