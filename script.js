// ========== URL DO SHEETDB ==========
const API_URL = "https://sheetdb.io/api/v1/zgrywmv600xid";

// ========== VOOS (agora só com dados fixos, sem piloto/avião) ==========
const voos = [
    { id: 1, codigo: "NZ101", origem: "Auckland", origemICAO: "AKL", destino: "Wellington", destinoICAO: "WLG", horarioPartida: "08:00", horarioChegada: "09:30", preco: 250 },
    { id: 2, codigo: "NZ202", origem: "Wellington", origemICAO: "WLG", destino: "Christchurch", destinoICAO: "CHC", horarioPartida: "10:30", horarioChegada: "11:45", preco: 180 },
    { id: 3, codigo: "NZ305", origem: "Christchurch", origemICAO: "CHC", destino: "Queenstown", destinoICAO: "ZQN", horarioPartida: "13:15", horarioChegada: "14:30", preco: 220 },
    { id: 4, codigo: "NZ408", origem: "Queenstown", origemICAO: "ZQN", destino: "Auckland", destinoICAO: "AKL", horarioPartida: "16:45", horarioChegada: "18:15", preco: 300 },
    { id: 5, codigo: "NZ517", origem: "Auckland", origemICAO: "AKL", destino: "Dunedin", destinoICAO: "DUD", horarioPartida: "19:00", horarioChegada: "20:45", preco: 275 },
    { id: 6, codigo: "NZ623", origem: "Dunedin", origemICAO: "DUD", destino: "Nelson", destinoICAO: "NSN", horarioPartida: "21:30", horarioChegada: "22:45", preco: 195 }
];

// ========== DADOS PADRÃO PARA PILOTOS E AVIÕES (se a planilha não tiver) ==========
const pilotosPadrao = {
    "NZ101": { nome: "Captain James Wilson", experiencia: "12 anos de voo", foto: "👨‍✈️" },
    "NZ202": { nome: "Captain Sarah Mitchell", experiencia: "8 anos de voo", foto: "👩‍✈️" },
    "NZ305": { nome: "Captain Michael Chen", experiencia: "15 anos de voo", foto: "👨‍✈️" },
    "NZ408": { nome: "Captain Emma Thompson", experiencia: "10 anos de voo", foto: "👩‍✈️" },
    "NZ517": { nome: "Captain David Robinson", experiencia: "20 anos de voo", foto: "👨‍✈️" },
    "NZ623": { nome: "Captain Lisa Wong", experiencia: "6 anos de voo", foto: "👩‍✈️" }
};

const avioesPadrao = {
    "NZ101": { modelo: "Boeing 787-9 Dreamliner", capacidade: "300 passageiros" },
    "NZ202": { modelo: "ATR 72-600", capacidade: "78 passageiros" },
    "NZ305": { modelo: "Boeing 777-300ER", capacidade: "350 passageiros" },
    "NZ408": { modelo: "Airbus A320-200", capacidade: "180 passageiros" },
    "NZ517": { modelo: "Boeing 787-9 Dreamliner", capacidade: "300 passageiros" },
    "NZ623": { modelo: "ATR 72-600", capacidade: "78 passageiros" }
};

// ========== FUNÇÃO PARA BUSCAR DADOS DA PLANILHA ==========
async function buscarDadosPlanilha() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        if (data.error) return {};
        
        // Organiza os dados por código de voo
        const dadosPorVoo = {};
        data.forEach(item => {
            if (item.CodigoVoo) {
                dadosPorVoo[item.CodigoVoo] = {
                    pilotoNome: item.PilotoNome,
                    pilotoExperiencia: item.PilotoExperiencia,
                    aviaoModelo: item.AviaoModelo,
                    aviaoCapacidade: item.AviaoCapacidade
                };
            }
        });
        return dadosPorVoo;
    } catch (error) {
        console.error("Erro ao buscar dados da planilha:", error);
        return {};
    }
}

// ========== FUNÇÃO PARA OBTER PILOTO (planilha ou padrão) ==========
async function getPiloto(codigoVoo) {
    const dadosPlanilha = await buscarDadosPlanilha();
    const dados = dadosPlanilha[codigoVoo];
    
    if (dados && dados.pilotoNome) {
        return {
            nome: dados.pilotoNome,
            experiencia: dados.pilotoExperiencia || "Experiência não informada",
            foto: "👨‍✈️"
        };
    }
    
    return pilotosPadrao[codigoVoo] || { nome: "Captain TBA", experiencia: "A definir", foto: "👨‍✈️" };
}

// ========== FUNÇÃO PARA OBTER AVIÃO (planilha ou padrão) ==========
async function getAviao(codigoVoo) {
    const dadosPlanilha = await buscarDadosPlanilha();
    const dados = dadosPlanilha[codigoVoo];
    
    if (dados && dados.aviaoModelo) {
        return {
            modelo: dados.aviaoModelo,
            capacidade: dados.aviaoCapacidade || "Capacidade não informada"
        };
    }
    
    return avioesPadrao[codigoVoo] || { modelo: "A definir", capacidade: "A definir" };
}

