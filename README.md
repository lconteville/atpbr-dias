# Conversor de Datas em Dias ATPBR

Esta aplicação web tem o objetivo de **converter datas em número de dias** conforme o padrão de dados
temporais do **Atlas Tumoral da População Brasileira (ATPBR)**.

O ATPBR **não coleta datas** relacionadas ao paciente ou à amostra. Datas civis são identificadores
indiretos e, combinadas entre si ou com sexo, município e tipo de neoplasia, permitem **reidentificar**
um paciente. Por isso todo evento temporal é registrado como **número de dias decorridos em relação a um
marco**, preservando a informação clínica (sobrevida, tempo até tratamento, tempo livre de progressão)
sem revelar quando os eventos aconteceram no calendário.

Marcos usados na plataforma:

- **Diagnóstico** (primeiro exame que concluiu a malignidade) = **dia 0**, marco das variáveis `days_to_*`
- **Nascimento**, marco das variáveis de idade (`diagnosis_age_in_days`, `age_at_*`)
- **Início do tratamento**, marco de `disease_free_days`, `recurrence_free_days` e `progression_free_days`

## Privacidade

A página é **totalmente local**: não faz requisição de rede, não usa cookie, `localStorage` ou
`sessionStorage`. **Nenhuma data digitada e nenhum resultado calculado é armazenado ou transmitido.**
A ferramenta apenas faz a conversão, e é **responsabilidade do usuário copiar os resultados** (botão de
copiar ou download do TSV) antes de recarregar ou fechar a aba.

## Como funciona

A conversão é sempre **em lote**, em duas etapas:

1. **Escolha as variáveis.** Uma lista de checkbox com as 15 variáveis do ATPBR que esperam número de
   dias, agrupadas por módulo e categoria, com a obrigatoriedade de cada uma. Há atalhos para marcar
   só as obrigatórias, marcar todas ou limpar a seleção.
2. **Informe as datas.** Conforme as variáveis são marcadas, a etapa 2 monta automaticamente os campos
   de data necessários, separados em **datas de referência (marcos)** e **datas dos eventos**. Cada
   campo mostra quais variáveis dependem dele e se é o início ou o fim da contagem. Uma data usada por
   várias variáveis é pedida uma única vez (a data do diagnóstico, por exemplo, alimenta todas as
   `days_to_*`). Desmarcar e remarcar uma variável não apaga o que já foi colado.

Cada campo recebe **uma data por linha**, em `AAAA-MM-DD` ou `DD/MM/AAAA`, e a ordem das linhas alinha
as colunas: a linha 1 de cada campo é o mesmo paciente ou a mesma amostra. Linhas em branco são
permitidas, e a variável que dependia daquela data fica sem valor (`—`) só naquela linha. Não há
replicação de uma data para todas as linhas, justamente para não espalhar silenciosamente a data de um
registro nos demais; uma coluna mais curta que o lote gera um aviso.

## Identificadores

A etapa 2 abre com dois campos opcionais e independentes, `patient_id` e `sample_id`, cada um com sua
própria caixa. Os nomes são os mesmos atributos da plataforma, então a coluna sai pronta para colar no
cadastro. Preencha um, o outro, ou os dois: as colunas do resultado acompanham o que foi preenchido, e
sem nenhum dos dois o resultado ganha uma coluna `linha` com o número do registro no lote.

Os dois juntos são o caso de um paciente com mais de uma amostra, em que `patient_id` repete e
`sample_id` distingue as linhas. Definidos em `script.js` na constante `IDENTIFICADORES`.

Os dois aceitam **exatamente 4 dígitos, com os zeros à esquerda** (`0001`, não `1`), que é o formato
com que entram na composição do barcode. Um código fora desse formato **bloqueia a conversão** e é
listado, junto das datas inválidas: melhor parar do que gerar uma planilha com código truncado,
que vai bater no cadastro errado. A regra está em `FORMATO_ID`.

## A tela de resultados

Uma tabela com uma linha por registro e uma coluna por variável selecionada, pronta para copiar
(separada por tabulação, para colar direto em planilha) ou baixar em TSV (o mesmo conteúdo, com BOM
para o Excel ler os acentos). Detalhes que importam quando o lote é grande:

