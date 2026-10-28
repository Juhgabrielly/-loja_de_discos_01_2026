const API = "http://localhost:3000";

let discos = [];
let usuarios = [];
let movimentacoes = [];
let editandoId = null;

const $ = id => document.getElementById(id);

async function requisicao(url, metodo = "GET", dados = null) {
    const opcoes = {
        method: metodo,
        headers: { "Content-Type": "application/json" }
    };

    if (dados) opcoes.body = JSON.stringify(dados);

    let resposta;

    try {
        resposta = await fetch(API + url, opcoes);
    } catch {
        statusAPI(false);
        throw new Error("Não foi possível conectar. Inicie o backend na porta 3000.");
    }

    const texto = await resposta.text();
    let resultado = null;

    try {
        resultado = texto ? JSON.parse(texto) : null;
    } catch {
        resultado = texto;
    }

    if (!resposta.ok) {
        throw new Error(
            resultado?.mensagem ||
            resultado?.erro ||
            resultado?.message ||
            `Erro HTTP ${resposta.status}`
        );
    }

    statusAPI(true);
    return resultado;
}

function statusAPI(online) {
    $("status-api").textContent = online
        ? "● API conectada"
        : "● API desconectada";

    $("status-api").style.color = online ? "#526b4d" : "#c04435";
}

function mostrarMensagem(texto) {
    const mensagem = $("mensagem");
    mensagem.textContent = texto;
    mensagem.classList.add("mostrar");

    setTimeout(() => mensagem.classList.remove("mostrar"), 3500);
}

function lista(dados) {
    if (Array.isArray(dados)) return dados;
    if (Array.isArray(dados?.dados)) return dados.dados;
    if (Array.isArray(dados?.data)) return dados.data;
    return [];
}

function escapar(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[c]));
}

function moeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function dataBR(valor) {
    if (!valor) return "—";
    const data = new Date(valor);
    return isNaN(data) ? valor : data.toLocaleDateString("pt-BR", {
        timeZone: "UTC"
    });
}

async function carregarDados() {
    try {
        const [d, u, m] = await Promise.all([
            requisicao("/disco/listar"),
            requisicao("/usuario/listar"),
            requisicao("/movimentacaoestoque/listar")
        ]);

        discos = lista(d);
        usuarios = lista(u);
        movimentacoes = lista(m);

        atualizarInicio();
        listarDiscos();
        listarUsuarios();
        listarMovimentacoes();
    } catch (erro) {
        statusAPI(false);
        mostrarMensagem(erro.message);
    }
}

function atualizarInicio() {
    $("total-discos").textContent = discos.length;

    $("total-unidades").textContent = discos.reduce(
        (total, disco) => total + Number(disco.quantidade_estoque || 0), 0
    );

    const baixos = discos.filter(d =>
        Number(d.quantidade_estoque || 0) <= Number(d.estoque_minimo || 0)
    );

    $("estoque-baixo").textContent = baixos.length;
    $("total-movimentacoes").textContent = movimentacoes.length;

    $("lista-estoque-baixo").innerHTML = baixos.length
        ? baixos.map(d => `
            <p>
                <strong>${escapar(d.titulo)}</strong> — ${escapar(d.artista)}
                <span class="pill baixo">
                    ${Number(d.quantidade_estoque || 0)} unidade(s)
                </span>
            </p>
        `).join("")
        : "<p>Nenhum disco com estoque baixo.</p>";
}

function mudarPagina(pagina) {
    document.querySelectorAll(".pagina").forEach(p => {
        p.classList.toggle("ativa", p.id === pagina);
    });

    document.querySelectorAll("nav button").forEach(b => {
        b.classList.toggle("ativo", b.dataset.page === pagina);
    });

    const titulos = {
        inicio: "Visão geral",
        discos: "Discos",
        movimentacoes: "Movimentações",
        usuarios: "Usuários"
    };

    $("titulo-pagina").textContent = titulos[pagina];
}

document.querySelectorAll("nav button").forEach(botao => {
    botao.addEventListener("click", () => mudarPagina(botao.dataset.page));
});

function listarDiscos() {
    const busca = ($("buscar-disco").value || "").toLowerCase();

    const filtrados = discos.filter(d =>
        `${d.titulo} ${d.artista} ${d.genero || ""}`.toLowerCase().includes(busca)
    );

    $("tabela-discos").innerHTML = filtrados.length
        ? filtrados.map(d => `
            <tr>
                <td>${escapar(d.titulo)}</td>
                <td>${escapar(d.artista)}</td>
                <td>${escapar(d.genero || "—")}</td>
                <td>${moeda(d.preco_venda)}</td>
                <td>
                    ${Number(d.quantidade_estoque || 0)}
                    ${Number(d.quantidade_estoque || 0) <= Number(d.estoque_minimo || 0)
                        ? '<span class="pill baixo">Baixo</span>' : ""}
                </td>
                <td>
                    <button class="acao" onclick="abrirDisco(${d.id_disco})">Editar</button>
                    <button class="acao excluir" onclick="excluirDisco(${d.id_disco})">Excluir</button>
                </td>
            </tr>
        `).join("")
        : '<tr><td colspan="6">Nenhum disco encontrado.</td></tr>';
}

