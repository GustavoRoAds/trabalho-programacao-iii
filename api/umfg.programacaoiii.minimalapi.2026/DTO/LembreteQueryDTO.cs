using umfg.programacaoiii.minimalapi._2026.Entidades;

namespace umfg.programacaoiii.minimalapi._2026.DTO;

public sealed class LembreteQueryDTO
{
    public sealed class LembreteQueryRequestDTO
    {
        public int NumeroPagina { get; set; } = 1;

        public int TamanhoPagina { get; set; } = 10;

        // Filtros opcionais: não exigem parâmetros na query string.
        public string? Descricao { get; set; }

        public DateTime? DataCadastroInicial { get; set; }

        public DateTime? DataCadastroFinal { get; set; }

        public DateTime? DataAtualizacaoInicial { get; set; }

        public DateTime? DataAtualizacaoFinal { get; set; }

        public string? Ordem { get; set; }

        public string? Direcao { get; set; }
    }

    public sealed class LembreteQueryResponseDTO
    {
        public ICollection<Lembrete> Lembretes { get; set; } = [];

        public long Total { get; set; }

        public int NumeroPagina { get; set; }

        public int TamanhoPagina { get; set; }
    }
}
