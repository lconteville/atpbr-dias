/* ============================================================
   Conversor de Datas em Dias - ATPBR
   Tudo roda no navegador. Nenhuma data e nenhum resultado sai
   desta página: não há requisição de rede, não há armazenamento
   em localStorage/sessionStorage, não há cookie.
   ============================================================ */

/* ====== Marcos (datas de referência compartilhadas) ======
   titulo    -> rótulo do campo na etapa 2
   label     -> como o marco é citado no texto corrido
   descricao -> o que é essa data, para o usuário conferir se pegou a certa */
const MARCOS = {
  nascimento: {
    titulo: 'Data de nascimento',
    label: 'data de nascimento',
    descricao: 'Data de nascimento do paciente. Marco de todas as variáveis de idade.'
  },
  diagnostico: {
    titulo: 'Data do diagnóstico',
    label: 'data do diagnóstico (dia 0)',
    descricao: 'Primeiro exame que concluiu a malignidade. É o dia 0 das variáveis days_to_*.',
    dia0: true
  },
  tratamento: {
    titulo: 'Data de início do tratamento',
    label: 'data de início do tratamento',
    descricao: 'Início do tratamento inicial. Marco dos intervalos livres de doença, recidiva e progressão.'
  }
};

/* ====== Todas as variáveis do ATPBR que esperam número de dias ======
   de   -> ponto inicial da contagem
   para -> ponto final da contagem
   { marco: 'x' } reaproveita uma das datas de referência;
   { label: '...' } gera uma coluna de data própria da variável.       */
