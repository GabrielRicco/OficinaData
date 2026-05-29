const http = require('http');

const headers = {
  'Access-Control-Allow-Origin': 'http://127.0.0.1:5173',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization,Content-Type',
  'Content-Type': 'application/json; charset=utf-8'
};

const agendamentos = [
  {
    id: 104,
    cliente: 'Oficina do Mecanico LTDA',
    veiculo: 'VW Delivery',
    placa: 'ABC1D23',
    status: 'Em andamento',
    dataAbertura: new Date().toISOString(),
    dataConclusao: null,
    totalGeral: 850
  },
  {
    id: 103,
    cliente: 'Carlos Alberto',
    veiculo: 'Chevrolet Onix',
    placa: 'DEF2G34',
    status: 'Concluído',
    dataAbertura: new Date().toISOString(),
    dataConclusao: new Date().toISOString(),
    totalGeral: 320
  },
  {
    id: 102,
    cliente: 'Mariana Costa',
    veiculo: 'Hyundai HB20',
    placa: 'GHI3J45',
    status: 'Agendado',
    dataAbertura: new Date().toISOString(),
    dataConclusao: null,
    totalGeral: 150
  }
];

const tiposServico = [
  { id: 1, descricao: 'Troca de oleo e filtro', precoBase: 120, tempoEstimadoMin: 30 },
  { id: 2, descricao: 'Revisao de freios', precoBase: 250, tempoEstimadoMin: 90 },
  { id: 3, descricao: 'Diagnostico eletronico', precoBase: 150, tempoEstimadoMin: 45 }
];

const pecas = [
  { id: 1, nome: 'Filtro de oleo', fornecedor: 'Bosch', precoUnitario: 25, quantidadeEstoque: 45, quantidadeMinima: 10 },
  { id: 9, nome: 'Amortecedor dianteiro', fornecedor: 'Cofap', precoUnitario: 320, quantidadeEstoque: 3, quantidadeMinima: 6 }
];

const funcionarios = [
  { id: 1, nome: 'Funcionario 1', cargo: 'Mecanico', salario: 4200, dataAdmissao: '2021-03-10' },
  { id: 2, nome: 'Funcionario 2', cargo: 'Eletricista', salario: 4200, dataAdmissao: '2020-08-20' }
];

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => body += chunk);
    req.on('end', () => resolve(body ? JSON.parse(body) : {}));
  });
}

function send(res, status, body) {
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
}

function tokenFor(email) {
  const perfil = email.includes('gerente') || email.includes('admin') ? 'GERENTE' : 'ATENDENTE';
  return {
    token: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    tipo: 'Bearer',
    expiresInSeconds: 3600,
    usuario: {
      id: perfil === 'GERENTE' ? 1 : 2,
      nome: perfil === 'GERENTE' ? 'Gerente Geral' : 'Atendente',
      email,
      perfil
    }
  };
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, headers);
    res.end();
    return;
  }

  const url = new URL(req.url, 'http://127.0.0.1:8080');

  try {
    if (req.method === 'POST' && url.pathname === '/api/auth/login') {
      const body = await readBody(req);
      send(res, 200, tokenFor(body.email || 'atendente1@oficina.local'));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/auth/refresh') {
      send(res, 200, tokenFor('gerente@oficina.local'));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/relatorios/dashboard') {
      send(res, 200, { osAbertas: 12, receitaDia: 18450, pecasEmAlerta: 4, notaMedia: 4.7 });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/agendamentos') {
      send(res, 200, { content: agendamentos, totalElements: agendamentos.length, totalPages: 1, number: 0, size: 10 });
      return;
    }

    if (req.method === 'GET' && /^\/api\/agendamentos\/\d+$/.test(url.pathname)) {
      const id = Number(url.pathname.split('/').pop());
      const agendamento = agendamentos.find((item) => item.id === id) || agendamentos[0];
      send(res, 200, {
        ...agendamento,
        veiculoId: 1,
        kmEntrada: 64000,
        kmSaida: agendamento.status === 'Concluído' ? 64320 : null,
        totalServicos: 500,
        totalPecas: agendamento.totalGeral - 500,
        servicos: [{ id: 1, tipoServicoId: 1, descricao: 'Troca de oleo e filtro', funcionarioId: 1, funcionario: 'Funcionario 1', quantidade: 1, precoUnitario: 120, desconto: 0, total: 120 }],
        pecas: [{ id: 1, pecaId: 1, nome: 'Filtro de oleo', quantidade: 1, precoUnitario: 25, desconto: 0, total: 25 }],
        pagamentos: agendamento.status === 'Concluído' ? [{ id: 1, formaPagamento: 'Pix', valor: agendamento.totalGeral, parcelas: 1, dataPagamento: new Date().toISOString() }] : [],
        avaliacao: agendamento.status === 'Concluído' ? { id: 1, nota: 5, comentario: 'Otimo atendimento', dataAvaliacao: new Date().toISOString() } : null
      });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/clientes') {
      const body = await readBody(req);
      send(res, 201, { id: Date.now(), ...body, tipo: body.cpf ? 'PF' : 'PJ', veiculos: [] });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/veiculos') {
      const body = await readBody(req);
      send(res, 201, { id: Date.now(), ...body, historico: [] });
      return;
    }

    if (req.method === 'GET' && /^\/api\/clientes\/\d+\/veiculos$/.test(url.pathname)) {
      send(res, 200, [{ id: 1, placa: 'ABC1D23', marca: 'Toyota', modelo: 'Corolla', ano: 2022 }]);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/tipos-servico') {
      send(res, 200, tiposServico);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/pecas') {
      send(res, 200, { content: pecas, totalElements: pecas.length, totalPages: 1, number: 0, size: 10 });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/funcionarios') {
      send(res, 200, funcionarios);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/relatorios/top-clientes') {
      send(res, 200, [{ idCliente: 1, nome: 'Carlos Alberto', tipoCliente: 'PF', gastoTotal: 2200 }]);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/relatorios/formas-pagamento') {
      send(res, 200, [{ formaPagamento: 'Pix', qtdTransacoes: 12, valorTotal: 5600, percValor: 48.5 }]);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/relatorios/ranking-funcionarios') {
      send(res, 200, [{ idFuncionario: 1, nome: 'Funcionario 1', qtdOs: 18, faturamento: 8200 }]);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/pecas/abaixo-estoque-minimo') {
      send(res, 200, [
        { idPeca: 9, nome: 'Amortecedor dianteiro', quantidadeEstoque: 3, quantidadeMinima: 6, deficit: 3, fornecedor: 'Cofap' }
      ]);
      return;
    }

    send(res, 404, { message: 'Endpoint mock nao implementado' });
  } catch (error) {
    send(res, 500, { message: error.message });
  }
});

server.listen(8080, '127.0.0.1', () => {
  console.log('Mock API OficinaData em http://127.0.0.1:8080/api');
});
