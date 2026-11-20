// Endereço da API local (confira a porta no Visual Studio).
const API_URL = "https://localhost:7063";

let paginaAtual = 1;
let ordemAtual = "DataCadastro";
let direcaoAtual = "DESC";
let totalPaginas = 1;
let toastTimeout;

const elemento = (id) => document.getElementById(id);

const formulario = elemento("formulario");
const formLembrete = elemento("formLembrete");
const lembreteId = elemento("lembreteId");
const descricao = elemento("descricao");
const listaLembretes = elemento("listaLembretes");
const mensagemVazia = elemento("mensagemVazia");
const filtroDescricao = elemento("filtroDescricao");
const tamanhoPagina = elemento("tamanhoPagina");
const dataCadastroInicial = elemento("dataCadastroInicial");
const dataCadastroFinal = elemento("dataCadastroFinal");
const dataAtualizacaoInicial = elemento("dataAtualizacaoInicial");
const dataAtualizacaoFinal = elemento("dataAtualizacaoFinal");
const btnAnterior = elemento("btnAnterior");
const btnProximo = elemento("btnProximo");

function mostrarToast(mensagem, tipo = "error") {
    const toast = elemento("toast");
    clearTimeout(toastTimeout);
    toast.textContent = mensagem;
    toast.className = `toast toast-${tipo}`;
    toastTimeout = setTimeout(() => toast.classList.add("hidden"), 3500);
}

function validarPeriodos() {
    const periodos = [
        [dataCadastroInicial.value, dataCadastroFinal.value, "cadastro"],
        [dataAtualizacaoInicial.value, dataAtualizacaoFinal.value, "atualização"]
    ];

    for (const [inicio, fim, nome] of periodos) {
        if (inicio && fim && inicio > fim) {
            mostrarToast(`A data inicial de ${nome} não pode ser maior que a final.`);
            return false;
        }
    }

    return true;
}

function montarParametrosFiltro() {
    const parametros = new URLSearchParams({
        NumeroPagina: String(paginaAtual),
        TamanhoPagina: tamanhoPagina.value,
        Ordem: ordemAtual,
        Direcao: direcaoAtual
    });

    const opcionais = {
        Descricao: filtroDescricao.value.trim(),
        DataCadastroInicial: dataCadastroInicial.value,
        DataCadastroFinal: dataCadastroFinal.value,
        DataAtualizacaoInicial: dataAtualizacaoInicial.value,
        DataAtualizacaoFinal: dataAtualizacaoFinal.value
    };

    for (const [chave, valor] of Object.entries(opcionais)) {
        if (valor) {
            parametros.set(chave, valor);
        }
    }

    return parametros;
}

async function requisitar(url, opcoes) {
    let resposta;

    try {
        resposta = await fetch(url, opcoes);
    } catch (erro) {
        throw new Error("Não foi possível conectar à API. Verifique se ela está aberta.");
    }

    if (!resposta.ok) {
        if (resposta.status === 404) {
            throw new Error("Lembrete não encontrado.");
        }

        throw new Error(`A API retornou erro ${resposta.status}.`);
    }

    return resposta;
}

async function filtrarLembretes() {
    if (!validarPeriodos()) {
        return;
    }

    try {
        const parametros = montarParametrosFiltro();
        const resposta = await requisitar(`${API_URL}/lembretes/filtro?${parametros}`);
        const resultado = await resposta.json();

        const total = Number(resultado.total) || 0;
        const tamanho = Number(resultado.tamanhoPagina) || Number(tamanhoPagina.value);
        totalPaginas = Math.max(1, Math.ceil(total / tamanho));

        if (paginaAtual > totalPaginas) {
            paginaAtual = totalPaginas;
            return filtrarLembretes();
        }

        renderizarLembretes(resultado.lembretes || []);
        elemento("totalRegistros").textContent = `${total} registro${total === 1 ? "" : "s"}`;
        elemento("paginaAtual").textContent = `Página ${paginaAtual} de ${totalPaginas}`;
        btnAnterior.disabled = paginaAtual <= 1;
        btnProximo.disabled = paginaAtual >= totalPaginas;
        atualizarIndicadoresOrdenacao();
    } catch (erro) {
        listaLembretes.replaceChildren();
        mensagemVazia.textContent = "Não foi possível carregar os lembretes.";
        mensagemVazia.classList.remove("hidden");
        btnAnterior.disabled = true;
        btnProximo.disabled = true;
        mostrarToast(erro.message);
    }
}

function formatarData(data) {
    if (!data) {
        return "-";
    }

    const valor = new Date(data);
    return Number.isNaN(valor.getTime()) ? "-" : valor.toLocaleString("pt-BR");
}

function criarCelula(linha, conteudo) {
    const celula = document.createElement("td");
    celula.textContent = conteudo;
    linha.appendChild(celula);
    return celula;
}

function renderizarLembretes(lembretes) {
    listaLembretes.replaceChildren();
    mensagemVazia.textContent = "Nenhum lembrete encontrado.";
    mensagemVazia.classList.toggle("hidden", lembretes.length > 0);

    for (const lembrete of lembretes) {
        const linha = document.createElement("tr");
        criarCelula(linha, lembrete.descricao);
        criarCelula(linha, formatarData(lembrete.dataCadastro));
        criarCelula(linha, formatarData(lembrete.dataAtualizacao));

        const status = document.createElement("span");
        status.className = `status ${lembrete.isAtivo ? "status-ativo" : "status-inativo"}`;
        status.textContent = lembrete.isAtivo ? "Ativo" : "Inativo";
        const celulaStatus = document.createElement("td");
        celulaStatus.appendChild(status);
        linha.appendChild(celulaStatus);

        const acoes = document.createElement("div");
        acoes.className = "actions";

        const editar = document.createElement("button");
        editar.type = "button";
        editar.className = "btn btn-edit";
        editar.textContent = "Editar";
        editar.addEventListener("click", () => buscarLembrete(lembrete.id));

        const excluir = document.createElement("button");
        excluir.type = "button";
        excluir.className = "btn btn-danger";
        excluir.textContent = "Excluir";
        excluir.addEventListener("click", () => excluirLembrete(lembrete.id));

        acoes.append(editar, excluir);
        const celulaAcoes = document.createElement("td");
        celulaAcoes.appendChild(acoes);
        linha.appendChild(celulaAcoes);
        listaLembretes.appendChild(linha);
    }
}