function gerarCodigoReserva(codigoVoo) {
    const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const numeros = '0123456789';
    let aleatorio = '';
    for (let i = 0; i < 4; i++) aleatorio += letras[Math.floor(Math.random() * letras.length)];
    for (let i = 0; i < 2; i++) aleatorio += numeros[Math.floor(Math.random() * numeros.length)];
    return `${codigoVoo}-${aleatorio}`;
}

function getStatusInfo(mensagem) {
    if (!mensagem) return { cor: '#fff', icone: '✅', texto: 'Sua viagem está em dia! Prepare-se para o embarque.' };
    if (mensagem.toLowerCase().includes('atrasado')) {
        return { cor: '#ff8800', icone: '⚠️', texto: mensagem };
    }
    if (mensagem.toLowerCase().includes('embarque')) {
        return { cor: '#00cc44', icone: '🚪', texto: mensagem };
    }
    if (mensagem.toLowerCase().includes('cancelou') || mensagem.toLowerCase().includes('cancelado')) {
        return { cor: '#ff3333', icone: '❌', texto: mensagem };
    }
    return { cor: '#fff', icone: '✅', texto: mensagem };
}

async function reservarVoo(vooId) {
    const voo = voos.find(v => v.id === vooId);
    if (!voo) return;
    
    const nomePassageiro = prompt('Digite seu nome de usuário no Roblox:', 'Player');
    if (!nomePassageiro) return;
    
    const codigoReserva = gerarCodigoReserva(voo.codigo);
    const piloto = await getPiloto(voo.codigo);
    const aviao = await getAviao(voo.codigo);
    
    const novaReserva = {
        CodigoReserva: codigoReserva,
        CodigoVoo: voo.codigo,
        Origem: voo.origem,
        Destino: voo.destino,
        Horario: voo.horarioPartida,
        Preco: voo.preco,
        Passageiro: nomePassageiro,
        DataReserva: new Date().toLocaleString('pt-BR'),
        Status: "emdia",
        Mensagem: "✅ Sua viagem está em dia! Prepare-se para o embarque.",
        UltimaAtualizacao: new Date().toLocaleString('pt-BR'),
        PilotoNome: piloto.nome,
        PilotoExperiencia: piloto.experiencia,
        AviaoModelo: aviao.modelo,
        AviaoCapacidade: aviao.capacidade
    };
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novaReserva)
        });
        
        if (response.ok) {
            mostrarModal(`
                <h3 style="color: #fff; margin-bottom: 20px;">✅ RESERVA CONFIRMADA!</h3>
                
                <div style="text-align: left; margin-bottom: 20px;">
                    <p><strong>👤 Passageiro:</strong> ${nomePassageiro}</p>
                    <p><strong>✈️ Voo:</strong> ${voo.codigo}</p>
                    <p><strong>🛫 Rota:</strong> ${voo.origem} (${voo.origemICAO}) → ${voo.destino} (${voo.destinoICAO})</p>
                    <p><strong>🕒 Horário:</strong> ${voo.horarioPartida} - ${voo.horarioChegada}</p>
                    <p><strong>💰 Valor:</strong> ${voo.preco} RP$</p>
                </div>
                
                <div style="background: #0a0a0a; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 3px solid #fff;">
                    <p style="margin-bottom: 5px;"><strong>🧑‍✈️ PILOTO:</strong> ${piloto.nome}</p>
                    <p style="font-size: 0.8rem; color: #888;">⭐ ${piloto.experiencia}</p>
                </div>
                
                <div style="background: #0a0a0a; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 3px solid #fff;">
                    <p style="margin-bottom: 5px;"><strong>✈️ AVIÃO:</strong> ${aviao.modelo}</p>
                    <p style="font-size: 0.8rem; color: #888;">👥 ${aviao.capacidade}</p>
                </div>
                
                <div class="modal-codigo">
                    📋 CÓDIGO DA RESERVA<br>
                    <strong style="font-size: 1.3rem;">${codigoReserva}</strong>
                </div>
                
                <p style="font-size: 0.8rem; color: #888; margin-top: 15px;">Guarde este código para fazer check-in no Roblox!</p>
                <button onclick="fecharModal()" class="btn-reservar" style="margin-top: 20px; display: inline-block; width: auto; padding: 10px 20px;">Fechar</button>
            `);
        } else {
            alert('Erro ao reservar. Tente novamente!');
        }
    } catch (error) {
        alert('Erro de conexão!');
    }
}

