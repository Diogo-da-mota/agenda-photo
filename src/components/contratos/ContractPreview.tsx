import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, MapPin, User, Phone, Mail, FileText, DollarSign, Paperclip } from "lucide-react";
import { sanitizeHtml } from "@/utils/sanitize";
import { useEmpresa } from "@/hooks/useEmpresa";

interface ContractPreviewData {
  clientName?: string;
  clientEmail?: string;
  phoneNumber?: string;
  eventType?: string;
  eventDate?: Date;
  eventLocation?: string;
  price?: number;
  downPayment?: number;
  termsAndConditions?: string;
  cpfCliente?: string;
  enderecoCliente?: string;
  eventTime?: string;
}

interface ContractPreviewProps {
  contractData: ContractPreviewData;
  className?: string;
}

const ContractPreview = ({ contractData, className }: ContractPreviewProps) => {
  const { configuracoes: empresa } = useEmpresa();

  const statusOptions = {
    draft: { label: "Rascunho", color: "bg-gray-500" },
    pending: { label: "Pendente", color: "bg-yellow-500" },
    signed: { label: "Assinado", color: "bg-green-500" },
    cancelled: { label: "Cancelado", color: "bg-red-500" }
  };

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Contract Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Contrato de Serviços Fotográficos</h2>
              <p className="text-muted-foreground">
                Gerado em {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            <Badge className={`${statusOptions.draft.color} text-white`}>
              {statusOptions.draft.label}
            </Badge>
          </div>

          <Separator className="my-4" />

          {/* Company Info */}
          {empresa && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Dados da Empresa
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Nome:</strong> {empresa.nome_empresa}</p>
                  <p><strong>E-mail:</strong> {empresa.email_empresa}</p>
                </div>
                <div>
                  <p><strong>Telefone:</strong> {empresa.telefone}</p>
                  <p><strong>CNPJ:</strong> {empresa.cnpj}</p>
                </div>
              </div>
            </div>
          )}

          {/* Client Info */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Dados do Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Nome:</strong> {contractData.clientName}</p>
                <p><strong>E-mail:</strong> {contractData.clientEmail}</p>
                <p><strong>Telefone:</strong> {contractData.phoneNumber}</p>
              </div>
              <div>
                {contractData.cpfCliente && (
                  <p><strong>CPF:</strong> {contractData.cpfCliente}</p>
                )}
                {contractData.enderecoCliente && (
                  <p><strong>Endereço:</strong> {contractData.enderecoCliente}</p>
                )}
              </div>
            </div>
          </div>

          {/* Event Info */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Dados do Evento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Tipo:</strong> {contractData.eventType}</p>
                <p><strong>Data:</strong> {format(contractData.eventDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                {contractData.eventTime && (
                  <p><strong>Horário:</strong> {contractData.eventTime}</p>
                )}
              </div>
              <div>
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Local:</strong> {contractData.eventLocation}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Financial Info */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Informações Financeiras
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p><strong>Valor Total:</strong></p>
                <p className="text-lg font-bold text-green-600">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(contractData.price)}
                </p>
              </div>
              <div>
                <p><strong>Entrada:</strong></p>
                <p className="text-lg font-semibold">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(contractData.downPayment)}
                </p>
              </div>
              <div>
                <p><strong>Restante:</strong></p>
                <p className="text-lg font-semibold">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(contractData.price - contractData.downPayment)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Content */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Termos e Condições</h3>
          <div 
            className="prose prose-sm max-w-none border rounded-lg p-4 bg-muted/20 max-h-96 overflow-y-auto"
            dangerouslySetInnerHTML={{ 
              __html: sanitizeHtml(contractData.termsAndConditions) 
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractPreview;