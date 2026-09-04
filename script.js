/* ============================================================
   Conversor de Datas em Dias - ATPBR
   Tudo roda no navegador. Nenhuma data e nenhum resultado sai
   desta página: não há requisição de rede, não há armazenamento
   em localStorage/sessionStorage, não há cookie.
   ============================================================ */

/* ====== Marcos (datas de referência) ====== */
const MARCOS = {
  nascimento: { label: 'data de nascimento', campo: 'ref-nascimento' },
  diagnostico: { label: 'data do diagnóstico (dia 0)', campo: 'ref-diagnostico' },
  tratamento: { label: 'data de início do tratamento', campo: 'ref-tratamento' }
};

/* ====== Todas as variáveis do ATPBR que esperam número de dias ======
   de   -> ponto inicial da contagem
   para -> ponto final da contagem
   { marco: 'x' } reaproveita uma das datas de referência;
   { label: '...' } gera um campo de data próprio da variável.       */
const VARIAVEIS = [
  {
    nome: 'diagnosis_age',
    modulo: 'Paciente',
    categoria: 'Diagnóstico Oncológico',
    obrigatoria: true,
    descricao: 'Idade no momento do diagnóstico (primeiro exame confirmatório de malignidade), expressa em número de dias.',
    de: { marco: 'nascimento' },
    para: { marco: 'diagnostico' },
    minZero: true,
    mostrarAnos: true
  },
  {
    nome: 'age_at_menarche',
    modulo: 'Paciente',
    categoria: 'Saúde Reprodutiva',
    obrigatoria: false,
    descricao: 'Idade, em número de dias, na ocorrência da primeira menstruação.',
    de: { marco: 'nascimento' },
    para: { label: 'Data da primeira menstruação' },
    minZero: true,
    mostrarAnos: true
  },
  {
    nome: 'age_at_sexarche',
    modulo: 'Paciente',
    categoria: 'Saúde Reprodutiva',
    obrigatoria: false,
    descricao: 'Idade, em número de dias, na primeira relação sexual.',
    de: { marco: 'nascimento' },
    para: { label: 'Data da primeira relação sexual' },
    minZero: true,
    mostrarAnos: true
  },
  {
    nome: 'age_at_last_menstruation',
    modulo: 'Paciente',
    categoria: 'Saúde Reprodutiva',
    obrigatoria: false,
    descricao: 'Idade da paciente, em número de dias, na última menstruação natural relatada.',
    de: { marco: 'nascimento' },
    para: { label: 'Data da última menstruação natural' },
    minZero: true,
    mostrarAnos: true
  },
  {
    nome: 'age_at_menopausal',
    modulo: 'Paciente',
    categoria: 'Saúde Reprodutiva',
    obrigatoria: false,
    descricao: 'Idade da paciente, em número de dias, no momento da menopausa.',
    de: { marco: 'nascimento' },
    para: { label: 'Data da menopausa' },
    minZero: true,
    mostrarAnos: true
  },
  {
    nome: 'duration_of_hormonal_contraceptive',
    modulo: 'Paciente',
    categoria: 'Saúde Reprodutiva',
    obrigatoria: false,
    descricao: 'Duração total do uso de contraceptivo hormonal, em número de dias. Esta variável é uma duração, então usa duas datas próprias e nenhum marco.',
    de: { label: 'Data de início do uso' },
    para: { label: 'Data de término do uso' },
    minZero: true,
    mostrarAnos: false
  },
  {
    nome: 'days_to_treatment_or_therapy',
    modulo: 'Amostra',
    categoria: 'Tratamento',
    obrigatoria: true,
    descricao: 'Número de dias entre o diagnóstico e o tratamento inicial.',
    de: { marco: 'diagnostico' },
    para: { marco: 'tratamento' },
    minZero: false,
    mostrarAnos: false
  },
  {
    nome: 'days_to_last_follow_up',
    modulo: 'Amostra',
    categoria: 'Acompanhamento',
    obrigatoria: true,
    descricao: 'Número de dias entre o diagnóstico inicial da doença e o último status clínico registrado do paciente (óbito ou último acompanhamento).',
    de: { marco: 'diagnostico' },
    para: { label: 'Data do último status clínico registrado' },
    minZero: false,
    mostrarAnos: false
  },
  {
    nome: 'disease_free_days',
    modulo: 'Amostra',
    categoria: 'Acompanhamento',
    obrigatoria: true,
    descricao: 'Número de dias do tratamento inicial até o momento em que o paciente foi considerado livre de doença.',
    de: { marco: 'tratamento' },
    para: { label: 'Data em que foi considerado livre de doença' },
    minZero: false,
    mostrarAnos: false
  },
  {
    nome: 'days_to_lost_to_followup',
    modulo: 'Amostra',
    categoria: 'Acompanhamento',
    obrigatoria: false,
    descricao: 'Número de dias do diagnóstico até o momento da perda de seguimento.',
    de: { marco: 'diagnostico' },
    para: { label: 'Data da perda de seguimento' },
    minZero: false,
    mostrarAnos: false
  },
  {
    nome: 'days_to_sample',
    modulo: 'Amostra',
    categoria: 'Localização e Coleta',
    obrigatoria: false,
    descricao: 'Número de dias entre o diagnóstico inicial da doença e a coleta da amostra.',
    de: { marco: 'diagnostico' },
    para: { label: 'Data da coleta da amostra' },
    minZero: false,
    mostrarAnos: false
  },
  {
    nome: 'days_to_consent',
    modulo: 'Amostra',
    categoria: 'Localização e Coleta',
    obrigatoria: false,
    descricao: 'Número de dias entre a data do diagnóstico e a data em que o consentimento foi obtido.',
    de: { marco: 'diagnostico' },
    para: { label: 'Data da obtenção do consentimento' },
    minZero: false,
    mostrarAnos: false
  },
  {
    nome: 'days_to_best_overall_response',
    modulo: 'Amostra',
    categoria: 'Resposta ao Tratamento',
    obrigatoria: false,
    descricao: 'Número de dias entre a data do diagnóstico e a data em que o paciente apresentou a melhor resposta clínica documentada.',
    de: { marco: 'diagnostico' },
    para: { label: 'Data da melhor resposta clínica documentada' },
    minZero: false,
    mostrarAnos: false
  },
  {
    nome: 'recurrence_free_days',
    modulo: 'Amostra',
    categoria: 'Recidiva e Progressão',
    obrigatoria: false,
    descricao: 'Número de dias entre o tratamento inicial e a identificação da primeira recidiva da doença.',
    de: { marco: 'tratamento' },
    para: { label: 'Data da identificação da primeira recidiva' },
    minZero: false,
    mostrarAnos: false
  },
  {
    nome: 'progression_free_days',
    modulo: 'Amostra',
    categoria: 'Recidiva e Progressão',
    obrigatoria: false,
    descricao: 'Número de dias entre o tratamento inicial e a primeira evidência documentada de progressão da doença.',
    de: { marco: 'tratamento' },
    para: { label: 'Data da primeira evidência de progressão' },
    minZero: false,
    mostrarAnos: false
  }
];

