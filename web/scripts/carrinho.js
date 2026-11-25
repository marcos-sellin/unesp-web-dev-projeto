// ===================== Configuração =====================
const CHAVE_STORAGE = 'carrinhoSandrinhos';
const QUANTIDADE_MAXIMA = 99;
const PAGINA_COMPRA = '/web/pages/vendas.html';  // troque se criar um checkout.html
const EXIGIR_LOGIN = true;                      // mude para true quando o login estiver integrado

// Catálogo único: os cards da vitrine são gerados a partir daqui.
// Preços em CENTAVOS para evitar problemas de ponto flutuante.
const catalogoProdutos = [
  {
    id: 1,
    nome: 'Ração Golden Cães Adultos 15kg',
    descricao: 'Sabor Frango e Arroz - Porte Médio e Grande',
    precoCentavos: 15990,
    imagem: '/web/assets/racao.png'
  },
  {
    id: 2,
    nome: 'Arranhador Torre com Bolinha',
    descricao: 'Pelúcia macia e sisal natural para gatos',
    precoCentavos: 9450,
    imagem: '/web/assets/arranhador.png'
  },
  {
    id: 3,
    nome: 'Shampoo Neutro Pet 500ml',
    descricao: 'Brilho e maciez para cães e gatos',
    precoCentavos: 3200,
    imagem: '/web/assets/shampoo.png'
  },
  {
    id: 4,
    nome: 'Caminha Pet Nuvem M',
    descricao: 'Fundo impermeável e enchimento antialérgico',
    precoCentavos: 11900,
    imagem: '/web/assets/caminha.png'
  }
];

// ===================== Utilitários =====================
const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

function formatarMoeda(centavos) {
  return formatadorMoeda.format(centavos / 100);
}

function buscarProduto(id) {
  return catalogoProdutos.find(p => p.id === id);
}

// ===================== Estado =====================
// O carrinho guarda apenas { id, quantidade }.
// Nome, preço e imagem vêm sempre do catálogo.
function carregarCarrinho() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE_STORAGE));
    if (!Array.isArray(dados)) return [];

    return dados
      .map(i => ({ id: Number(i.id), quantidade: Math.floor(Number(i.quantidade)) }))
      .filter(i => buscarProduto(i.id) && i.quantidade > 0)
      .map(i => ({ id: i.id, quantidade: Math.min(i.quantidade, QUANTIDADE_MAXIMA) }));
  } catch {
    return [];
  }
}

let carrinho = carregarCarrinho();

function salvarCarrinho() {
  try {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(carrinho));
  } catch (erro) {
    console.warn('Não foi possível salvar o carrinho:', erro);
  }
}

// ===================== Ações =====================
function adicionarAoCarrinho(id) {
  if (!buscarProduto(id)) return;

  const item = carrinho.find(i => i.id === id);
  if (item) {
    item.quantidade = Math.min(item.quantidade + 1, QUANTIDADE_MAXIMA);
  } else {
    carrinho.push({ id, quantidade: 1 });
  }
  salvarEAtualizar();
}

function alterarQuantidade(id, delta) {
  const item = carrinho.find(i => i.id === id);
  if (!item) return;

  const novaQuantidade = item.quantidade + delta;

  if (novaQuantidade <= 0) {
    removerItem(id);
    return;
  }

  item.quantidade = Math.min(novaQuantidade, QUANTIDADE_MAXIMA);
  salvarEAtualizar();
}

function removerItem(id) {
  carrinho = carrinho.filter(i => i.id !== id);
  salvarEAtualizar();
}

function irParaCompra() {
  if (carrinho.length === 0) {
    alert('Adicione pelo menos um produto antes de ir para a compra!');
    return;
  }

  if (EXIGIR_LOGIN && !usuarioLogado()) {
    alert('Faça login para finalizar a compra.');
    window.location.href = '/web/pages/login.html';
    return;
  }

  window.location.href = PAGINA_COMPRA;
}

// Adapte esta função ao que o seu auth.js salva ao fazer login.
function usuarioLogado() {
  return Boolean(localStorage.getItem('usuarioLogado'));
}

