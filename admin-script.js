// ========== URL DO SHEETDB (ATUALIZADA) ==========
const API_URL = "https://sheetdb.io/api/v1/zgrywmv600xid";

async function carregarReservas() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        if (data.error) return [];
        return Array.isArray(data) ? data : [data];
    } catch (error) {
        console.error("Erro:", error);
        return [];
    }
}

async function atualizarReserva(id, dados) {
    try {
        await fetch(`${API_URL}/ID/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        return true;
    } catch (error) {
        console.error("Erro:", error);
        return false;
    }
}

async function deletarReserva(id) {
    try {
        await fetch(`${API_URL}/ID/${id}`, { method: 'DELETE' });
        return true;
    } catch (error) {
        console.error("Erro:", error);
        return false;
    }
}

async function atualizarStatusReserva(id, novoStatus) {
    await atualizarReserva(id, { 
        Status: novoStatus,
        UltimaAtualizacao: new Date().toLocaleString('pt-BR')
    });
    alert('✅ Status atualizado!');
    renderizarTabelaReservas();
    atualizarEstatisticas();
}

async function editarMensagemReserva(id, mensagem) {
    await atualizarReserva(id, { 
        Mensagem: mensagem,
        UltimaAtualizacao: new Date().toLocaleString('pt-BR')
    });
    alert('✅ Mensagem salva!');
    renderizarTabelaReservas();
}

async function cancelarReservaAdmin(id) {
    if (confirm('Cancelar esta reserva?')) {
        await deletarReserva(id);
        alert('✅ Reserva cancelada!');
        renderizarTabelaReservas();
        atualizarEstatisticas();
    }
}

async function renderizarTabelaReservas(filtro = 'todos') {
    let reservas = await carregarReservas();
    if (filtro !== 'todos') {
        reservas = reservas.filter(r => r.Status === filtro);
    }
    
    const tbody = document.getElementById('tabelaReservasBody');
    if (!reservas || reservas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">Nenhuma reserva encontrada</td></tr>';
        return;
    }
    
    tbody.innerHTML = reservas.map(reserva => `
        <tr>
            <td>${reserva.CodigoReserva || '-'}</td>
            <td>${reserva.CodigoVoo || '-'}</td>
            <td>${reserva.Origem || '-'} → ${reserva.Destino || '-'}</td>
            <td>${reserva.Passageiro || '-'}</td>
            <td>${reserva.DataReserva || '-'}</td>
            <td>
                <select onchange="atualizarStatusReserva(${reserva.ID}, this.value)">
                    <option value="emdia" ${reserva.Status === 'emdia' ? 'selected' : ''}>✅ Em dia</option>
                    <option value="atrasado" ${reserva.Status === 'atrasado' ? 'selected' : ''}>⚠️ Atrasado</option>
                    <option value="cancelado" ${reserva.Status === 'cancelado' ? 'selected' : ''}>❌ Cancelado</option>
                </select>
             </td>
            <td>
                <input type="text" id="msg_${reserva.ID}" value="${reserva.Mensagem || ''}" placeholder="Mensagem" style="width:120px;">
                <button onclick="editarMensagemReserva(${reserva.ID}, document.getElementById('msg_${reserva.ID}').value)">💾</button>
             </td>
            <td>${reserva.UltimaAtualizacao || '-'}</td>
            <td><button onclick="cancelarReservaAdmin(${reserva.ID})" style="background:#8b1a1a;color:white;">🗑️</button></td>
        </tr>
    `).join('');
}

async function atualizarEstatisticas() {
    const reservas = await carregarReservas();
    document.getElementById('totalReservas').innerHTML = reservas.length;
    document.getElementById('totalEmDia').innerHTML = reservas.filter(r => r.Status === 'emdia').length;
    document.getElementById('totalAtrasados').innerHTML = reservas.filter(r => r.Status === 'atrasado').length;
    document.getElementById('totalCancelados').innerHTML = reservas.filter(r => r.Status === 'cancelado').length;
}

function filtrarReservas(filtro) {
    document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderizarTabelaReservas(filtro);
}

async function exportarReservas() {
    const reservas = await carregarReservas();
    if (!reservas || reservas.length === 0) { alert('Sem reservas'); return; }
    let csv = "ID,Código,Voo,Origem,Destino,Passageiro,Data,Status,Mensagem\n";
    reservas.forEach(r => {
        csv += `"${r.ID}","${r.CodigoReserva}","${r.CodigoVoo}","${r.Origem}","${r.Destino}","${r.Passageiro}","${r.DataReserva}","${r.Status}","${r.Mensagem}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reservas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    alert('✅ Exportado!');
}

async function limparTodasReservasAdmin() {
    if (confirm('⚠️ ATENÇÃO! Isso vai apagar TODAS as reservas. Tem certeza?')) {
        const reservas = await carregarReservas();
        for (const r of reservas) {
            if (r.ID) await deletarReserva(r.ID);
        }
        alert('✅ Todas reservas removidas!');
        renderizarTabelaReservas();
        atualizarEstatisticas();
    }
}

function atualizarMensagemGlobal() {
    const mensagem = document.getElementById('mensagemGlobal').value;
    const statusGlobal = document.getElementById('statusGlobal').value;
    const config = {
        mensagem: mensagem,
        status: statusGlobal,
        ultimaAlteracao: new Date().toLocaleString('pt-BR')
    };
    localStorage.setItem('airnz_mensagem_global', JSON.stringify(config));
    alert('✅ Mensagem global salva!');
}

function carregarMensagemGlobal() {
    const config = localStorage.getItem('airnz_mensagem_global');
    if (config) {
        const data = JSON.parse(config);
        document.getElementById('mensagemGlobal').value = data.mensagem;
        document.getElementById('statusGlobal').value = data.status;
        document.getElementById('previewMensagem').innerHTML = `
            <strong>Status:</strong> ${data.status}<br>
            <strong>Mensagem:</strong> ${data.mensagem}<br>
            <small>${data.ultimaAlteracao}</small>
        `;
    } else {
        const defaultMsg = "Sua viagem está em dia! Prepare-se para o embarque.";
        document.getElementById('mensagemGlobal').value = defaultMsg;
        document.getElementById('previewMensagem').innerHTML = `<strong>Status:</strong> emdia<br><strong>Mensagem:</strong> ${defaultMsg}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    carregarMensagemGlobal();
    renderizarTabelaReservas();
    atualizarEstatisticas();
    setInterval(() => {
        renderizarTabelaReservas();
        atualizarEstatisticas();
    }, 15000);
});