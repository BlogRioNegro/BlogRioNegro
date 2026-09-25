// Datas do painel no fuso de Brasília (spec 05, UI · Estrutura): publicação em dd/mm/aaaa.
const dateFormat = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso))
}
