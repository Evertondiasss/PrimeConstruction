const API_BASE_URL = window.APP_CONFIG?.apiBaseUrl || 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('fornecedorForm');
  const listaFornecedores = document.getElementById('listaFornecedores');
  const mensagemStatus = document.getElementById('statusMensagem');

  function atualizarStatus(texto, tipo = 'info') {
    if (!mensagemStatus) {
      return;
    }

    mensagemStatus.textContent = texto;
    mensagemStatus.dataset.tipo = tipo;
    mensagemStatus.hidden = !texto;
  }

  // Função para carregar fornecedores da planilha
  async function carregarFornecedores() {
    listaFornecedores.innerHTML = '<li>Carregando...</li>';

    try {
      const resposta = await fetch(`${API_BASE_URL}/api/fornecedores`, {
        headers: {
          Accept: 'application/json'
        }
      });

      if (!resposta.ok) {
        throw new Error(`Falha ao carregar fornecedores: ${resposta.status}`);
      }

      const fornecedores = await resposta.json();
      listaFornecedores.innerHTML = '';

      if (Array.isArray(fornecedores) && fornecedores.length > 0) {
        fornecedores.forEach((fornecedor) => {
          const li = document.createElement('li');
          li.textContent = `#${fornecedor.id ?? '-'} - ${fornecedor.nome} | CNPJ: ${fornecedor.cnpj} | Endereço: ${fornecedor.endereco} | Telefone: ${fornecedor.telefone}`;
          listaFornecedores.appendChild(li);
        });
      } else {
        listaFornecedores.innerHTML = '<li>Nenhum fornecedor cadastrado.</li>';
      }

      atualizarStatus('Lista de fornecedores atualizada com sucesso.');
    } catch (erro) {
      console.error(erro);
      listaFornecedores.innerHTML = '<li>Erro ao carregar fornecedores.</li>';
      atualizarStatus('Não foi possível obter os fornecedores. Verifique a API.', 'erro');
    }
  }

  // Envio do formulário
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const nome = document.getElementById('nomeFornecedor').value.trim();
    const cnpj = document.getElementById('cnpjFornecedor').value.trim();
    const endereco = document.getElementById('enderecoFornecedor').value.trim();
    const telefone = document.getElementById('telefoneFornecedor').value.trim();

    if (!nome || !cnpj || !endereco || !telefone) {
      alert('Preencha todos os campos!');
      return;
    }

    const payload = {
      nome,
      cnpj,
      endereco,
      telefone
    };

    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    fetch(`${API_BASE_URL}/api/fornecedores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().catch(() => ({})).then((erro) => {
            throw new Error(erro.mensagem || `Falha no cadastro (${res.status})`);
          });
        }
        return res.json();
      })
      .then(() => {
        atualizarStatus('Fornecedor cadastrado com sucesso.', 'sucesso');
        form.reset();
        carregarFornecedores();
      })
      .catch((err) => {
        console.error(err);
        atualizarStatus(err.message || 'Erro ao cadastrar fornecedor.', 'erro');
        alert('Erro ao cadastrar fornecedor. Verifique os dados e tente novamente.');
      })
      .finally(() => {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      });
  });

  carregarFornecedores();
});
