// URL do seu Web App do Google Apps Script
const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbxhALYDsmeEDbF0enXIRO9a17Vcgy7NNYh0G-yGDrBfQb0Y8OtNxOXOquFDwvyrGqH7/exec';

// Estado global dos filtros
let filtrosAtuais = {
    mes: '',
    ano: '',
    obra: ''
};

// Função para buscar dados do Dashboard
async function fetchDashboardData(filtros = {}) {
    try {
        console.log('Iniciando busca de dados com filtros:', filtros);
        
        // Adiciona os filtros à URL
        const params = new URLSearchParams({
            ...filtros,
            action: 'getDashboardData'
        });
        
        const urlComFiltros = `${WEBAPP_URL}?${params.toString()}`;
        
        const response = await fetch(urlComFiltros, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log('Status da resposta:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Resposta de erro completa:', errorText);
            throw new Error(`Erro ao buscar dados do dashboard: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Dados recebidos:', JSON.stringify(data, null, 2));

        if (data.error) {
            console.error('Erro retornado pelo servidor:', data.error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Erro detalhado ao buscar dados:', error);
        console.error('Stack trace:', error.stack);
        return null;
    }
}

// Função para buscar lista de obras
async function fetchObras() {
    try {
        const response = await fetch(`${WEBAPP_URL}?action=getObras`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Erro ao buscar obras');
        
        const data = await response.json();
        return data.obras || [];
    } catch (error) {
        console.error('Erro ao buscar obras:', error);
        return [];
    }
}

// Função para preencher o select de obras
async function preencherSelectObras() {
    const obras = await fetchObras();
    const selectObra = document.getElementById('filterObra');
    
    // Mantém a opção "Todas"
    selectObra.innerHTML = '<option value="">Todas</option>';
    
    // Adiciona as obras
    obras.forEach(obra => {
        const option = document.createElement('option');
        option.value = obra.id;
        option.textContent = obra.nome;
        selectObra.appendChild(option);
    });
}

// Função para atualizar o dashboard com os dados filtrados
async function atualizarDashboard() {
    const dados = await fetchDashboardData(filtrosAtuais);
    if (!dados) return;

    // Atualiza os cards
    const formatoMoeda = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    // Atualiza card de compras
    const elementoCompras = document.querySelector('.card.sales .number');
    if (elementoCompras) {
        elementoCompras.textContent = formatoMoeda.format(dados.vendas || 0);
    }

    // Atualiza card de clientes
    const elementoClientes = document.querySelector('.card.customers .number');
    if (elementoClientes) {
        elementoClientes.textContent = (dados.clientes || 0).toLocaleString('pt-BR');
    }

    // Atualiza card de produtos
    const elementoProdutos = document.querySelector('.card.products .number');
    if (elementoProdutos) {
        elementoProdutos.textContent = (dados.produtos || 0).toLocaleString('pt-BR');
    }

    // Atualiza card de pedidos
    const elementoPedidos = document.querySelector('.card.orders .number');
    if (elementoPedidos) {
        elementoPedidos.textContent = (dados.pedidos || 0).toLocaleString('pt-BR');
    }

    // Atualiza os gráficos se necessário
    if (dados.dadosGraficos) {
        atualizarGraficos(dados.dadosGraficos);
    }
}

// Função para atualizar os gráficos
function atualizarGraficos(dadosGraficos) {
    // Atualiza o gráfico de área se houver dados
    if (dadosGraficos.vendas) {
        areaChart.data.labels = dadosGraficos.vendas.labels;
        areaChart.data.datasets[0].data = dadosGraficos.vendas.valores;
        areaChart.update();
    }

    // Atualiza o gráfico de rosca se houver dados
    if (dadosGraficos.distribuicao) {
        donutChart.data.labels = dadosGraficos.distribuicao.labels;
        donutChart.data.datasets[0].data = dadosGraficos.distribuicao.valores;
        donutChart.update();
    }
}

// Função para buscar dados da planilha
async function fetchSheetData() {
    try {
        const response = await fetch('URL_DO_SEU_GOOGLE_APPS_SCRIPT');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar dados da planilha:', error);
        return null;
    }
}

// Função para atualizar os valores dos cards
async function updateCardValues(selectedMonth = '') {
    try {
        const data = await fetchSheetData();
        if (!data) return;

        // Atualiza o valor total de despesas
        const totalDespesas = document.querySelector('.card.sales .number');
        
        if (selectedMonth) {
            // Se um mês específico foi selecionado, busca o valor correspondente
            const monthIndex = data.months.findIndex(month => month === selectedMonth);
            if (monthIndex !== -1) {
                const monthValue = data.monthlyValues[monthIndex];
                totalDespesas.textContent = formatCurrency(monthValue);
            }
        } else {
            // Se nenhum mês foi selecionado, mostra o total geral (célula B2)
            totalDespesas.textContent = formatCurrency(data.totalDespesas);
        }

        // Atualiza o valor total de vendas da célula B2 da aba Dashboard
        const totalVendas = document.querySelector('.card.customers .number');
        if (data && data.totalVendas) {
            totalVendas.textContent = formatCurrency(data.totalVendas);
        }

        // Atualiza o valor total de produtos da célula B2 da aba Dashboard
        const totalProdutos = document.querySelector('.card.products .number');
        if (data && data.totalProdutos) {
            totalProdutos.textContent = formatCurrency(data.totalProdutos);
        }

        // Atualiza o valor total de pedidos da célula B2 da aba Dashboard
        const totalPedidos = document.querySelector('.card.orders .number');
        if (data && data.totalPedidos) {
            totalPedidos.textContent = formatCurrency(data.totalPedidos);
        }

    } catch (error) {
        console.error('Erro ao atualizar valores dos cards:', error);
    }
}

// Função para formatar valores em moeda
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async function() {
    // Preenche o select de obras
    await preencherSelectObras();

    // Define o ano atual como padrão
    const selectAno = document.getElementById('filterAno');
    const anoAtual = new Date().getFullYear().toString();
    if (Array.from(selectAno.options).some(option => option.value === anoAtual)) {
        selectAno.value = anoAtual;
        filtrosAtuais.ano = anoAtual;
    }

    // Define o mês atual como padrão
    const selectMes = document.getElementById('filterMes');
    const mesAtual = (new Date().getMonth() + 1).toString();
    selectMes.value = mesAtual;
    filtrosAtuais.mes = mesAtual;

    // Carrega os dados iniciais
    await atualizarDashboard();

    // Adiciona event listener para o botão de filtro
    document.getElementById('aplicarFiltros').addEventListener('click', async () => {
        filtrosAtuais = {
            mes: document.getElementById('filterMes').value,
            ano: document.getElementById('filterAno').value,
            obra: document.getElementById('filterObra').value
        };
        await atualizarDashboard();
    });

    // Configuração do gráfico de área
    const areaCtx = document.getElementById('areaChart').getContext('2d');
    const areaChart = new Chart(areaCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
            datasets: [{
                label: 'Vendas 2024',
                data: [30000, 35000, 32000, 45000, 42000, 45680],
                fill: true,
                backgroundColor: 'rgba(0, 145, 211, 0.1)',
                borderColor: '#0091d3',
                tension: 0.4,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#0091d3',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        },
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                }
            },
            layout: {
                padding: {
                    top: 10,
                    right: 10,
                    bottom: 10,
                    left: 10
                }
            }
        }
    });

    // Configuração do gráfico de rosca
    const donutCtx = document.getElementById('donutChart').getContext('2d');
    const donutChart = new Chart(donutCtx, {
        type: 'doughnut',
        data: {
            labels: ['Tijolos', 'Cimento', 'Areia', 'Outros'],
            datasets: [{
                data: [35, 25, 20, 20],
                backgroundColor: [
                    '#0091d3',
                    '#33a6db',
                    '#66bce3',
                    '#99d2eb'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                            size: 11
                        }
                    }
                }
            },
            layout: {
                padding: {
                    top: 10,
                    bottom: 10
                }
            },
            cutout: '75%'
        }
    });

    // Ajusta o tamanho dos gráficos quando a janela é redimensionada
    function resizeCharts() {
        const chartContainers = document.querySelectorAll('.card.chart-area, .card.chart-donut');
        chartContainers.forEach(container => {
            const canvas = container.querySelector('canvas');
            const containerHeight = container.offsetHeight - 40; // Reduzido o padding
            canvas.style.height = containerHeight + 'px';
            canvas.height = containerHeight;
        });
        areaChart.resize();
        donutChart.resize();
    }

    // Primeira execução após um pequeno delay para garantir que os elementos estão renderizados
    setTimeout(resizeCharts, 100);
    
    // Atualiza quando a janela é redimensionada
    window.addEventListener('resize', resizeCharts);

    // Event Listener para o filtro de mês
    document.getElementById('filterMes').addEventListener('change', function() {
        const selectedMonth = this.value;
        updateCardValues(selectedMonth);
    });

    // Event Listener para o botão de aplicar filtros
    document.getElementById('aplicarFiltros').addEventListener('click', function() {
        const selectedMonth = document.getElementById('filterMes').value;
        updateCardValues(selectedMonth);
    });

    // Inicialização
    updateCardValues(); // Carrega os dados iniciais sem filtro
}); 