// ===================== Drawer (abrir/fechar) =====================
function abrirCarrinho() {
  const modal = document.getElementById('modal-carrinho');
  document.body.classList.add('drawer-aberto');
  if (!modal) return;
  renderizarCarrinho();
  modal.classList.add('ativo');
}

function fecharCarrinho() {
  const modal = document.getElementById('modal-carrinho');
  if (modal){
    modal.classList.remove('ativo');
    document.body.classList.remove('drawer-aberto');
  }
}

// Se a página não tiver o drawer no HTML, ele é criado aqui.
// Assim o script funciona em qualquer página (index, produtos, login...).
function garantirDrawer() {
  if (document.getElementById('modal-carrinho')) return;

  document.body.insertAdjacentHTML('beforeend', `
    <div id="modal-carrinho" class="drawer-overlay">
      <div class="drawer-conteudo">
        <div class="drawer-header">
          <h2>🛒Carrinho</h2>
          <button id="btn-fechar-carrinho" class="btn-fechar" aria-label="Fechar carrinho">&times;</button>
        </div>

        <div id="lista-itens-carrinho" class="drawer-body"></div>

        <div class="drawer-footer">
          <div class="total-container">
            <span>Total do Pedido:</span>
            <strong id="valor-total">R$ 0,00</strong>
          </div>
          <button id="btn-checkout" class="btn-checkout">Ir para a Compra</button>
        </div>
      </div>
    </div>
  `);
}

// ===================== Renderização =====================
function atualizarContador() {
  const contador = document.getElementById('contador-carrinho');
  if (!contador) return; // o header pode ainda não ter sido carregado

  contador.textContent = carrinho.reduce((soma, i) => soma + i.quantidade, 0);
}

// Gera os cards da vitrine a partir do catálogo (só onde existir #produtosLoc)
function renderizarVitrine() {
  const vitrine = document.getElementById('produtosLoc');
  if (!vitrine) return;

  vitrine.innerHTML = catalogoProdutos.map(p => `
    <div class="produto-card">
      <img src="${p.imagem}" alt="${p.nome}" class="produto-img" />
      <h3>${p.nome}</h3>
      <p class="descricao">${p.descricao}</p>
      <p class="preco">${formatarMoeda(p.precoCentavos)}</p>
      <div id="controles-card-${p.id}" class="card-acoes"></div>
    </div>
  `).join('');
}

// Atualiza os botões de cada card (Adicionar / - quantidade + / Remover)
function renderizarBotoesCards() {
  catalogoProdutos.forEach(produto => {
    const container = document.getElementById(`controles-card-${produto.id}`);
    if (!container) return;

    const item = carrinho.find(i => i.id === produto.id);

    if (!item) {
      container.innerHTML = `
        <button class="btn-add-card" data-acao="adicionar" data-id="${produto.id}">
          Adicionar ao Carrinho
        </button>
      `;
    } else {
      container.innerHTML = `
        <div class="controles-ativos-card">
          <button class="btn-qtd-card" data-acao="menos" data-id="${produto.id}" aria-label="Diminuir quantidade">-</button>
          <span class="qtd-numero-card">${item.quantidade} no carrinho</span>
          <button class="btn-qtd-card" data-acao="mais" data-id="${produto.id}" aria-label="Aumentar quantidade"
            ${item.quantidade >= QUANTIDADE_MAXIMA ? 'disabled' : ''}>+</button>
          <button class="btn-remover-card" data-acao="remover" data-id="${produto.id}">Remover</button>
        </div>
      `;
    }
  });
}

function renderizarCarrinho() {
  const lista = document.getElementById('lista-itens-carrinho');
  const totalEl = document.getElementById('valor-total');
  if (!lista || !totalEl) return;

  if (carrinho.length === 0) {
    lista.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio 🐾</p>';
    totalEl.textContent = formatarMoeda(0);
    return;
  }

  let totalCentavos = 0;

  lista.innerHTML = carrinho.map(item => {
    const produto = buscarProduto(item.id);
    totalCentavos += produto.precoCentavos * item.quantidade;

    return `
      <div class="item-carrinho">
        <img src="${produto.imagem}" alt="${produto.nome}" class="item-carrinho-img" />
        <div class="item-info">
          <h4>${produto.nome}</h4>
          <span>${formatarMoeda(produto.precoCentavos)} un.</span>
        </div>
        <div class="item-controles">
          <button class="btn-qtd" data-acao="menos" data-id="${item.id}" aria-label="Diminuir quantidade">-</button>
          <span>${item.quantidade}</span>
          <button class="btn-qtd" data-acao="mais" data-id="${item.id}" aria-label="Aumentar quantidade"
            ${item.quantidade >= QUANTIDADE_MAXIMA ? 'disabled' : ''}>+</button>
          <button class="btn-remover" data-acao="remover" data-id="${item.id}">Remover</button>
        </div>
      </div>
    `;
  }).join('');

  totalEl.textContent = formatarMoeda(totalCentavos);
}

