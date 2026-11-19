// Catálogo com os caminhos das imagens na pasta assets
const catalogoProdutos = [
  { id: 1, nome: 'Ração Golden Cães 15kg', preco: 159.90, imagem: './assets/racao.png' },
  { id: 2, nome: 'Arranhador Torre', preco: 94.50, imagem: './assets/arranhador.png' },
  { id: 3, nome: 'Shampoo Neutro 500ml', preco: 32.00, imagem: './assets/shampoo.png' },
  { id: 4, nome: 'Caminha Pet Nuvem M', preco: 119.00, imagem: './assets/caminha.png' }
];

let carrinho = JSON.parse(localStorage.getItem('carrinhoSandrinhos')) || [];

const modalCarrinho = document.getElementById('modal-carrinho');
const btnAbrirCarrinho = document.getElementById('btn-abrir-carrinho');
const btnFecharCarrinho = document.getElementById('btn-fechar-carrinho');
const listaItensEl = document.getElementById('lista-itens-carrinho');
const valorTotalEl = document.getElementById('valor-total');
const contadorCarrinhoEl = document.getElementById('contador-carrinho');

// Abre o painel lateral vindo da direita ao clicar em "Vendas"
btnAbrirCarrinho.addEventListener('click', (evento) => {
  evento.preventDefault();
  modalCarrinho.classList.add('ativo');
  renderizarCarrinho();
});

// Fecha no botão X
btnFecharCarrinho.addEventListener('click', () => {
  modalCarrinho.classList.remove('ativo');
});

// Fecha ao clicar na área escura fora do painel lateral
modalCarrinho.addEventListener('click', (evento) => {
  if (evento.target === modalCarrinho) {
    modalCarrinho.classList.remove('ativo');
  }
});

function adicionarAoCarrinho(id) {
  const produto = catalogoProdutos.find(p => p.id === id);
  if (!produto) return;

  const itemExistente = carrinho.find(item => item.id === id);

  if (itemExistente) {
    itemExistente.quantidade += 1;
  } else {
    carrinho.push({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      imagem: produto.imagem,
      quantidade: 1
    });
  }

  salvarEAtualizar();
}

function alterarQuantidade(id, delta) {
  const item = carrinho.find(item => item.id === id);
  if (!item) return;

  item.quantidade += delta;

  if (item.quantidade <= 0) {
    removerItem(id);
  } else {
    salvarEAtualizar();
  }
}

function removerItem(id) {
  carrinho = carrinho.filter(item => item.id !== id);
  salvarEAtualizar();
}

function salvarEAtualizar() {
  localStorage.setItem('carrinhoSandrinhos', JSON.stringify(carrinho));
  atualizarContador();
  renderizarBotoesCards();
  renderizarCarrinho();
}

function atualizarContador() {
  const totalItens = carrinho.reduce((soma, item) => soma + item.quantidade, 0);
  contadorCarrinhoEl.textContent = totalItens;
}

// Atualiza os botões nos cards da página de produtos (se estiver nela)
function renderizarBotoesCards() {
  catalogoProdutos.forEach(produto => {
    const container = document.getElementById(`controles-card-${produto.id}`);
    if (!container) return;

    const itemNoCarrinho = carrinho.find(item => item.id === produto.id);

    if (!itemNoCarrinho) {
      container.innerHTML = `
        <button class="btn-add-card" onclick="adicionarAoCarrinho(${produto.id})">
          Adicionar ao Carrinho
        </button>
      `;
    } else {
      container.innerHTML = `
        <div class="controles-ativos-card">
          <button class="btn-qtd-card" onclick="alterarQuantidade(${produto.id}, -1)">-</button>
          <span class="qtd-numero-card">${itemNoCarrinho.quantidade} no carrinho</span>
          <button class="btn-qtd-card" onclick="alterarQuantidade(${produto.id}, 1)">+</button>
          <button class="btn-remover-card" onclick="removerItem(${produto.id})">Remover</button>
        </div>
      `;
    }
  });
}

// Renderiza os itens com foto dentro da gaveta lateral da direita
function renderizarCarrinho() {
  listaItensEl.innerHTML = '';

  if (carrinho.length === 0) {
    listaItensEl.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio 🐾</p>';
    valorTotalEl.textContent = 'R$ 0,00';
    return;
  }

  let totalGeral = 0;

  carrinho.forEach(item => {
    totalGeral += item.preco * item.quantidade;

    const itemDiv = document.createElement('div');
    itemDiv.classList.add('item-carrinho');

    itemDiv.innerHTML = `
      <img src="${item.imagem}" alt="${item.nome}" class="item-carrinho-img" />
      <div class="item-info">
        <h4>${item.nome}</h4>
        <span>R$ ${item.preco.toFixed(2).replace('.', ',')} un.</span>
      </div>
      <div class="item-controles">
        <button class="btn-qtd" onclick="alterarQuantidade(${item.id}, -1)">-</button>
        <span>${item.quantidade}</span>
        <button class="btn-qtd" onclick="alterarQuantidade(${item.id}, 1)">+</button>
        <button class="btn-remover" onclick="removerItem(${item.id})">Remover</button>
      </div>
    `;

    listaItensEl.appendChild(itemDiv);
  });

  valorTotalEl.textContent = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
}

function irParaCompra() {
  if (carrinho.length === 0) {
    alert('Adicione pelo menos um produto antes de ir para a compra!');
    return;
  }

  window.location.href = './checkout.html';
}

// Inicializa ao carregar qualquer página (index.html ou produtos.html)
atualizarContador();
renderizarBotoesCards();
renderizarCarrinho();