const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxhALYDsmeEDbF0enXIRO9a17Vcgy7NNYh0G-yGDrBfQb0Y8OtNxOXOquFDwvyrGqH7/exec'; // Substitua pelo seu ID real

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('clienteForm');
  const listaClientes = document.getElementById('listaClientes');

  // Função para carregar clientes da planilha
  function carregarClientes() {
    const script = document.createElement('script');
    script.src = `${GOOGLE_SCRIPT_URL}?action=getClientes&callback=renderizarClientes&_=${Date.now()}`;
    document.body.appendChild(script);
  }

  // Callback para exibir os clientes
  window.renderizarClientes = function (data) {
    listaClientes.innerHTML = '';

    if (data.error) {
      listaClientes.innerHTML = '<li>Erro ao carregar clientes.</li>';
      console.error(data.error);
      return;
    }

    if (data.clientes && data.clientes.length > 0) {
      data.clientes.forEach(cliente => {
        const li = document.createElement('li');
        li.textContent = `#${cliente.id} - ${cliente.nome} (${cliente.telefone})`;
        listaClientes.appendChild(li);
      });
    } else {
      listaClientes.innerHTML = '<li>Nenhum cliente cadastrado.</li>';
    }
  };

  // Envio do formulário
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const nome = document.getElementById('nomeCliente').value.trim();
    const telefone = document.getElementById('telefoneCliente').value.trim();

    if (!nome || !telefone) {
      alert('Preencha todos os campos!');
      return;
    }

    const dados = new URLSearchParams();
    dados.append('nomeCliente', nome);
    dados.append('telefoneCliente', telefone);

    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: dados
    })
      .then(res => res.text())
      .then((msg) => {
        alert('Cliente cadastrado com sucesso!');
        form.reset();
        carregarClientes();
      })
      .catch((err) => {
        console.error(err);
        alert('Erro ao cadastrar cliente.');
      })
      .finally(() => {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      });
  });

  carregarClientes();
});
