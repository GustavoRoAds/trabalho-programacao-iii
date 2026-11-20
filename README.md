# Trabalho de Programação III — Lembretes

Projetos iniciais fornecidos pelo professor, reunidos em um único repositório para desenvolver a atividade.

## Estrutura

- `api/`: API ASP.NET Core (projeto original, .NET 8).
- `frontend/`: HTML, CSS e JavaScript (projeto original).

## Executar localmente

1. Instale .NET 8 SDK e MySQL.
2. Crie o banco `umfg_lembrete_develop` no MySQL.
3. No diretório do projeto .NET, configure localmente `appsettings.Development.json` com sua conexão MySQL. Esse arquivo está no `.gitignore` para não publicar credenciais.
4. Abra `api/umfg.programacaoiii.minimalapi.2026.sln` no Visual Studio e execute a API.
5. Abra `frontend/index.html` com um servidor local (por exemplo, Live Server no VS Code).
6. Ajuste a URL da API no JavaScript, se a porta local for diferente.

## Origem

- API: https://github.com/leicam/umfg-programacao-iii-minimal-api-2026
- Front-end: https://github.com/leicam/umfg-programacao-iii-front-end-2026

## Estado

Versão inicial dos projetos do professor, antes das implementações da atividade.
