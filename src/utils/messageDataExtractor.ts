
/**
 * Extracts structured data from message content
 * @param message Raw message string
 * @returns Object with extracted data fields
 */
export const extractMessageData = (message: string): Record<string, string | null> => {
  const data: Record<string, string | null> = {};
  
  // Extract event type
  const eventoMatch = message.match(/Qual o tipo de evento que você mais fotografa atualmente\?:\s*(.*?)(?:\n|$)/);
  if (eventoMatch) data.evento = eventoMatch[1];
  
  // Extract agenda usage
  const agendaMatch = message.match(/Você utiliza uma agenda online para organizar seus compromissos\?:\s*(.*?)(?:\n|$)/);
  if (agendaMatch) {
    data.usaAgenda = agendaMatch[1];
    
    // Get agenda details if user uses one
    if (data.usaAgenda === "Sim") {
      const qualAgendaMatch = message.match(/Qual agenda online você usa\?:\s*(.*?)(?:;|\n|$)/);
      if (qualAgendaMatch) data.usaAgenda = `Sim, ${qualAgendaMatch[1]}`;
      
      const gostaMatch = message.match(/O que você mais gosta na agenda que usa\?:\s*(.*?)(?:;|\n|$)/);
      if (gostaMatch) data.gosta = gostaMatch[1];
      
      const naoGostaMatch = message.match(/O que você não gosta na agenda que usa\?:\s*(.*?)(?:;|\n|$)/);
      if (naoGostaMatch) data.naoGosta = naoGostaMatch[1];
      
      const valorMatch = message.match(/Quanto você paga por mês por essa ferramenta\?:\s*(R\$\s*[\d.,]+)/);
      if (valorMatch) data.valorMes = valorMatch[1];
    }
  }
  
  // Extract portfolio info
  const portfolioMatch = message.match(/Você tem um portfólio online em uma plataforma de terceiros\?:\s*(.*?)(?:\n|$)/);
  if (portfolioMatch) data.portfolio = portfolioMatch[1];
  
  // Extract other tools info
  const toolsMatch = message.match(/Além da agenda e do site, você usa outros aplicativos ou ferramentas online pagas para o seu trabalho\?:\s*(.*?)(?:\n|$)/);
  if (toolsMatch) data.outrasFerramentas = toolsMatch[1];
  
  // Extract ideal site description
  const siteIdealMatch = message.match(/Se você pudesse ter um único site que integrasse todas as ferramentas.*?:\s*(.*?)(?:\n|$)/s);
  if (siteIdealMatch) data.siteIdeal = siteIdealMatch[1].substring(0, 100) + (siteIdealMatch[1].length > 100 ? "..." : "");
  
  // Extract suggested value
  const valorSugeridoMatch = message.match(/Valor sugerido para a solução:\s*(R\$\s*[\d.,]+)/);
  if (valorSugeridoMatch) data.valorSugerido = valorSugeridoMatch[1];
  
  return data;
};