$("buscar-disco").addEventListener("input", listarDiscos);

function abrirDisco(id = null) {
    editandoId = id;
    const d = discos.find(item => Number(item.id_disco) === Number(id));

    $("modal-titulo").textContent = d ? "Editar disco" : "Cadastrar disco";

    $("modal-corpo").innerHTML = `
        <form id="form-disco" class="formulario">
            <div class="campo completo">
                <label>Título *</label>
                <input name="titulo" maxlength="150" required value="${escapar(d?.titulo || "")}">
            </div>
            <div class="campo">
                <label>Artista *</label>
                <input name="artista" maxlength="100" required value="${escapar(d?.artista || "")}">
            </div>
            <div class="campo">
                <label>Gênero</label>
                <input name="genero" maxlength="50" value="${escapar(d?.genero || "")}">
            </div>
            <div class="campo">
                <label>Preço de custo *</label>
                <input name="preco_custo" type="number" min="0" step="0.01" required value="${d?.preco_custo ?? 0}">
            </div>
            <div class="campo">
                <label>Preço de venda *</label>
                <input name="preco_venda" type="number" min="0" step="0.01" required value="${d?.preco_venda ?? 0}">
            </div>
            <div class="campo">
                <label>Quantidade em estoque *</label>
                <input name="quantidade_estoque" type="number" min="0" required value="${d?.quantidade_estoque ?? 0}">
            </div>
            <div class="campo">
                <label>Estoque mínimo *</label>
                <input name="estoque_minimo" type="number" min="0" required value="${d?.estoque_minimo ?? 0}">
            </div>
            <button class="botao" type="submit">Salvar disco</button>
        </form>
    `;

    abrirModal();

    $("form-disco").onsubmit = async e => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);

        const dados = {
            titulo: form.get("titulo").trim(),
            artista: form.get("artista").trim(),
            genero: form.get("genero").trim(),
            preco_custo: Number(form.get("preco_custo")),
            preco_venda: Number(form.get("preco_venda")),
            quantidade_estoque: Number(form.get("quantidade_estoque")),
            estoque_minimo: Number(form.get("estoque_minimo"))
        };

        try {
            await requisicao(
                d ? `/disco/atualizar/${id}` : "/disco/cadastrar",
                d ? "PUT" : "POST",
                dados
            );

            fecharModal();
            mostrarMensagem("Disco salvo com sucesso!");
            await carregarDados();
        } catch (erro) {
            mostrarMensagem(erro.message);
        }
    };
}

async function excluirDisco(id) {
    if (!confirm("Deseja excluir este disco?")) return;

    try {
        await requisicao(`/disco/excluir/${id}`, "DELETE");
        mostrarMensagem("Disco excluído.");
        await carregarDados();
    } catch (erro) {
        mostrarMensagem(erro.message);
    }
}

function listarUsuarios() {
    const busca = ($("buscar-usuario").value || "").toLowerCase();

    const filtrados = usuarios.filter(u =>
        `${u.nome} ${u.email}`.toLowerCase().includes(busca)
    );

    $("tabela-usuarios").innerHTML = filtrados.length
        ? filtrados.map(u => `
            <tr>
                <td>${u.id_usuario}</td>
                <td>${escapar(u.nome)}</td>
                <td>${escapar(u.email)}</td>
                <td>
                    <button class="acao" onclick="abrirUsuario(${u.id_usuario})">Editar</button>
                    <button class="acao excluir" onclick="excluirUsuario(${u.id_usuario})">Excluir</button>
                </td>
            </tr>
        `).join("")
        : '<tr><td colspan="4">Nenhum usuário encontrado.</td></tr>';
}

$("buscar-usuario").addEventListener("input", listarUsuarios);

function abrirUsuario(id = null) {
    const u = usuarios.find(item => Number(item.id_usuario) === Number(id));
    $("modal-titulo").textContent = u ? "Editar usuário" : "Cadastrar usuário";

    $("modal-corpo").innerHTML = `
        <form id="form-usuario" class="formulario">
            <div class="campo completo">
                <label>Nome *</label>
                <input name="nome" maxlength="100" required value="${escapar(u?.nome || "")}">
            </div>
            <div class="campo completo">
                <label>E-mail *</label>
                <input name="email" type="email" maxlength="100" required value="${escapar(u?.email || "")}">
            </div>
            <div class="campo completo">
                <label>${u ? "Nova senha (opcional)" : "Senha *"}</label>
                <input name="senha" type="password" minlength="6" ${u ? "" : "required"}>
            </div>
            <button class="botao" type="submit">Salvar usuário</button>
        </form>
    `;

    abrirModal();

    $("form-usuario").onsubmit = async e => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const dados = {
            nome: form.get("nome").trim(),
            email: form.get("email").trim()
        };

        if (form.get("senha")) dados.senha = form.get("senha");

        try {
            await requisicao(
                u ? `/usuario/atualizar/${id}` : "/usuario/cadastrar",
                u ? "PUT" : "POST",
                dados
            );

            fecharModal();
            mostrarMensagem("Usuário salvo com sucesso!");
            await carregarDados();
        } catch (erro) {
            mostrarMensagem(erro.message);
        }
    };
}