/* ====== Elementos ====== */
const form = document.getElementById('form');
const resultado = document.getElementById('resultado');
const blocoVariaveis = document.getElementById('bloco-variaveis');
const blocoLote = document.getElementById('bloco-lote');
const variaveisContainer = document.getElementById('variaveis-container');
const loteVariavel = document.getElementById('lote-variavel');

const getModo = () => document.querySelector('input[name="modo"]:checked').value;

/* ====== Datas ======
   As datas são tratadas como dias de calendário em UTC, para que o
   fuso horário do navegador nunca desloque a contagem em 1 dia.    */
const MS_DIA = 86400000;

// Aceita AAAA-MM-DD (campos <input type="date"> e colagem) e DD/MM/AAAA ou DD-MM-AAAA (colagem).
const parseData = (texto) => {
  const s = (texto || '').trim();
  if (!s) return null;

  let a, m, d;
  let mt = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (mt) {
    [, a, m, d] = mt;
  } else {
    mt = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (!mt) return null;
    [, d, m, a] = mt;
  }

  a = Number(a); m = Number(m); d = Number(d);
  const ts = Date.UTC(a, m - 1, d);
  const dt = new Date(ts);
  // Rejeita datas inexistentes, como 31/02.
  if (dt.getUTCFullYear() !== a || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return ts;
};

const diffDias = (inicio, fim) => Math.round((fim - inicio) / MS_DIA);

const emAnos = (dias) => (dias / 365.25).toFixed(1).replace('.', ',');

const escapar = (t) => String(t).replace(/[&<>"]/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
));

/* ====== Montagem do modo "por variável" ====== */
const idCampo = (variavel, ponta) => `ev-${variavel.nome}-${ponta}`;

const htmlPonta = (variavel, ponta) => {
  const spec = variavel[ponta];
  if (spec.marco) return '';
  return `
    <div>
      <label for="${idCampo(variavel, ponta)}">${escapar(spec.label)}</label>
      <input type="date" id="${idCampo(variavel, ponta)}" data-variavel="${variavel.nome}">
    </div>`;
};

const htmlMarco = (spec) => (spec.marco ? MARCOS[spec.marco].label : spec.label.toLowerCase());

const montarVariaveis = () => {
  let html = '';
  let categoriaAtual = null;

  VARIAVEIS.forEach((v) => {
    const cat = `${v.modulo} · ${v.categoria}`;
    if (cat !== categoriaAtual) {
      if (categoriaAtual !== null) html += '</fieldset>';
      html += `<fieldset><legend>${escapar(cat)}</legend>`;
      categoriaAtual = cat;
    }

    const badge = v.obrigatoria
      ? '<span class="badge badge-obrigatoria">obrigatória</span>'
      : '<span class="badge badge-opcional">opcional</span>';

    const camposDatas = htmlPonta(v, 'de') + htmlPonta(v, 'para');
    const semCamposProprios = camposDatas.trim() === '';

    html += `
      <div class="var-item" id="item-${v.nome}">
        <div class="var-nome">${v.nome} ${badge}</div>
        <p class="var-desc">${escapar(v.descricao)}</p>
        <p class="var-marco">Contagem: de <strong>${escapar(htmlMarco(v.de))}</strong>
           até <strong>${escapar(htmlMarco(v.para))}</strong>.
           ${semCamposProprios ? 'Calculada automaticamente a partir das datas de referência.' : ''}</p>
        ${camposDatas ? `<div class="var-datas">${camposDatas}</div>` : ''}
        <div class="var-valor vazio" id="valor-${v.nome}">Aguardando datas.</div>
      </div>`;
  });

  if (categoriaAtual !== null) html += '</fieldset>';
  variaveisContainer.innerHTML = html;
};

/* Lê as duas pontas de uma variável e devolve o resultado do cálculo.
   Uma variável só é considerada "em uso" quando pelo menos um dos seus
   campos de data próprios foi preenchido. Assim, preencher um marco não
   faz a ferramenta cobrar todas as variáveis opcionais que dependem dele. */
const calcular = (v) => {
  const ler = (ponta) => {
    const spec = v[ponta];
    const proprio = !spec.marco;
    const el = document.getElementById(proprio ? idCampo(v, ponta) : MARCOS[spec.marco].campo);
    return { valor: parseData(el ? el.value : ''), rotulo: htmlMarco(spec), proprio };
  };

  const de = ler('de');
  const para = ler('para');
  const pontas = [de, para];

  const temCampoProprio = pontas.some((p) => p.proprio);
  const proprioPreenchido = pontas.some((p) => p.proprio && p.valor !== null);

  // Sem campo próprio (as duas pontas são marcos): calcula em silêncio quando
  // ambos os marcos existem e fica em espera enquanto faltar algum.
  if (!temCampoProprio && (de.valor === null || para.valor === null)) {
    return { estado: 'vazio' };
  }

  // Com campo próprio, nada preenchido pelo usuário significa variável não informada.
  if (temCampoProprio && !proprioPreenchido) {
    return { estado: 'vazio' };
  }

  const faltando = pontas.find((p) => p.valor === null);
  if (faltando) {
    return { estado: 'incompleto', mensagem: `Informe a ${faltando.rotulo}.` };
  }

  const dias = diffDias(de.valor, para.valor);

  if (dias < 0 && v.minZero) {
    return { estado: 'invalido', dias, mensagem: `Valor negativo (${dias} dias): a ${para.rotulo} é anterior à ${de.rotulo}.` };
  }

  const aviso = dias < 0
    ? `Valor negativo (${dias} dias): a ${para.rotulo} é anterior à ${de.rotulo}. Confirme se está correto.`
    : null;

  return { estado: 'ok', dias, aviso };
};

/* Recalcula todas as variáveis e atualiza o valor exibido em cada uma. */
const atualizarVariaveis = () => {
  VARIAVEIS.forEach((v) => {
    const r = calcular(v);
    const alvo = document.getElementById(`valor-${v.nome}`);
    const item = document.getElementById(`item-${v.nome}`);
    if (!alvo) return;

    alvo.classList.remove('erro', 'vazio');
    item.classList.remove('pendente');

    if (r.estado === 'vazio') {
      alvo.classList.add('vazio');
      alvo.textContent = 'Aguardando datas.';
    } else if (r.estado === 'incompleto') {
      alvo.classList.add('erro');
      item.classList.add('pendente');
      alvo.textContent = `⚠️ ${r.mensagem}`;
    } else if (r.estado === 'invalido') {
      alvo.classList.add('erro');
      item.classList.add('pendente');
      alvo.textContent = `⚠️ ${r.mensagem}`;
    } else {
      const anos = v.mostrarAnos ? ` (≈ ${emAnos(r.dias)} anos)` : '';
      alvo.textContent = `${v.nome} = ${r.dias} dias${anos}${r.aviso ? ' ⚠️' : ''}`;
    }
  });
};

/* ====== Alternância de modo ====== */
const atualizarModo = () => {
  const lote = getModo() === 'lote';
  blocoVariaveis.classList.toggle('oculto', lote);
  blocoLote.classList.toggle('oculto', !lote);
  resultado.innerHTML = '';
};

/* ====== Resultado ====== */
const montarResultado = ({ titulo, colunas, linhas, csv, arquivo, avisos, textoCopia }) => {
  const cabecalho = colunas.map((c) => `<th>${escapar(c.titulo)}</th>`).join('');
  const corpo = linhas.map((l) => `<tr>${
    colunas.map((c) => `<td class="${c.classe || ''}">${escapar(l[c.chave])}</td>`).join('')
  }</tr>`).join('');

  const blocoAvisos = (avisos && avisos.length)
    ? `<div class="alerta"><strong>Atenção:</strong><ul>${avisos.map((a) => `<li>${escapar(a)}</li>`).join('')}</ul></div>`
    : '';

  resultado.innerHTML = `
    <h3>${escapar(titulo)}</h3>
    <table><thead><tr>${cabecalho}</tr></thead><tbody>${corpo}</tbody></table>
    <div class="acoes">
      <button type="button" id="btnCopiar" class="btn">📋 Copiar resultados</button>
      <button type="button" id="btnCsv" class="btn">📥 Baixar CSV</button>
      <button type="button" id="btnLimpar" class="btn">🧹 Limpar campos</button>
    </div>
    ${blocoAvisos}
    <p class="aviso-copiar">
      Estes valores <strong>não foram salvos em nenhum lugar</strong>. Copie ou baixe agora:
      ao recarregar ou fechar a aba, o resultado é perdido.
    </p>`;

  document.getElementById('btnCopiar').addEventListener('click', (ev) => {
    const botao = ev.currentTarget;
    const marcarCopiado = () => {
      botao.textContent = '✅ Copiado';
      setTimeout(() => { botao.textContent = '📋 Copiar resultados'; }, 2000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textoCopia).then(marcarCopiado, () => copiarFallback(textoCopia, marcarCopiado));
    } else {
      copiarFallback(textoCopia, marcarCopiado);
    }
  });

  document.getElementById('btnCsv').addEventListener('click', () => {
    // BOM para o Excel reconhecer os acentos.
    const blob = new Blob(['﻿' + csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = arquivo;
    link.click();
    URL.revokeObjectURL(link.href);
  });

  document.getElementById('btnLimpar').addEventListener('click', limparTudo);
};

const copiarFallback = (texto, aoCopiar) => {
  const area = document.createElement('textarea');
  area.value = texto;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  try { document.execCommand('copy'); aoCopiar(); } catch (e) { /* nada a fazer */ }
  document.body.removeChild(area);
};

const mostrarErro = (msg) => {
  resultado.innerHTML = `<p style="color:red;">${escapar(msg)}</p>`;
};

const limparTudo = () => {
  form.querySelectorAll('input[type="date"], textarea').forEach((el) => { el.value = ''; });
  resultado.innerHTML = '';
  atualizarVariaveis();
  window.scrollTo({ top: form.offsetTop - 40, behavior: 'smooth' });
};

/* ====== Submissão: modo por variável ====== */
const converterVariaveis = () => {
  const linhas = [];
  const csv = ['Variavel;Modulo;Categoria;Obrigatoriedade;Dias'];
  const textos = [];
  const avisos = [];

  VARIAVEIS.forEach((v) => {
    const r = calcular(v);
    if (r.estado === 'vazio') return;
    if (r.estado === 'incompleto' || r.estado === 'invalido') {
      avisos.push(`${v.nome}: ${r.mensagem}`);
      return;
    }
    if (r.aviso) avisos.push(`${v.nome}: ${r.aviso}`);

    linhas.push({
      variavel: v.nome,
      modulo: v.modulo,
      dias: v.mostrarAnos ? `${r.dias} (≈ ${emAnos(r.dias)} anos)` : String(r.dias)
    });
    csv.push(`${v.nome};${v.modulo};${v.categoria};${v.obrigatoria ? 'Obrigatoria' : 'Opcional'};${r.dias}`);
    textos.push(`${v.nome} = ${r.dias}`);
  });

  if (!linhas.length) {
    return mostrarErro('⚠️ Nenhuma variável pôde ser calculada. Informe pelo menos um marco e a data do evento correspondente.');
  }

  montarResultado({
    titulo: 'Valores em dias para o ATPBR:',
    colunas: [
      { titulo: 'Variável', chave: 'variavel', classe: 'mono' },
      { titulo: 'Módulo', chave: 'modulo' },
      { titulo: 'Dias', chave: 'dias', classe: 'dias' }
    ],
    linhas,
    csv,
    arquivo: 'dias_convertidos_ATPBR.csv',
    avisos,
    textoCopia: textos.join('\n')
  });
};

/* ====== Submissão: modo em lote ====== */
const converterLote = () => {
  const emLinhas = (id) => document.getElementById(id).value
    .split('\n').map((t) => t.trim()).filter((t) => t);

  const refs = emLinhas('lote-ref');
  const eventos = emLinhas('lote-evento');
  const ids = emLinhas('lote-rotulo');
  const variavel = loteVariavel.value;
  const spec = VARIAVEIS.find((v) => v.nome === variavel);

  if (!refs.length) return mostrarErro('⚠️ Informe pelo menos uma data de referência.');
  if (!eventos.length) return mostrarErro('⚠️ Informe pelo menos uma data de evento.');
  if (refs.length !== 1 && refs.length !== eventos.length) {
    return mostrarErro(`⚠️ Quantidade de datas de referência (${refs.length}) ≠ quantidade de datas de evento (${eventos.length}). Informe uma referência por linha ou uma única referência para todas.`);
  }
  if (ids.length && ids.length !== eventos.length) {
    return mostrarErro(`⚠️ Quantidade de identificadores (${ids.length}) ≠ quantidade de datas de evento (${eventos.length}).`);
  }

  const linhas = [];
  const csv = [variavel ? 'Identificador;Variavel;Dias' : 'Identificador;Dias'];
  const textos = [];
  const avisos = [];

  for (let i = 0; i < eventos.length; i++) {
    const textoRef = refs.length === 1 ? refs[0] : refs[i];
    const dataRef = parseData(textoRef);
    const dataEv = parseData(eventos[i]);
    const identificador = ids.length ? ids[i] : String(i + 1);

    if (dataRef === null) {
      return mostrarErro(`⚠️ Data de referência inválida na linha ${refs.length === 1 ? 1 : i + 1}: "${textoRef}" (use AAAA-MM-DD ou DD/MM/AAAA).`);
    }
    if (dataEv === null) {
      return mostrarErro(`⚠️ Data de evento inválida na linha ${i + 1}: "${eventos[i]}" (use AAAA-MM-DD ou DD/MM/AAAA).`);
    }

    const dias = diffDias(dataRef, dataEv);

    if (dias < 0) {
      const grave = spec && spec.minZero;
      avisos.push(`Linha ${i + 1} (${identificador}): valor negativo (${dias} dias), a data do evento é anterior à de referência.${grave ? ` A variável ${variavel} não admite valores negativos.` : ' Confirme se está correto.'}`);
    }

    linhas.push({ identificador, dias: String(dias) });
    csv.push(variavel ? `${identificador};${variavel};${dias}` : `${identificador};${dias}`);
    textos.push(variavel ? `${identificador};${variavel};${dias}` : `${identificador};${dias}`);
  }

  montarResultado({
    titulo: variavel ? `Valores em dias para ${variavel}:` : 'Valores em dias:',
    colunas: [
      { titulo: 'Identificador', chave: 'identificador', classe: 'mono' },
      { titulo: 'Dias', chave: 'dias', classe: 'dias' }
    ],
    linhas,
    csv,
    arquivo: variavel ? `dias_${variavel}_ATPBR.csv` : 'dias_convertidos_ATPBR.csv',
    avisos,
    textoCopia: textos.join('\n')
  });
};

/* ====== Tabela de referência das variáveis ====== */
const montarTabelaReferencia = () => {
  const corpo = document.querySelector('#tabela-vars tbody');
  corpo.innerHTML = VARIAVEIS.map((v) => `
    <tr>
      <td class="mono">${v.nome}</td>
      <td>${escapar(v.modulo)}</td>
      <td>${v.obrigatoria ? 'Obrigatória' : 'Opcional'}</td>
      <td>${escapar(htmlMarco(v.de))}</td>
      <td>${escapar(htmlMarco(v.para))}</td>
    </tr>`).join('');
};

/* ====== Inicialização ====== */
montarVariaveis();
montarTabelaReferencia();

VARIAVEIS.forEach((v) => {
  loteVariavel.insertAdjacentHTML('beforeend',
    `<option value="${v.nome}">${v.nome} (${v.modulo})</option>`);
});

document.querySelectorAll('input[name="modo"]').forEach((radio) => {
  radio.addEventListener('change', atualizarModo);
});

form.addEventListener('input', (e) => {
  if (e.target.type === 'date') atualizarVariaveis();
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (getModo() === 'lote') converterLote(); else converterVariaveis();
});

atualizarModo();
atualizarVariaveis();
