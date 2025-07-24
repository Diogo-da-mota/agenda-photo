// Agenda service functions

export const buscarContagemProximosEventos = async (userId: string): Promise<number> => {
  return 0;
};

export const buscarTotalEventosCriados = async (userId: string): Promise<number> => {
  return 0;
};

export const buscarTotalClientes = async (userId: string): Promise<number> => {
  return 0;
};

export const buscarPagamentosMesAtual = async (userId: string): Promise<number> => {
  return 0;
};

export const buscarFaturamentoMesAtual = async (userId: string): Promise<number> => {
  return 0;
};

export const buscarReceitaTotalAnoAtual = async (userId: string): Promise<number> => {
  return 0;
};

export const registrarCallbackAtualizacaoFinanceiro = (callback: (userId: string) => void): void => {
  // Callback registration placeholder
};

export const buscarEventosComValoresEntradas = async (userId: string): Promise<any[]> => {
  return [];
};

export const buscarEventosComValoresRestantes = async (userId: string): Promise<any[]> => {
  return [];
};

export const agendaService = {
  getEvents: () => Promise.resolve([]),
  createEvent: () => Promise.resolve({}),
  updateEvent: () => Promise.resolve({}),
  deleteEvent: () => Promise.resolve({}),
};

export default agendaService;