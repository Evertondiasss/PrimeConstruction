// Configuração da API do Google Sheets
const SHEET_ID = '1SVWkBGZq-lunEdLfsHfY1gKElN4sVEhfG1F75hp4hK0';
const SHEET_TAB_NAME = 'Compras';
// Cole aqui a nova URL do Web App
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyCpHO5NuVMQWnJZAmVNxDeXupzZyf1pdSI-oKImQUjvmG6C_frDjpMfrOZ0bus3dU/exec';

// Função para carregar dados
function carregarDados() {
    console.log('Iniciando carregamento de dados...');
    
    // Criar elemento script
    const script = document.createElement('script');
    script.src = `${GOOGLE_SCRIPT_URL}?action=getDados&callback=processarDados&_=${Date.now()}`;
    document.body.appendChild(script);
}   

// Função que será chamada com os dados
window.processarDados = function(data) {
    console.log('Dados recebidos:', data);
    
    // Preencher select de clientes
    const clienteSelect = document.getElementById('cliente');
    clienteSelect.innerHTML = '<option value="">Selecione o cliente</option>';
    if (data.clientes && data.clientes.length > 0) {
        console.log('Preenchendo lista de clientes:', data.clientes);
        data.clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.id;
            option.textContent = cliente.nome;
            clienteSelect.appendChild(option);
        });
    }

    // Preencher select de produtos
    const produtoSelect = document.getElementById('produto');
    produtoSelect.innerHTML = '<option value="">Selecione o produto</option>';
    if (data.produtos && data.produtos.length > 0) {
        data.produtos.forEach(produto => {
            const option = document.createElement('option');
            option.value = produto.id;
            option.textContent = produto.nome;
            produtoSelect.appendChild(option);
        });
    }

    // Preencher select de funcionários
    const funcionarioSelect = document.getElementById('funcionario');
    funcionarioSelect.innerHTML = '<option value="">Selecione o funcionário</option>';
    if (data.funcionarios && data.funcionarios.length > 0) {
        data.funcionarios.forEach(funcionario => {
            const option = document.createElement('option');
            option.value = funcionario.id;
            option.textContent = funcionario.nome;
            funcionarioSelect.appendChild(option);
        });
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // Carregar dados ao iniciar a página
    carregarDados();

    // Configurar data mínima como hoje para os campos de data
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dataCompra').value = today;
    document.getElementById('dataCompra').min = today;
    document.getElementById('dataVencimento').min = today;

    // Atualizar número de parcelas baseado na forma de pagamento
    const formaPagamentoSelect = document.getElementById('formaPagamento');
    const parcelasInput = document.getElementById('parcelas');

    formaPagamentoSelect.addEventListener('change', function() {
        if (this.value === 'pix' || this.value === 'dinheiro') {
            parcelasInput.value = '1';
            parcelasInput.disabled = true;
        } else if (this.value === 'cartao' || this.value === 'boleto') {
            parcelasInput.disabled = false;
            parcelasInput.value = '';
            parcelasInput.min = '1';
            parcelasInput.max = '12';
        }
    });

    // Manipular envio do formulário
    const form = document.getElementById('purchaseForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Iniciando envio do formulário...');

        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;

        // Mostrar indicador de carregamento
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

        // Criar iframe temporário
        const tempFrame = document.createElement('iframe');
        tempFrame.style.display = 'none';
        document.body.appendChild(tempFrame);

        // Criar formulário dentro do iframe
        const frameDoc = tempFrame.contentDocument || tempFrame.contentWindow.document;
        const frameForm = frameDoc.createElement('form');
        frameForm.method = 'POST';
        frameForm.action = GOOGLE_SCRIPT_URL;

        // Preparar dados
        const dados = {
            cliente: document.getElementById('cliente').options[document.getElementById('cliente').selectedIndex].text,
            produto: document.getElementById('produto').options[document.getElementById('produto').selectedIndex].text,
            funcionario: document.getElementById('funcionario').options[document.getElementById('funcionario').selectedIndex].text,
            dataCompra: document.getElementById('dataCompra').value,
            valorTotal: document.getElementById('valorTotal').value,
            formaPagamento: document.getElementById('formaPagamento').value,
            parcelas: document.getElementById('parcelas').value,
            dataVencimento: document.getElementById('dataVencimento').value,
            comprovante: document.getElementById('comprovante').value
        };

        // Adicionar campos ao formulário
        Object.keys(dados).forEach(key => {
            const input = frameDoc.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = dados[key];
            frameForm.appendChild(input);
        });

        // Adicionar formulário ao iframe e enviar
        frameDoc.body.appendChild(frameForm);
        frameForm.submit();

        // Limpar após 5 segundos
        setTimeout(() => {
            document.body.removeChild(tempFrame);
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            alert('Compra registrada com sucesso!');
            form.reset();
            document.getElementById('dataCompra').value = today;
        }, 5000);
    });
}); 
