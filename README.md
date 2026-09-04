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
- **Nascimento**, marco das variáveis de idade (`diagnosis_age`, `age_at_*`)
- **Início do tratamento**, marco de `disease_free_days`, `recurrence_free_days` e `progression_free_days`

## Privacidade

A página é **totalmente local**: não faz requisição de rede, não usa cookie, `localStorage` ou
`sessionStorage`. **Nenhuma data digitada e nenhum resultado calculado é armazenado ou transmitido.**
A ferramenta apenas faz a conversão, e é **responsabilidade do usuário copiar os resultados** (botão de
copiar ou download do CSV) antes de recarregar ou fechar a aba.

## Modos de conversão

1. **Por variável do ATPBR** - preencha os marcos e as datas dos eventos; cada variável é calculada com o
   nome exato do campo da plataforma.
2. **Em lote** - cole uma coluna de datas de referência e uma de datas de evento para converter muitos
   pacientes ou amostras de uma vez. Aceita `AAAA-MM-DD` e `DD/MM/AAAA`.

## Variáveis contempladas

As 15 variáveis do ATPBR que esperam número de dias:

| Variável | Módulo | Obrigatoriedade |
| --- | --- | --- |
| `diagnosis_age` | Paciente | Obrigatória |
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
`fairdom-seek/db/seeds/ATPBR_variaveis/EN/05_patients.tsv` e `06_samples.tsv`.

## Como usar

Abra o `index.html` no navegador. Não há build, dependência ou servidor.

```bash
xdg-open index.html
```

## Contato

Dúvidas ou sugestões: **lilianeconteville@gmail.com**