- **Uma fonte só na tabela**, a da página, com `tabular-nums` para os dígitos continuarem alinhados
  na coluna. A tabela de referência no fim da página segue com a coluna `Variável` em monoespaçada,
  onde ela ajuda a separar nome técnico de descrição.
- **Cabeçalho fixo** na rolagem vertical e **colunas de identificação congeladas** na rolagem
  horizontal, para não se perder de quem é a linha com 15 variáveis selecionadas. Os deslocamentos das
  colunas congeladas são calculados em `fixarColunasIdent()`, porque dependem da largura real
  renderizada.
- **Tooltips**: no nome da coluna, a descrição da variável; na célula com traço, qual data faltou.
- **Avisos** em bloco recolhível, aberto quando são poucos e fechado quando são muitos, para não
  enterrarem a tabela.

As cores seguem a paleta do frontend do ATPBR (`atpbr-front`, tema `ocean`: primária `#4a6898`,
secundária `#6dc8a9`), declaradas como variáveis CSS no topo de `style.css`.

## Validações

- Texto que não é uma data válida (`31/02/2024`, por exemplo) **bloqueia a conversão** e é listado, para
  que um erro de digitação nunca passe como célula em branco.
- Data posterior a **2040** também bloqueia: a data existe no calendário, mas está fora do comum para
  um evento já registrado (em geral é `2204` no lugar de `2024`), então a ferramenta para e pede
  conferência em vez de calcular. O limite está em `ANO_MAXIMO`.
- Valores negativos são calculados e exibidos, mas sempre acompanhados de aviso, porque indicam evento
  anterior ao marco. Nas variáveis de idade e de duração, que não admitem negativo, o aviso é explícito.

## Variáveis contempladas

As 15 variáveis do ATPBR que esperam número de dias:

| Variável | Módulo | Obrigatoriedade |
| --- | --- | --- |
| `diagnosis_age_in_days` | Paciente | Obrigatória |
| `age_at_menarche` | Paciente | Opcional |
| `age_at_sexarche` | Paciente | Opcional |
| `age_at_last_menstruation` | Paciente | Opcional |
| `age_at_menopausal` | Paciente | Opcional |
| `duration_of_hormonal_contraceptive` | Paciente | Opcional |
| `days_to_treatment_or_therapy` | Amostra | Obrigatória |
| `days_to_last_follow_up` | Amostra | Obrigatória |
| `disease_free_days` | Amostra | Obrigatória |
| `days_to_lost_to_followup` | Amostra | Opcional |
| `days_to_sample` | Amostra | Opcional |
| `days_to_consent` | Amostra | Opcional |
| `days_to_best_overall_response` | Amostra | Opcional |
| `recurrence_free_days` | Amostra | Opcional |
| `progression_free_days` | Amostra | Opcional |

A lista é definida em `script.js` (constante `VARIAVEIS`) e reflete as especificações em
`fairdom-seek/db/seeds/ATPBR_variaveis/EN/05_patients.tsv` e `06_samples.tsv`. Cada variável declara as
duas pontas da contagem (`de` e `para`); uma ponta é um marco compartilhado (`{ marco: 'diagnostico' }`)
ou uma data própria da variável (`{ label: 'Data da coleta da amostra' }`). Os campos da etapa 2 são
derivados dessas declarações, então **acrescentar uma variável à constante é suficiente**: o checkbox, os
campos de data e a coluna do resultado aparecem sozinhos.

## Como usar

Abra o `index.html` no navegador. Não há build, dependência ou servidor.

```bash
xdg-open index.html
```

Publicado por GitHub Pages em <https://lconteville.github.io/atpbr-dias/>: um `git push` na `main`
atualiza o site.

## Ao alterar `script.js` ou `style.css`, incremente o `?v=`

O `index.html` referencia os dois arquivos como `style.css?v=2` e `script.js?v=2`. Sem esse parâmetro,
o navegador de quem já visitou o site reusa a versão em cache: se o HTML novo chega e o JS antigo fica,
o script procura elementos que deixaram de existir, lança exceção e a página para de montar no meio,
com os títulos visíveis e nenhum campo. **Incremente o número nas duas referências sempre que mexer no
conteúdo desses arquivos**, porque só a URL mudando é que o navegador busca de novo. Enquanto a mudança
não é publicada, `Ctrl+Shift+R` força o recarregamento sem cache.

## Contato

Dúvidas ou sugestões: **lilianeconteville@gmail.com**