function abrirFormularioNovo() {
    formLembrete.reset();
    lembreteId.value = "";
    elemento("tituloFormulario").textContent = "Novo lembrete";
    formulario.classList.remove("hidden");
    descricao.focus();
}

function fecharFormulario() {
    formulario.classList.add("hidden");
    formLembrete.reset();
    lembreteId.value = "";
}

async function buscarLembrete(id) {
    try {
        const resposta = await requisitar(`${API_URL}/lembretes/${id}`);
        const lembrete = await resposta.json();
        lembreteId.value = lembrete.id;
        descricao.value = lembrete.descricao;
        elemento("tituloFormulario").textContent = "Editar lembrete";
        formulario.classList.remove("hidden");
        descricao.focus();
    } catch (erro) {
        mostrarToast(erro.message);
    }
}

async function salvarLembrete(evento) {
    evento.preventDefault();
    const texto = descricao.value.trim();

    if (!texto) {
        mostrarToast("Informe uma descrição para o lembrete.");
        descricao.focus();
        return;
    }

    const id = lembreteId.value;
    const metodo = id ? "PUT" : "POST";
    const url = id ? `${API_URL}/lembretes/${id}` : `${API_URL}/lembretes`;
    const botaoSalvar = formLembrete.querySelector('button[type="submit"]');
    botaoSalvar.disabled = true;

    try {
        await requisitar(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ descricao: texto })
        });

        fecharFormulario();
        mostrarToast(id ? "Lembrete atualizado com sucesso." : "Lembrete cadastrado com sucesso.", "success");
        await filtrarLembretes();
    } catch (erro) {
        mostrarToast(erro.message);
    } finally {
        botaoSalvar.disabled = false;
    }
}

async function excluirLembrete(id) {
    if (!window.confirm("Deseja realmente excluir este lembrete?")) {
        return;
    }

    try {
        await requisitar(`${API_URL}/lembretes/${id}`, { method: "DELETE" });
        mostrarToast("Lembrete excluído com sucesso.", "success");
        await filtrarLembretes();
    } catch (erro) {
        mostrarToast(erro.message);
    }
}

async function imprimirLembretes() {
    if (!validarPeriodos()) {
        return;
    }

    try {
        const parametros = montarParametrosFiltro();
        const resposta = await requisitar(`${API_URL}/lembretes/imprimir?${parametros}`);
        const arquivo = await resposta.blob();
        const url = URL.createObjectURL(arquivo);
        const link = document.createElement("a");
        link.href = url;
        link.download = "relatorio-lembretes.pdf";
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (erro) {
        mostrarToast(erro.message);
    }
}

function atualizarIndicadoresOrdenacao() {
    for (const botao of document.querySelectorAll(".sort-button")) {
        const ativo = botao.dataset.ordem === ordemAtual;
        const indicador = botao.querySelector(".sort-indicator");
        indicador.textContent = ativo ? (direcaoAtual === "ASC" ? "↑" : "↓") : "↕";
        botao.setAttribute("aria-label", `Ordenar por ${botao.dataset.ordem}`);
        botao.closest("th").setAttribute(
            "aria-sort",
            ativo ? (direcaoAtual === "ASC" ? "ascending" : "descending") : "none"
        );
    }
}

// Eventos da tela.
elemento("btnNovo").addEventListener("click", abrirFormularioNovo);
elemento("btnCancelar").addEventListener("click", fecharFormulario);
elemento("btnImprimir").addEventListener("click", imprimirLembretes);
formLembrete.addEventListener("submit", salvarLembrete);

elemento("btnFiltrar").addEventListener("click", () => {
    paginaAtual = 1;
    filtrarLembretes();
});

elemento("btnLimparFiltros").addEventListener("click", () => {
    filtroDescricao.value = "";
    dataCadastroInicial.value = "";
    dataCadastroFinal.value = "";
    dataAtualizacaoInicial.value = "";
    dataAtualizacaoFinal.value = "";
    paginaAtual = 1;
    filtrarLembretes();
});

filtroDescricao.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
        paginaAtual = 1;
        filtrarLembretes();
    }
});

tamanhoPagina.addEventListener("change", () => {
    paginaAtual = 1;
    filtrarLembretes();
});

btnAnterior.addEventListener("click", () => {
    if (paginaAtual > 1) {
        paginaAtual--;
        filtrarLembretes();
    }
});

btnProximo.addEventListener("click", () => {
    if (paginaAtual < totalPaginas) {
        paginaAtual++;
        filtrarLembretes();
    }
});

for (const botao of document.querySelectorAll(".sort-button")) {
    botao.addEventListener("click", () => {
        const novaOrdem = botao.dataset.ordem;
        direcaoAtual = ordemAtual === novaOrdem && direcaoAtual === "ASC" ? "DESC" : "ASC";
        ordemAtual = novaOrdem;
        paginaAtual = 1;
        filtrarLembretes();
    });
}

document.addEventListener("DOMContentLoaded", filtrarLembretes);
