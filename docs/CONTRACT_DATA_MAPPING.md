# Contract Data Sources Mapping

## Overview
This document maps all data sources used for contract content generation in the photography management system. It provides a comprehensive reference for understanding where each piece of data comes from and how it's used in contract templates.

## Database Tables Overview

### Primary Tables
- **agenda_eventos**: Event scheduling and details
- **clientes**: Client information
- **contratos**: Contract records
- **financeiro_transacoes**: Financial transactions
- **configuracoes_empresa**: Company/photographer settings

## Contract Data Mapping

| Placeholder | Description | Table/Source | Field/Column | API/Route | Example Value | Notes |
|-------------|-------------|--------------|--------------|-----------|---------------|-------|
| **CLIENT INFORMATION** |
| [CONTRATANTE] | Client Name | clientes | nome | /clientes | "João Silva" | Primary client name |
| [EMAIL_CLIENTE] | Client Email | clientes | email | /clientes | "joao@email.com" | Client contact email |
| [TELEFONE_CLIENTE] | Client Phone | clientes | telefone | /clientes | "(11) 99999-9999" | Client contact phone |
| [EMPRESA_CLIENTE] | Client Company | clientes | empresa | /clientes | "Silva Ltda" | Optional company name |
| **PHOTOGRAPHER/COMPANY INFORMATION** |
| [CONTRATADA] | Photographer/Studio | configuracoes_empresa | nome_empresa | /config | "Diogo Fotografia" | Business name |
| [CNPJ_FOTOGRAFO] | Photographer CNPJ | configuracoes_empresa | cnpj | /config | "12.345.678/0001-90" | Business registration |
| [EMAIL_EMPRESA] | Company Email | configuracoes_empresa | email_empresa | /config | "contato@diogofoto.com" | Business email |
| [TELEFONE_EMPRESA] | Company Phone | configuracoes_empresa | telefone_empresa | /config | "(11) 3333-4444" | Business phone |
| [ENDERECO_EMPRESA] | Company Address | configuracoes_empresa | endereco, cidade, estado, cep | /config | "Rua A, 123 - São Paulo/SP" | Full address |
| **EVENT INFORMATION** |
| [TIPO_EVENTO] | Event Type | agenda_eventos | tipo | /agenda | "Casamento" | Event category |
| [DATA_EVENTO] | Event Date | agenda_eventos | data_inicio | /agenda | "28/06/2025" | Event start date |
| [HORA_EVENTO] | Event Time | agenda_eventos | data_inicio | /agenda | "14:00" | Extracted from datetime |
| [LOCAL_EVENTO] | Event Location | agenda_eventos | local | /agenda | "Igreja São José" | Event venue |
| [TITULO_EVENTO] | Event Title | agenda_eventos | titulo | /agenda | "Casamento João e Maria" | Event description |
| [DESCRICAO_EVENTO] | Event Description | agenda_eventos | descricao | /agenda | "Cerimônia e festa" | Additional details |
| **FINANCIAL INFORMATION** |
| [VALOR_TOTAL] | Total Service Value | agenda_eventos | valor_total | /agenda | "R$ 2.500,00" | Total contract value |
| [SINAL] | Down Payment | agenda_eventos | valor_entrada | /agenda | "R$ 1.000,00" | Initial payment |
| [VALOR_RESTANTE] | Remaining Value | (calculated) | valor_total - valor_entrada | - | "R$ 1.500,00" | Calculated field |
| [FORMA_PAGAMENTO] | Payment Method | financeiro_transacoes | forma_pagamento | /financeiro | "PIX" | Payment type |
| [DATA_VENCIMENTO] | Due Date | financeiro_transacoes | data_vencimento | /financeiro | "28/06/2025" | Payment deadline |
| **CONTRACT METADATA** |
| [NUMERO_CONTRATO] | Contract Number | contratos | id | /contratos | "CONT-2025-001" | Unique identifier |
| [DATA_CONTRATO] | Contract Date | contratos | criado_em | /contratos | "15/01/2025" | Creation date |
| [STATUS_CONTRATO] | Contract Status | contratos | status | /contratos | "pendente" | Current status |
| [DATA_ASSINATURA] | Signature Date | contratos | data_assinatura | /contratos | "16/01/2025" | When signed |
| [DATA_EXPIRACAO] | Expiration Date | contratos | data_expiracao | /contratos | "30/01/2025" | Contract expiry |
| **SYSTEM INFORMATION** |
| [DATA_ATUAL] | Current Date | (system) | new Date() | - | "15/01/2025" | Generated at runtime |
| [HORA_ATUAL] | Current Time | (system) | new Date() | - | "10:30" | Generated at runtime |

## Derived Fields Logic

### Financial Calculations
- **VALOR_RESTANTE**: `valor_total - valor_entrada`
- **PERCENTUAL_SINAL**: `(valor_entrada / valor_total) * 100`
- **VALOR_FORMATADO**: Applied Brazilian currency formatting (R$ X.XXX,XX)

### Date Formatting
- **Event Dates**: Formatted as "dd/MM/yyyy" or "dd de MMMM de yyyy"
- **Times**: Extracted from datetime fields and formatted as "HH:mm"
- **System Dates**: Generated at contract creation/preview time

### Address Composition
- **Full Address**: Concatenation of `endereco + ", " + cidade + "/" + estado + " - CEP: " + cep`

## API Routes Reference

| Route | Purpose | Returns |
|-------|---------|----------|
| `/agenda` | Event data | agenda_eventos records |
| `/clientes` | Client information | clientes records |
| `/contratos` | Contract data | contratos records |
| `/financeiro` | Financial transactions | financeiro_transacoes records |
| `/config` | Company settings | configuracoes_empresa records |

## Template Usage Patterns

### Contract Preview Component
Location: `src/components/contratos/ContractPreview.tsx`
- Uses direct props mapping rather than placeholder replacement
- Formats data in real-time for preview

### Message Templates
Location: `src/services/mensagemService.ts`
- Uses placeholder replacement with `{variable_name}` syntax
- Available variables defined in `VARIAVEIS_DISPONIVEIS`

### PDF Generation
Location: `src/utils/contractPdfGenerator.ts`
- Processes contract data for PDF output
- Handles formatting and layout

## Implementation Notes

### Current State
- Contract templates in `templateData.ts` contain static content
- No dynamic placeholder replacement system currently implemented
- Contract preview uses direct data binding

### Recommended Implementation
1. Create placeholder replacement service similar to message templates
2. Define contract-specific placeholder syntax (e.g., `[PLACEHOLDER]` or `{placeholder}`)
3. Implement data fetching and replacement logic
4. Add validation for required fields

### Security Considerations
- Sanitize all user input before template replacement
- Validate data types and formats
- Implement access controls for sensitive financial data

## Future Enhancements

### Additional Placeholders
- `[OBSERVACOES_EVENTO]`: Event notes/observations
- `[DURACAO_EVENTO]`: Event duration calculation
- `[PACOTE_SERVICO]`: Service package details
- `[CLAUSULAS_ESPECIAIS]`: Custom contract clauses

### Advanced Features
- Conditional content based on event type
- Multi-language template support
- Custom field definitions per user
- Template versioning and history

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Maintainer**: Development Team