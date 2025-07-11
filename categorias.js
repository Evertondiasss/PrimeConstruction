const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxhALYDsmeEDbF0enXIRO9a17Vcgy7NNYh0G-yGDrBfQb0Y8OtNxOXOquFDwvyrGqH7/exec'; // Substitua pelo seu ID

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('categoriaForm');
  const listaCategorias = document.getElementById('listaCategorias');

  function carregarCategorias() {
    const script = document.createElement('script');
    script.src = `${GOOGLE_SCRIPT_URL}?action=getCategorias&callback=renderizarCategorias&_=${Date.now()}`;
    document.body.appendChild(script);
  }

  window.renderizarCategorias = function (data) {
    if (data.error) {
      listaCategorias.innerHTML = `<li>Erro ao carregar categorias.</li>`;
      return;
    }

    listaCategorias.innerHTML = '';

    if (data.categorias.length === 0) {
      listaCategorias.innerHTML = `<li>Nenhuma categoria cadastrada.</li>`;
    } else {
      data.categorias.forEach(categoria => {
        const li = document.createElement('li');
        li.textContent = `#${categoria.id} - ${categoria.nome}`;
        listaCategorias.appendChild(li);
      });
    }
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const categoriaNome = document.getElementById('nomeCategoria').value.trim();

    if (!categoriaNome) {
      alert('Por favor, preencha o nome da categoria.');
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

    const input = doc.createElement('input');
    input.type = 'hidden';
    input.name = 'categoria';
    input.value = categoriaNome;
    innerForm.appendChild(input);

    doc.body.appendChild(innerForm);
    innerForm.submit();

    setTimeout(() => {
      document.body.removeChild(iframe);
      submitButton.disabled = false;
      submitButton.textContent = originalText;
      form.reset();
      alert('Categoria cadastrada com sucesso!');
      carregarCategorias(); // recarrega a lista após cadastrar
    }, 4000);
  });

  carregarCategorias();
});
