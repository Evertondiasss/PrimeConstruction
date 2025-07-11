// Configuração do Google Sheets
const SPREADSHEET_ID = '1-q_4SJEBWZ64oVtNmZYZuSBgsgWLX4h-V_HSLqp_9jc';
const API_KEY = 'AIzaSyD_PWUvWuxlVRKwR0TRx8OuJ0tzMiKnTek';
const RANGE = 'A2:D'; // A=id, B=login, C=senha, D=nome

async function loadGoogleSheetsAPI() {
    try {
        console.log('Tentando acessar a planilha...');
        
        // Constrói a URL com os parâmetros corretos
        const baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
        const url = `${baseUrl}/${SPREADSHEET_ID}/values/${RANGE}`;
        
        // Adiciona os parâmetros necessários
        const params = new URLSearchParams({
            key: API_KEY,
            majorDimension: 'ROWS'
        });

        const finalUrl = `${url}?${params.toString()}`;
        console.log('Tentando acessar:', finalUrl);

        const response = await fetch(finalUrl);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Resposta de erro completa:', errorText);

            // Tenta extrair a mensagem de erro do JSON
            let errorMessage = 'Erro ao acessar a planilha';
            try {
                const errorJson = JSON.parse(errorText);
                if (errorJson.error && errorJson.error.message) {
                    errorMessage = errorJson.error.message;
                }
            } catch (e) {
                errorMessage = errorText;
            }

            throw new Error(`Erro ao acessar a planilha: ${errorMessage}\n\nPor favor, verifique:\n` +
                '1. Se a planilha está compartilhada como "pública para leitura"\n' +
                '2. Se o ID da planilha está correto\n' +
                '3. Se a chave API está ativa e configurada corretamente');
        }

        const data = await response.json();
        
        if (!data.values || !Array.isArray(data.values)) {
            throw new Error('Formato de dados inválido ou planilha vazia');
        }

        return data.values;
    } catch (error) {
        console.error('Erro detalhado:', error);
        throw error;
    }
}

async function verificarLogin(username, password) {
    try {
        const dados = await loadGoogleSheetsAPI();
        console.log('Verificando credenciais...');
        
        // Procura o usuário na planilha
        // Índices: 0=id, 1=login, 2=senha, 3=nome
        const usuario = dados.find(row => 
            row && 
            row[1] && // login
            row[2] && // senha
            row[1].toString().trim().toLowerCase() === username.toString().trim().toLowerCase() && 
            row[2].toString() === password.toString()
        );
        
        if (usuario) {
            const dadosUsuario = {
                id: usuario[0],      // coluna A - id
                login: usuario[1],    // coluna B - login
                nome: usuario[3]      // coluna D - nome
            };
            
            localStorage.setItem('usuario', JSON.stringify(dadosUsuario));
            return { success: true, usuario: dadosUsuario };
        } else {
            return { success: false, error: 'Usuário ou senha inválidos' };
        }
    } catch (error) {
        console.error('Erro ao verificar login:', error);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.querySelector('.login-form');
    const loginButton = document.querySelector('.login-button');
    
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const username = document.querySelector('input[name="username"]').value;
        const password = document.querySelector('input[name="password"]').value;

        if (!username || !password) {
            alert('Por favor, preencha todos os campos');
            return;
        }

        loginButton.disabled = true;
        loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';

        try {
            const result = await verificarLogin(username, password);
            if (result.success) {
                loginButton.innerHTML = '<i class="fas fa-check"></i> Sucesso!';
                setTimeout(() => {
                    window.location.href = 'form.html';
                }, 500);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Erro no login:', error);
            alert(error.message || 'Erro ao fazer login. Por favor, tente novamente.');
            loginButton.disabled = false;
            loginButton.innerHTML = 'Entrar';
        }
    });
});