const VARIAVEIS = [
  {
    nome: 'diagnosis_age_in_days',
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
    de: { label: 'Data de início do uso de contraceptivo hormonal' },
    para: { label: 'Data de término do uso de contraceptivo hormonal' },
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

/* ====== Identificadores das linhas ======
   Não são variáveis do ATPBR que se calculam, são os códigos que o usuário já
   tem e que fazem a ponte entre o resultado e o cadastro. Os nomes das chaves
   são os mesmos atributos da plataforma, para a coluna sair pronta para colar. */
const IDENTIFICADORES = [
  {
    chave: 'patient_id',
    titulo: 'Código do paciente',
    hint: 'O identificador do paciente no seu cadastro, um por linha.',
    exemplo: '0001\n0002\n0003'
  },
  {
    chave: 'sample_id',
    titulo: 'Código da amostra',
    hint: 'O identificador da amostra, um por linha. Útil quando o mesmo paciente tem mais de uma.',
    exemplo: '0001\n0002\n0003'
  }
];

// Os dois identificadores do ATPBR têm exatamente 4 dígitos, incluindo os zeros
// à esquerda (0001, não 1), porque entram assim na composição do barcode.
const FORMATO_ID = /^\d{4}$/;
const AJUDA_FORMATO_ID = 'Exatamente 4 dígitos, com os zeros à esquerda: 0001, não 1.';

/* ====== Elementos ====== */
const form = document.getElementById('form');
const resultado = document.getElementById('resultado');
const selecaoContainer = document.getElementById('selecao-container');
const camposContainer = document.getElementById('campos-container');
const contadorSelecao = document.getElementById('contador-selecao');
const grupoIdentificadores = document.getElementById('grupo-identificadores');
const identificadoresContainer = document.getElementById('identificadores-container');
const camposIntro = document.getElementById('campos-intro');
const btnConverter = document.getElementById('btn-converter');

/* ====== Estado ======
   Só em memória: a seleção e o texto colado vivem nestas duas variáveis e
   desaparecem com a aba. Nada é persistido. */
const selecionadas = new Set();
const valores = {}; // chave do campo -> texto colado, preservado ao remarcar variáveis

/* ====== Datas ======
   As datas são tratadas como dias de calendário em UTC, para que o
   fuso horário do navegador nunca desloque a contagem em 1 dia.    */
const MS_DIA = 86400000;

// Aceita AAAA-MM-DD e DD/MM/AAAA ou DD-MM-AAAA.
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

const slug = (t) => String(t)
  .toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '');

const plural = (n, um, muitos) => `${n} ${n === 1 ? um : muitos}`;

/* ====== Catálogo de campos de data ======
   Cada ponta de cada variável aponta para um campo. Marcos são
   compartilhados entre variáveis; datas de evento com o mesmo rótulo
   também são, para que o usuário cole cada coluna uma única vez.      */
const chaveDe = (spec) => (spec.marco ? `ref:${spec.marco}` : `ev:${slug(spec.label)}`);

const CAMPOS = new Map();

const registrarCampos = () => {
  // Marcos primeiro, na ordem declarada, para que apareçam no topo da etapa 2.
  Object.keys(MARCOS).forEach((k) => {
    CAMPOS.set(`ref:${k}`, {
      chave: `ref:${k}`,
      tipo: 'referencia',
      titulo: MARCOS[k].titulo,
      descricao: MARCOS[k].descricao,
      dia0: !!MARCOS[k].dia0,
      usadoPor: []
    });
  });

  VARIAVEIS.forEach((v) => {
    ['de', 'para'].forEach((ponta) => {
      const spec = v[ponta];
      const chave = chaveDe(spec);
      if (!CAMPOS.has(chave)) {
        CAMPOS.set(chave, {
          chave,
          tipo: 'evento',
          titulo: spec.label,
          descricao: '',
          dia0: false,
          usadoPor: []
        });
      }
      const campo = CAMPOS.get(chave);
      if (!campo.usadoPor.includes(v.nome)) campo.usadoPor.push(v.nome);
    });
  });
};

const variaveisSelecionadas = () => VARIAVEIS.filter((v) => selecionadas.has(v.nome));

// Campos exigidos pela seleção atual, marcos antes das datas de evento.
const camposNecessarios = () => {
  const nomes = new Set(selecionadas);
  const lista = [];
  CAMPOS.forEach((campo) => {
    const usados = campo.usadoPor.filter((n) => nomes.has(n));
    if (usados.length) lista.push({ ...campo, usadoPor: usados });
  });
  return lista.sort((a, b) => (a.tipo === b.tipo ? 0 : a.tipo === 'referencia' ? -1 : 1));
};

/* ====== Etapa 1: checkboxes das variáveis ====== */
const papelDoCampo = (v, campoChave) => {
  const ehDe = chaveDe(v.de) === campoChave;
  const ehPara = chaveDe(v.para) === campoChave;
  if (ehDe && ehPara) return 'início e fim da contagem';
  if (ehDe) return 'início da contagem';
  if (ehPara) return 'fim da contagem';
  return '';
};

const textoMarco = (spec) => (spec.marco ? MARCOS[spec.marco].label : spec.label.toLowerCase());

const montarSelecao = () => {
  let html = '';
  let categoriaAtual = null;

  VARIAVEIS.forEach((v) => {
    const cat = `${v.modulo} · ${v.categoria}`;
    if (cat !== categoriaAtual) {
      if (categoriaAtual !== null) html += '</div>';
      html += `<p class="grupo-categoria">${escapar(cat)}</p><div class="grupo-vars">`;
      categoriaAtual = cat;
    }

    const badge = v.obrigatoria
      ? '<span class="badge badge-obrigatoria">obrigatória</span>'
      : '<span class="badge badge-opcional">opcional</span>';

    // O input fica aninhado no label e o label não leva "for": o aninhamento já
    // associa os dois, e a combinação dos dois dispara o toggle duas vezes em
    // alguns navegadores, deixando a caixa como estava.
    html += `
      <label class="check-option">
        <input type="checkbox" id="chk-${v.nome}" value="${v.nome}" data-checkvar>
        <span class="check-texto">
          <span class="var-nome">${v.nome} ${badge}</span>
          <span class="var-desc">${escapar(v.descricao)}</span>
          <span class="var-marco">Contagem: de <strong>${escapar(textoMarco(v.de))}</strong>
            até <strong>${escapar(textoMarco(v.para))}</strong>.</span>
        </span>
      </label>`;
  });

  if (categoriaAtual !== null) html += '</div>';
  selecaoContainer.innerHTML = html;
};

/* ====== Leitura das colunas coladas ======
   Linhas em branco no meio são preservadas, porque elas alinham as colunas:
   a linha 3 de um campo é o mesmo registro que a linha 3 de outro.        */
const linhasDe = (texto) => {
  const arr = String(texto || '').replace(/\r/g, '').split('\n').map((t) => t.trim());
  while (arr.length && arr[arr.length - 1] === '') arr.pop();
  return arr;
};

/* ====== Etapa 2: identificadores ====== */
const idTextareaIdent = (chave) => `ident-${chave}`;

const montarIdentificadores = () => {
  identificadoresContainer.innerHTML = IDENTIFICADORES.map((id) => `
    <div class="campo-item campo-item-ident">
      <label for="${idTextareaIdent(id.chave)}">
        ${escapar(id.titulo)} <code>${id.chave}</code>
      </label>
      <span class="hint">${escapar(id.hint)} <strong>${escapar(AJUDA_FORMATO_ID)}</strong></span>
      <textarea id="${idTextareaIdent(id.chave)}" rows="4"
        placeholder="Ex: ${escapar(id.exemplo)}"></textarea>
    </div>`).join('');
};

const lerIdentificadores = () => IDENTIFICADORES.map((id) => ({
  ...id,
  linhas: linhasDe(document.getElementById(idTextareaIdent(id.chave)).value)
}));

/* ====== Etapa 2: campos de data exigidos pela seleção ====== */
const idTextarea = (chave) => `campo-${slug(chave)}`;

const montarCampos = () => {
  const necessarios = camposNecessarios();
  const total = selecionadas.size;

  contadorSelecao.textContent = total
    ? `${plural(total, 'variável selecionada', 'variáveis selecionadas')}`
    : 'nenhuma variável selecionada';

  btnConverter.disabled = total === 0;
  grupoIdentificadores.classList.toggle('oculto', total === 0);
  camposIntro.classList.toggle('oculto', total === 0);

  if (!total) {
    camposContainer.innerHTML = `
      <p class="vazio-aviso">
        👆 Marque ao menos uma variável na etapa 1. Os campos de data necessários aparecem aqui
        automaticamente, sem repetição: uma data usada por várias variáveis é pedida uma única vez.
      </p>`;
    return;
  }

  const grupos = [
    {
      tipo: 'referencia',
      titulo: '📍 Datas de referência (marcos)',
      ajuda: 'Servem de ponto de partida para as variáveis marcadas. São compartilhadas entre elas, por isso cada uma é pedida uma única vez.'
    },
    {
      tipo: 'evento',
      titulo: '📌 Datas dos eventos',
      ajuda: 'A data em que cada acontecimento clínico ocorreu. É o ponto final da contagem.'
    }
  ];

  let html = '';

  grupos.forEach((g) => {
    const doGrupo = necessarios.filter((c) => c.tipo === g.tipo);
    if (!doGrupo.length) return;

    html += `
      <div class="campos-grupo">
        <p class="campos-grupo-titulo">${g.titulo} <span class="campos-grupo-contagem">${plural(doGrupo.length, 'campo', 'campos')}</span></p>
        <p class="hint campos-grupo-ajuda">${escapar(g.ajuda)}</p>`;

    doGrupo.forEach((campo) => {
      const usos = campo.usadoPor.map((nome) => {
        const v = VARIAVEIS.find((x) => x.nome === nome);
        return `<li><code>${nome}</code> <span class="uso-papel">${escapar(papelDoCampo(v, campo.chave))}</span></li>`;
      }).join('');

      html += `
        <div class="campo-item">
          <label for="${idTextarea(campo.chave)}">
            ${escapar(campo.titulo)}
            ${campo.dia0 ? '<span class="tag-dia0">dia 0</span>' : ''}
          </label>
          ${campo.descricao ? `<span class="hint">${escapar(campo.descricao)}</span>` : ''}
          <p class="campo-usos">Necessária para ${plural(campo.usadoPor.length, 'variável', 'variáveis')}:</p>
          <ul class="campo-usos-lista">${usos}</ul>
          <textarea id="${idTextarea(campo.chave)}" data-campo="${campo.chave}" rows="5"
            placeholder="Ex: 2024-01-15&#10;2024-02-03&#10;15/03/2024"></textarea>
        </div>`;
    });

    html += '</div>';
  });

  camposContainer.innerHTML = html;

  // Devolve o que já havia sido colado, para que remarcar variáveis não apague nada.
  camposContainer.querySelectorAll('textarea[data-campo]').forEach((ta) => {
    ta.value = valores[ta.dataset.campo] || '';
  });
};

/* ====== Resultado ====== */
const mostrarErro = (msg, itens) => {
  const lista = (itens && itens.length)
    ? `<ul class="erro-lista">${itens.map((i) => `<li>${escapar(i)}</li>`).join('')}</ul>`
    : '';
  resultado.innerHTML = `<div class="alerta alerta-erro"><strong>${escapar(msg)}</strong>${lista}</div>`;
  resultado.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
};

const limparTudo = () => {
  form.querySelectorAll('textarea').forEach((el) => { el.value = ''; });
  Object.keys(valores).forEach((k) => { delete valores[k]; });
  resultado.innerHTML = '';
  window.scrollTo({ top: form.offsetTop - 40, behavior: 'smooth' });
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

/* Congela as colunas de identificação na rolagem horizontal, para não se perder
   de quem é a linha quando há muitas variáveis. O CSS sozinho não resolve: a
   segunda coluna precisa do `left` da largura real da primeira, que só existe
   depois de renderizar (e muda quando a fonte carrega ou a janela muda). */
const fixarColunasIdent = () => {
  const ths = [...resultado.querySelectorAll('thead th.col-ident')];
  if (!ths.length) return;

  let acumulado = 0;
  const offsets = ths.map((th) => {
    const inicio = acumulado;
    acumulado += th.getBoundingClientRect().width;
    return inicio;
  });

  const aplicar = (celula, i) => {
    if (!celula) return;
    celula.style.left = `${offsets[i]}px`;
    celula.classList.toggle('ident-limite', i === offsets.length - 1);
  };

  ths.forEach(aplicar);
  resultado.querySelectorAll('tbody tr').forEach((tr) => {
    offsets.forEach((_, i) => aplicar(tr.children[i], i));
  });
};

const montarResultado = ({ titulo, cabecalhos, linhas, nota, csv, arquivo, avisos, textoCopia }) => {
  // `rotulo` vira title: com 15 colunas o nome técnico é o que cabe no cabeçalho,
  // e a descrição fica a um passar de mouse.
  const thead = `<tr>${cabecalhos.map((c) => `
    <th class="${c.ident ? 'col-ident' : ''}"${c.rotulo ? ` title="${escapar(c.rotulo)}"` : ''}>${escapar(c.titulo)}</th>`).join('')}</tr>`;

  const tbody = linhas.map((celulas) => `<tr>${
    celulas.map((c) => `<td class="${c.classe || ''}"${c.titulo ? ` title="${escapar(c.titulo)}"` : ''}>${escapar(c.texto)}</td>`).join('')
  }</tr>`).join('');

  // Poucos avisos ficam abertos, porque costumam ser o ponto principal.
  // Muitos (selecionar 15 variáveis e preencher só algumas datas gera um por
  // variável) ficam recolhidos, para não enterrarem a tabela.
  const blocoAvisos = (avisos && avisos.length)
    ? `<details class="alerta"${avisos.length <= 3 ? ' open' : ''}>
         <summary>⚠️ ${plural(avisos.length, 'ponto a conferir', 'pontos a conferir')}</summary>
         <ul>${avisos.map((a) => `<li>${escapar(a)}</li>`).join('')}</ul>
       </details>`
    : '';

  resultado.innerHTML = `
    <h3>${escapar(titulo)}</h3>

    <div class="tabela-wrapper tabela-resultado">
      <table><thead>${thead}</thead><tbody>${tbody}</tbody></table>
    </div>
    <p class="tabela-nota">${escapar(nota)}</p>

    ${blocoAvisos}

    <div class="acoes">
      <button type="button" id="btnCopiar" class="btn btn-primario">📋 Copiar para planilha</button>
      <button type="button" id="btnCsv" class="btn btn-secundario">📥 Baixar CSV</button>
      <button type="button" id="btnLimpar" class="btn btn-fantasma">🧹 Limpar campos</button>
    </div>

    <p class="aviso-copiar">
      Estes valores <strong>não foram salvos em nenhum lugar</strong>. Copie ou baixe agora:
      ao recarregar ou fechar a aba, o resultado é perdido.
    </p>`;

  document.getElementById('btnCopiar').addEventListener('click', (ev) => {
    const botao = ev.currentTarget;
    const original = botao.textContent;
    const marcarCopiado = () => {
      botao.textContent = '✅ Copiado';
      botao.classList.add('btn-copiado');
      setTimeout(() => { botao.textContent = original; botao.classList.remove('btn-copiado'); }, 2000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textoCopia).then(marcarCopiado, () => copiarFallback(textoCopia, marcarCopiado));
    } else {
      copiarFallback(textoCopia, marcarCopiado);
    }
  });

  document.getElementById('btnCsv').addEventListener('click', () => {
    // BOM para o Excel reconhecer os acentos.
    const blob = new Blob(['\ufeff' + csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = arquivo;
    link.click();
    URL.revokeObjectURL(link.href);
  });

  document.getElementById('btnLimpar').addEventListener('click', limparTudo);

  fixarColunasIdent();
  // A fonte é carregada de fora e muda a largura das colunas; refaz quando chegar.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fixarColunasIdent);

  resultado.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
};

/* ====== Conversão ====== */
const converter = () => {
  const vars = variaveisSelecionadas();
  if (!vars.length) {
    return mostrarErro('⚠️ Marque na etapa 1 pelo menos uma variável que você quer converter.');
  }

  const necessarios = camposNecessarios();

  // 1. Lê as colunas.
  const colunas = {};
  necessarios.forEach((c) => { colunas[c.chave] = linhasDe(valores[c.chave]); });
  const identificadores = lerIdentificadores();
  const idsUsados = identificadores.filter((id) => id.linhas.length);

  const preenchidos = necessarios.filter((c) => colunas[c.chave].length);
  if (!preenchidos.length) {
    return mostrarErro('⚠️ Cole as datas na etapa 2. Nenhum campo foi preenchido.');
  }

  // 2. Define quantas linhas (registros) existem: a coluna mais longa manda.
  //    Não há replicação de uma data para todas as linhas, porque com várias
  //    colunas isso espalharia silenciosamente a data de um registro nos outros.
  const totalLinhas = Math.max(...preenchidos.map((c) => colunas[c.chave].length), ...idsUsados.map((id) => id.linhas.length), 0);

  // Colunas mais curtas não travam a conversão, apenas deixam as últimas linhas
  // sem aquela data. Mesmo assim vale avisar, porque quase sempre é uma colagem
  // incompleta e não uma ausência real.
  const avisos = preenchidos
    .filter((c) => colunas[c.chave].length < totalLinhas)
    .map((c) => `"${c.titulo}" tem ${plural(colunas[c.chave].length, 'linha', 'linhas')} e o lote tem ${totalLinhas}: as linhas ${colunas[c.chave].length + 1} em diante ficaram sem essa data. Confira se a colagem veio completa.`);

  idsUsados
    .filter((id) => id.linhas.length < totalLinhas)
    .forEach((id) => {
      avisos.push(`"${id.titulo}" (${id.chave}) tem ${plural(id.linhas.length, 'linha', 'linhas')} e o lote tem ${totalLinhas}: as linhas seguintes ficaram sem esse código.`);
    });

  const valorNa = (chave, i) => (colunas[chave] || [])[i] || '';

  // 3. Valida todo texto não vazio antes de converter, para que um erro de
  //    digitação nunca passe como célula em branco nem como código truncado.
  const erros = [];

  idsUsados.forEach((id) => {
    id.linhas.forEach((texto, i) => {
      if (texto && !FORMATO_ID.test(texto)) {
        erros.push(`"${id.titulo}" (${id.chave}), linha ${i + 1}: "${texto}" não é um código válido. ${AJUDA_FORMATO_ID}`);
      }
    });
  });

  necessarios.forEach((c) => {
    (colunas[c.chave] || []).forEach((texto, i) => {
      if (texto && parseData(texto) === null) {
        erros.push(`"${c.titulo}", linha ${i + 1}: "${texto}" não é uma data válida (use AAAA-MM-DD ou DD/MM/AAAA).`);
      }
    });
  });

  if (erros.length) {
    const amostra = erros.slice(0, 12);
    if (erros.length > amostra.length) amostra.push(`... e mais ${erros.length - amostra.length}.`);
    return mostrarErro('⚠️ Corrija os pontos abaixo antes de converter. Nada foi calculado:', amostra);
  }

  // 4. Calcula.
  const linhas = [];
  // Sem nenhum identificador preenchido, o resultado ainda precisa de uma âncora
  // por linha: o número do registro no lote.
  const colunasId = idsUsados.length
    ? idsUsados.map((id) => ({ titulo: id.chave, rotulo: id.titulo, valorNa: (i) => id.linhas[i] || '' }))
    : [{ titulo: 'linha', rotulo: 'Número da linha no lote', valorNa: (i) => String(i + 1) }];

  const nomesColunas = [...colunasId.map((c) => c.titulo), ...vars.map((v) => v.nome)];
  const csv = [nomesColunas.join(';')];
  const textos = [nomesColunas.join('\t')];
  const contagem = {};
  vars.forEach((v) => { contagem[v.nome] = 0; });

  for (let i = 0; i < totalLinhas; i++) {
    const valoresId = colunasId.map((c) => c.valorNa(i));
    // Como os identificadores são opcionais, a linha é citada nos avisos pelo
    // código que existir e, na falta dos dois, pelo número da linha.
    const identificador = valoresId.filter((v) => v).join(' / ') || `linha ${i + 1}`;
    const celulas = valoresId.map((v) => ({
      texto: v || '—',
      classe: v ? 'ident' : 'ident vazio'
    }));
    const valoresCsv = [];

    vars.forEach((v) => {
      const de = parseData(valorNa(chaveDe(v.de), i));
      const para = parseData(valorNa(chaveDe(v.para), i));

      if (de === null || para === null) {
        const faltando = [];
        if (de === null) faltando.push(CAMPOS.get(chaveDe(v.de)).titulo);
        if (para === null) faltando.push(CAMPOS.get(chaveDe(v.para)).titulo);
        celulas.push({
          texto: '—',
          classe: 'dias vazio',
          titulo: `Sem valor: falta ${faltando.join(' e ')} na linha ${i + 1}.`
        });
        valoresCsv.push('');
        return;
      }

      const dias = diffDias(de, para);
      contagem[v.nome]++;

      if (dias < 0) {
        avisos.push(
          `Linha ${i + 1} (${identificador}) · ${v.nome} = ${dias} dias: a ${textoMarco(v.para)} é anterior à ${textoMarco(v.de)}.` +
          (v.minZero ? ' Esta variável não admite valor negativo, verifique as datas.' : ' Confirme se está correto.')
        );
      }

      celulas.push({
        texto: String(dias),
        classe: dias < 0 ? 'dias negativo' : 'dias',
        titulo: v.mostrarAnos ? `≈ ${emAnos(dias)} anos` : ''
      });
      valoresCsv.push(String(dias));
    });

    linhas.push(celulas);
    csv.push([...valoresId, ...valoresCsv].join(';'));
    textos.push([...valoresId, ...valoresCsv].join('\t'));
  }

  // 5. Avisa sobre variáveis que ficaram sem nenhum valor.
  vars.forEach((v) => {
    if (contagem[v.nome] === 0) {
      avisos.push(`${v.nome}: nenhuma linha pôde ser calculada, faltam as datas de "${CAMPOS.get(chaveDe(v.de)).titulo}" e/ou "${CAMPOS.get(chaveDe(v.para)).titulo}".`);
    }
  });

  montarResultado({
    titulo: 'Valores em dias para o ATPBR',
    cabecalhos: [
      ...colunasId.map((c) => ({ titulo: c.titulo, rotulo: c.rotulo, ident: true })),
      ...vars.map((v) => ({ titulo: v.nome, rotulo: v.descricao }))
    ],
    linhas,
    nota: 'O traço (—) marca a célula em que faltou uma das datas daquela linha. Passe o mouse sobre a célula para ver qual data falta, e sobre o nome da coluna para ver a descrição da variável.',
    csv,
    arquivo: 'dias_convertidos_ATPBR.csv',
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
      <td>${escapar(textoMarco(v.de))}</td>
      <td>${escapar(textoMarco(v.para))}</td>
    </tr>`).join('');
};

/* ====== Inicialização ====== */
registrarCampos();
montarSelecao();
montarIdentificadores();
montarTabelaReferencia();
montarCampos();

// Marcar/desmarcar variável: refaz a etapa 2 preservando o que já foi colado.
selecaoContainer.addEventListener('change', (e) => {
  if (!e.target.matches('[data-checkvar]')) return;
  if (e.target.checked) selecionadas.add(e.target.value); else selecionadas.delete(e.target.value);
  montarCampos();
  resultado.innerHTML = '';
});

// Atalhos de seleção.
document.querySelectorAll('[data-selecionar]').forEach((botao) => {
  botao.addEventListener('click', () => {
    const modo = botao.dataset.selecionar;
    selecionadas.clear();
    if (modo === 'todas') VARIAVEIS.forEach((v) => selecionadas.add(v.nome));
    if (modo === 'obrigatorias') VARIAVEIS.filter((v) => v.obrigatoria).forEach((v) => selecionadas.add(v.nome));
    selecaoContainer.querySelectorAll('[data-checkvar]').forEach((chk) => {
      chk.checked = selecionadas.has(chk.value);
    });
    montarCampos();
    resultado.innerHTML = '';
  });
});

// Guarda o texto colado em memória, para sobreviver à remontagem da etapa 2.
camposContainer.addEventListener('input', (e) => {
  if (e.target.dataset.campo) valores[e.target.dataset.campo] = e.target.value;
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  converter();
});

window.addEventListener('resize', fixarColunasIdent);
