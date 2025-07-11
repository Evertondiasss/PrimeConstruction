// ID da planilha
const SHEET_ID = '1SVWkBGZq-lunEdLfsHfY1gKElN4sVEhfG1F75hp4hK0';
const SHEET_TAB_NAME = 'Compras';

// Função para gerar o ID único
function gerarId() {
  return Utilities.getUuid();
}

// Função para encontrar a última linha com dados reais
function getLastDataRow(sheet) {
  const range = sheet.getRange("B:B"); // Usa coluna B (Data Registro) como referência
  const values = range.getValues();
  
  for(let i = values.length-1; i >= 0; i--) {
    if(values[i][0] !== '') {
      return i + 1;
    }
  }
  return 1; // Retorna 1 se não encontrar dados (cabeçalho)
}

// Função para obter dados das planilhas
function doGet(e) {
  if (e.parameter.action === 'getDados') {
    const callback = e.parameter.callback;
    const dados = {
      clientes: getClientes(),
      produtos: getProdutos(),
      funcionarios: getFuncionarios()
    };
    
    return ContentService.createTextOutput(callback + '(' + JSON.stringify(dados) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput('Método não suportado');
}

// Função para processar o envio do formulário
function doPost(e) {
  try {
    Logger.log('Recebendo dados do formulário: ' + JSON.stringify(e.parameter));
    
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_TAB_NAME);
    const lastRow = getLastDataRow(sheet); // Usa a nova função para encontrar a última linha
    
    Logger.log('Última linha com dados encontrada: ' + lastRow);
    
    // Gerar ID único para a compra
    const id = gerarId();
    
    // Data de registro (agora)
    const dataRegistro = new Date().toLocaleDateString('pt-BR');
    
    // Dados do formulário
    const {
      cliente,
      produto,
      funcionario,
      dataCompra,
      valorTotal,
      formaPagamento,
      parcelas,
      dataVencimento,
      comprovante
    } = e.parameter;
    
    // Inserir dados na planilha
    sheet.getRange(lastRow + 1, 1, 1, 10).setValues([[
      id,
      dataRegistro,
      dataCompra,
      cliente,
      produto,
      funcionario,
      valorTotal,
      formaPagamento,
      parcelas,
      dataVencimento
    ]]);
    
    Logger.log('Dados inseridos com sucesso na linha ' + (lastRow + 1));
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Dados registrados com sucesso'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Erro ao processar dados: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Funções auxiliares para obter dados das outras abas
function getClientes() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Clientes');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Filtra linhas vazias e garante valores únicos
  return data.slice(1)
    .filter(row => row[0] !== '' && row[1] !== '') // Remove linhas vazias
    .map(row => ({
      id: row[0],
      nome: row[1]
    }));
}

function getProdutos() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Produtos');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Filtra linhas vazias e garante valores únicos
  return data.slice(1)
    .filter(row => row[0] !== '' && row[1] !== '') // Remove linhas vazias
    .map(row => ({
      id: row[0],
      nome: row[1]
    }));
}

function getFuncionarios() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Funcionarios');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Filtra linhas vazias e garante valores únicos
  return data.slice(1)
    .filter(row => row[0] !== '' && row[1] !== '') // Remove linhas vazias
    .map(row => ({
      id: row[0],
      nome: row[1]
    }));
} 