async function excluirUsuario(id) {
    if (!confirm("Deseja excluir este usuário?")) return;

    try {
        await requisicao(`/usuario/excluir/${id}`, "DELETE");
        mostrarMensagem("Usuário excluído.");
        await carregarDados();
    } catch (erro) {
        mostrarMensagem(erro.message);
    }
}

function listarMovimentacoes() {
    const ordenadas = [...movimentacoes].sort(
        (a, b) => new Date(b.data_movimentacao) - new Date(a.data_movimentacao)
    );

    $("tabela-movimentacoes").innerHTML = ordenadas.length
        ? ordenadas.map(m => {
            const disco = discos.find(d => Number(d.id_disco) === Number(m.id_disco));
            const usuario = usuarios.find(u => Number(u.id_usuario) === Number(m.id_usuario));
            const entrada = String(m.tipo_movimentacao).toLowerCase() === "entrada";

            return `
                <tr>
                    <td>${dataBR(m.data_movimentacao)}</td>
                    <td>${escapar(disco?.titulo || `Disco #${m.id_disco}`)}</td>
                    <td>${escapar(usuario?.nome || `Usuário #${m.id_usuario}`)}</td>
                    <td><span class="pill ${entrada ? "entrada" : "saida"}">${entrada ? "Entrada" : "Saída"}</span></td>
                    <td>${Number(m.quantidade)}</td>
                    <td>${escapar(m.observacao || "—")}</td>
                </tr>
            `;
        }).join("")
        : '<tr><td colspan="6">Nenhuma movimentação cadastrada.</td></tr>';
}

function abrirMovimentacao() {
    if (!discos.length || !usuarios.length) {
        mostrarMensagem("Cadastre pelo menos um disco e um usuário primeiro.");
        return;
    }

    const hoje = new Date();
    const dataHoje = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;

    $("modal-titulo").textContent = "Nova movimentação";
    $("modal-corpo").innerHTML = `
        <form id="form-mov" class="formulario">
            <div class="campo completo">
                <label>Disco *</label>
                <select name="id_disco" required>
                    <option value="">Selecione</option>
                    ${discos.map(d => `<option value="${d.id_disco}">${escapar(d.titulo)} — estoque: ${d.quantidade_estoque}</option>`).join("")}
                </select>
            </div>
            <div class="campo completo">
                <label>Responsável *</label>
                <select name="id_usuario" required>
                    <option value="">Selecione</option>
                    ${usuarios.map(u => `<option value="${u.id_usuario}">${escapar(u.nome)}</option>`).join("")}
                </select>
            </div>
            <div class="campo">
                <label>Tipo *</label>
                <select name="tipo_movimentacao" required>
                    <option value="entrada">Entrada</option>
                    <option value="saída">Saída</option>
                </select>
            </div>
            <div class="campo">
                <label>Quantidade *</label>
                <input name="quantidade" type="number" min="1" step="1" required value="1">
            </div>
            <div class="campo completo">
                <label>Data *</label>
                <input name="data_movimentacao" type="date" required value="${dataHoje}">
            </div>
            <div class="campo completo">
                <label>Observação</label>
                <textarea name="observacao" maxlength="250"></textarea>
            </div>
            <button class="botao" type="submit">Registrar movimentação</button>
        </form>
    `;

    abrirModal();

    $("form-mov").onsubmit = async e => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const discoId = Number(form.get("id_disco"));
        const quantidade = Number(form.get("quantidade"));
        const tipo = form.get("tipo_movimentacao");
        const disco = discos.find(d => Number(d.id_disco) === discoId);

        if (!Number.isInteger(quantidade) || quantidade <= 0) {
            mostrarMensagem("A quantidade deve ser um inteiro maior que zero.");
            return;
        }

        if (tipo !== "entrada" && quantidade > Number(disco?.quantidade_estoque || 0)) {
            mostrarMensagem("Estoque insuficiente para essa saída.");
            return;
        }

        const data = form.get("data_movimentacao");

        const dados = {
            id_disco: discoId,
            id_usuario: Number(form.get("id_usuario")),
            tipo_movimentacao: tipo,
            quantidade,
            data_movimentacao: new Date(`${data}T00:00:00.000Z`).toISOString(),
            observacao: form.get("observacao").trim() || null
        };

        try {
            await requisicao("/movimentacaoestoque/cadastrar", "POST", dados);
            fecharModal();
            mostrarMensagem("Movimentação registrada!");
            await carregarDados();
        } catch (erro) {
            mostrarMensagem(erro.message);
        }
    };
}

function abrirModal() {
    $("modal").classList.add("aberto");
}

function fecharModal() {
    $("modal").classList.remove("aberto");
}

$("modal").addEventListener("click", e => {
    if (e.target === $("modal")) fecharModal();
});

document.addEventListener("keydown", e => {
    if (e.key === "Escape") fecharModal();
});

carregarDados();