function atualizarTudo() {
  atualizarContador();
  renderizarBotoesCards();
  renderizarCarrinho();
  atualizarBotaoLogout();
}

function salvarEAtualizar() {
  salvarCarrinho();
  atualizarTudo();
}

// ===================== Eventos (delegação) =====================
// Um único listener no document funciona mesmo para elementos
// que entram na página depois (header carregado via include.js).
document.addEventListener('click', (evento) => {
  // Botões com data-acao (cards e drawer)
  const botao = evento.target.closest('[data-acao]');
  if (botao) {
    const id = Number(botao.dataset.id);
    switch (botao.dataset.acao) {
      case 'adicionar': adicionarAoCarrinho(id); break;
      case 'mais':      alterarQuantidade(id, 1); break;
      case 'menos':     alterarQuantidade(id, -1); break;
      case 'remover':   removerItem(id); break;
    }
    return;
  }

  // Botão "Vendas" no header
  if (evento.target.closest('#btn-abrir-carrinho')) {
    evento.preventDefault();
    abrirCarrinho();
    return;
  }

  // Botão X
  if (evento.target.closest('#btn-fechar-carrinho')) {
    fecharCarrinho();
    return;
  }

  // Clique na área escura fora do painel
  if (evento.target.id === 'modal-carrinho') {
    fecharCarrinho();
    return;
  }

  // Botão "Ir para a Compra"
  if (evento.target.closest('#btn-checkout')) {
    irParaCompra();
  }
});

// Fecha com a tecla Esc
document.addEventListener('keydown', (evento) => {
  if (evento.key === 'Escape') fecharCarrinho();
});

// Sincroniza o carrinho entre abas abertas
window.addEventListener('storage', (evento) => {
  if (evento.key === CHAVE_STORAGE) {
    carrinho = carregarCarrinho();
    atualizarTudo();
  }
});

// Disparado pelo include.js quando header e footer terminam de carregar
document.addEventListener('includes:carregados', atualizarContador);

// ===================== Inicialização =====================
function iniciar() {
  garantirDrawer();
  renderizarVitrine();
  atualizarTudo();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciar);
} else {
  iniciar();
}

// ===================== Logout =====================
function logout() {
  localStorage.removeItem('usuarioLogado');
  window.location.href = '/web/pages/login.html';
}

// Mostra "Sair" só quando há alguém logado
function atualizarBotaoLogout() {
  const logado = usuarioLogado();
  const botao = document.getElementById('btn-logout');
  const linkLogin = document.getElementById('link-login');

  if (botao) botao.hidden = !logado;
  if (linkLogin) linkLogin.hidden = logado;
}

document.addEventListener('click', (evento) => {
  if (evento.target.closest('#btn-logout')) logout();
});

// Header carregado depois, e login/logout em outras abas
document.addEventListener('includes:carregados', atualizarBotaoLogout);
window.addEventListener('storage', (evento) => {
  if (evento.key === 'usuarioLogado') atualizarBotaoLogout();
});

// Espera o header ser inserido, mesmo que o evento já tenha passado
function esperarHeader() {
  if (document.getElementById('btn-logout')) {
    atualizarBotaoLogout();
    atualizarContador();
    return;
  }

  const observador = new MutationObserver(() => {
    if (document.getElementById('btn-logout')) {
      observador.disconnect(); // para de observar assim que achar
      atualizarBotaoLogout();
      atualizarContador();
    }
  });
  observador.observe(document.documentElement, { childList: true, subtree: true });
}

esperarHeader();