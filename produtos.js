const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxhALYDsmeEDbF0enXIRO9a17Vcgy7NNYh0G-yGDrBfQb0Y8OtNxOXOquFDwvyrGqH7/exec'; // Substitua pelo seu ID

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('produtoForm');
  const listaProdutos = document.getElementById('listaProdutos');
  const categoriaSelect = document.getElementById('categoriaSelect');

  // Carrega categorias no select
  function carregarCategorias() {
    const script = document.createElement('script');
    script.src = `${GOOGLE_SCRIPT_URL}?action=getCategorias&callback=preencherCategorias&_=${Date.now()}`;
    document.body.appendChild(script);
  }

  // Lista produtos existentes
  function carregarProdutos() {
    const script = document.createElement('script');
    script.src = `${GOOGLE_SCRIPT_URL}?action=getProdutos&callback=renderizarProdutos&_=${Date.now()}`;
    document.body.appendChild(script);
  }

  window.preencherCategorias = function (data) {
    if (data.categorias && data.categorias.length > 0) {
      categoriaSelect.innerHTML = '<option value="">Selecione a categoria</option>';
      data.categorias.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = `${cat.nome}`;
        categoriaSelect.appendChild(opt);
      });
    }
  };

  window.renderizarProdutos = function (data) {
    listaProdutos.innerHTML = '';
    if (data.produtos && data.produtos.length > 0) {
      data.produtos.forEach(prod => {
        const li = document.createElement('li');
        li.textContent = `#${prod.id} - ${prod.nome} (${prod.categoria})`;
        listaProdutos.appendChild(li);
      });
    } else {
      listaProdutos.innerHTML = '<li>Nenhum produto cadastrado.</li>';
    }
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const nomeProduto = document.getElementById('nomeProduto').value.trim();
    const categoriaId = categoriaSelect.value;

    if (!nomeProduto || !categoriaId) {
      alert('Preencha todos os campos!');
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    const innerForm = doc.createElement('form');
    innerForm.method = 'POST';
    innerForm.action = GOOGLE_SCRIPT_URL;

    const inputNome = doc.createElement('input');
    inputNome.type = 'hidden';
    inputNome.name = 'produto';
    inputNome.value = nomeProduto;
    innerForm.appendChild(inputNome);

    const inputCategoria = doc.createElement('input');
    inputCategoria.type = 'hidden';
    inputCategoria.name = 'categoriaId';
    inputCategoria.value = categoriaId;
    innerForm.appendChild(inputCategoria);

    doc.body.appendChild(innerForm);
    innerForm.submit();

    setTimeout(() => {
      document.body.removeChild(iframe);
      submitButton.disabled = false;
      submitButton.textContent = originalText;
      alert('Produto cadastrado com sucesso!');
      form.reset();
      carregarProdutos();
    }, 4000);
  });

  carregarCategorias();
  carregarProdutos();
});
