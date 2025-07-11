const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxhALYDsmeEDbF0enXIRO9a17Vcgy7NNYh0G-yGDrBfQb0Y8OtNxOXOquFDwvyrGqH7/exec'; // Substitua pela URL do seu script

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('funcionarioForm');
  const lista = document.getElementById('listaFuncionarios');

  function carregarFuncionarios() {
    const script = document.createElement('script');
    script.src = `${GOOGLE_SCRIPT_URL}?action=getFuncionarios&callback=renderizarFuncionarios&_=${Date.now()}`;
    document.body.appendChild(script);
  }

  window.renderizarFuncionarios = function (data) {
    lista.innerHTML = '';

    if (data.error) {
      lista.innerHTML = '<li>Erro ao carregar funcionários.</li>';
      console.error(data.error);
      return;
    }

    if (data.funcionarios && data.funcionarios.length > 0) {
      data.funcionarios.forEach(f => {
        const li = document.createElement('li');
        li.textContent = `#${f.id} - ${f.nome} (${f.cargo})`;
        lista.appendChild(li);
      });
    } else {
      lista.innerHTML = '<li>Nenhum funcionário cadastrado.</li>';
    }
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const nome = document.getElementById('nomeFuncionario').value.trim();
    const cargo = document.getElementById('cargoFuncionario').value.trim();

    if (!nome || !cargo) {
      alert('Preencha todos os campos!');
      return;
    }

    const dados = new URLSearchParams();
    dados.append('nomeFuncionario', nome);
    dados.append('cargoFuncionario', cargo);

    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: dados
    })
    .then(res => res.text())
    .then(() => {
      alert('Funcionário cadastrado com sucesso!');
      form.reset();
      carregarFuncionarios();
    })
    .catch(() => alert('Erro ao cadastrar funcionário.'))
    .finally(() => {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    });
  });

  carregarFuncionarios();
});