async function buscarReservasPorNome() {
    const nome = prompt('Digite seu nome de usuário no Roblox:');
    if (!nome) return;
    
    try {
        const response = await fetch(API_URL);
        const todasReservas = await response.json();
        
        const container = document.getElementById('listaReservas');
        const reservasDoUsuario = todasReservas.filter(reserva => 
            reserva.Passageiro && reserva.Passageiro.toLowerCase() === nome.toLowerCase()
        );
        
        if (reservasDoUsuario.length === 0) {
            container.innerHTML = '<div class="empty-message">Nenhuma reserva encontrada para este nome!</div>';
            return;
        }
        
        container.innerHTML = reservasDoUsuario.map(reserva => {
            const statusInfo = getStatusInfo(reserva.Mensagem);
            return `
            <div class="reserva-item" style="border-left-color: ${statusInfo.cor};">
                <div class="reserva-info">
                    <div class="rota">✈️ ${reserva.CodigoVoo} - ${reserva.Origem} → ${reserva.Destino}</div>
                    <div class="codigo">Código: <span>${reserva.CodigoReserva}</span></div>
                    <div style="font-size: 0.7rem; margin-top: 5px;">🕒 ${reserva.Horario} | 💰 ${reserva.Preco} RP$</div>
                    <div class="codigo" style="font-size: 0.8rem; margin-top: 8px; background: ${statusInfo.cor}20; padding: 8px; border-radius: 6px; border-left: 3px solid ${statusInfo.cor};">
                        ${statusInfo.icone} ${statusInfo.texto}
                    </div>
                </div>
                <button onclick="cancelarReserva('${reserva.CodigoReserva}', '${nome}')" class="btn-cancelar">Cancelar</button>
            </div>
        `}).join('');
        
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('listaReservas').innerHTML = '<div class="empty-message">Erro ao buscar reservas! Tente novamente.</div>';
    }
}

async function cancelarReserva(codigoReserva, nome) {
    if (!confirm('Cancelar esta reserva?')) return;
    
    try {
        const response = await fetch(API_URL);
        const todasReservas = await response.json();
        const reserva = todasReservas.find(r => r.CodigoReserva === codigoReserva && r.Passageiro === nome);
        
        if (reserva && reserva.ID) {
            await fetch(`${API_URL}/ID/${reserva.ID}`, { method: 'DELETE' });
            alert('✅ Reserva cancelada!');
            buscarReservasPorNome();
        }
    } catch (error) {
        alert('Erro ao cancelar!');
    }
}

async function exibirCatalogo() {
    const container = document.getElementById('voosGrid');
    
    // Para cada voo, busca piloto e avião
    const voosCompletos = await Promise.all(voos.map(async (voo) => {
        const piloto = await getPiloto(voo.codigo);
        const aviao = await getAviao(voo.codigo);
        return { ...voo, piloto, aviao };
    }));
    
    container.innerHTML = voosCompletos.map(voo => `
        <div class="voo-card">
            <div class="voo-header">
                <span class="voo-codigo">✈️ ${voo.codigo}</span>
                <span class="voo-preco">💰 ${voo.preco} RP$</span>
            </div>
            
            <div class="aviao-info">
                <div class="aviao-icon">🛩️</div>
                <div class="aviao-detalhes">
                    <h4>MODELO DA AERONAVE</h4>
                    <p>${voo.aviao.modelo}</p>
                    <small style="color: #666;">${voo.aviao.capacidade}</small>
                </div>
            </div>
            
            <div class="piloto-info">
                <div class="piloto-foto">
                    <div class="sem-foto">${voo.piloto.foto}</div>
                </div>
                <div class="piloto-detalhes">
                    <h4>PILOTO COMANDANTE</h4>
                    <div class="piloto-nome">${voo.piloto.nome}</div>
                    <div class="piloto-experiencia">${voo.piloto.experiencia}</div>
                </div>
            </div>
            
            <div class="rota-info">
                <div class="rota-cidade">
                    <div class="cidade">
                        <div class="cidade-nome">${voo.origem}</div>
                        <div class="cidade-icao">${voo.origemICAO}</div>
                    </div>
                    <div class="rota-linha">
                        <hr>
                        <span class="rota-icone">✈️</span>
                        <hr>
                    </div>
                    <div class="cidade">
                        <div class="cidade-nome">${voo.destino}</div>
                        <div class="cidade-icao">${voo.destinoICAO}</div>
                    </div>
                </div>
            </div>
            
            <div class="horario-info">
                <div class="horario-item">
                    <div class="label">PARTIDA</div>
                    <div class="value">${voo.horarioPartida}</div>
                </div>
                <div class="horario-item">
                    <div class="label">DURAÇÃO</div>
                    <div class="value">~${Math.abs(parseInt(voo.horarioChegada.split(':')[0]) - parseInt(voo.horarioPartida.split(':')[0]))}h</div>
                </div>
                <div class="horario-item">
                    <div class="label">CHEGADA</div>
                    <div class="value">${voo.horarioChegada}</div>
                </div>
            </div>
            
            <button class="btn-reservar" onclick="reservarVoo(${voo.id})">
                🎫 RESERVAR ESTE VOO
            </button>
        </div>
    `).join('');
}

function mostrarModal(conteudo) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = conteudo;
    modal.style.display = 'flex';
}

function fecharModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) fecharModal();
}

document.addEventListener('DOMContentLoaded', () => {
    exibirCatalogo();
});