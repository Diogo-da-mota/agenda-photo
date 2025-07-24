| column_name         | data_type                | is_nullable | column_default    |
| ------------------- | ------------------------ | ----------- | ----------------- |
| id                  | uuid                     | NO          | gen_random_uuid() |
| user_id             | uuid                     | NO          | null              |
| cliente_id          | uuid                     | YES         | null              |
| titulo              | text                     | NO          | null              |
| descricao           | text                     | YES         | null              |
| data_inicio         | timestamp with time zone | NO          | null              |
| data_fim            | timestamp with time zone | NO          | null              |
| local               | text                     | YES         | null              |
| tipo                | text                     | YES         | null              |
| cor                 | text                     | YES         | null              |
| status              | text                     | YES         | 'agendado'::text  |
| notificacao_enviada | boolean                  | YES         | false             |
| criado_em           | timestamp with time zone | YES         | now()             |
| atualizado_em       | timestamp with time zone | YES         | now()             |
| telefone            | text                     | YES         | null              |
| valor_total         | numeric                  | YES         | null              |
| valor_entrada       | numeric                  | YES         | null              |
| valor_restante      | numeric                  | YES         | null              |
| observacoes         | text                     | YES         | null              |


| column_name     | data_type                | is_nullable | column_default     |
| --------------- | ------------------------ | ----------- | ------------------ |
| id              | uuid                     | NO          | uuid_generate_v4() |
| nome            | text                     | NO          | null               |
| telefone        | text                     | YES         | null               |
| user_id         | uuid                     | NO          | null               |
| evento          | text                     | YES         | null               |
| data_evento     | timestamp with time zone | YES         | null               |
| data_nascimento | date                     | YES         | null               |
| valor_evento    | numeric                  | YES         | null               |
| email           | text                     | YES         | null               |
| ativo           | boolean                  | YES         | true               |


| total_eventos | eventos_com_cliente_id | eventos_sem_cliente_id |
| ------------- | ---------------------- | ---------------------- |
| 9             | 1                      | 8                      |

| evento_id                            | nome_evento              | cliente_id                           | cliente_real_id                      | nome_cliente             |
| ------------------------------------ | ------------------------ | ------------------------------------ | ------------------------------------ | ------------------------ |
| a0e871a9-9ba5-4b3e-a310-7c925a0e87fe | 99 Talytta Schulze Neves | 0db837da-2334-4815-8aea-1ce9e36d26fd | 0db837da-2334-4815-8aea-1ce9e36d26fd | 99 Talytta Schulze Neves |
| b4422e74-f179-4f85-8fb7-b7d9d295f061 | 22 TESTE CLOU            | null                                 | null                                 | null                     |
| 0256b32e-0bc8-4dac-8369-769dcd9a058d | 1 Talytta Schulze Neves  | null                                 | null                                 | null                     |
| 15c86a75-565e-4f9d-92f3-517a9abba63d | 8 Diogo G Mota           | null                                 | null                                 | null                     |
| f4546c02-56be-4965-9ecd-eeec51f30fc5 | 7 ISONEIDE               | null                                 | null                                 | null                     |
| dea44b0d-4d02-407a-be27-b81e70ee35e5 | 6 Teste Final            | null                                 | null                                 | null                     |
| f45888b7-ff98-453f-8e6d-e3f07fc3aa5d | 5 EURIPIDES              | null                                 | null                                 | null                     |
| 5b5273d2-21e2-4808-9824-5ce0aff63fa1 | 4 Agenda Pro             | null                                 | null                                 | null                     |
| 58e9dbbf-9286-4132-82c7-0dbde1fb2185 | 3 Diogo G Mota           | null                                 | null                                 | null                     |

os cliente que sao validos sao esses a baixo
| id                                   | titulo                  | telefone    | cliente_id | possivel_cliente_id                  | possivel_cliente_nome   |
| ------------------------------------ | ----------------------- | ----------- | ---------- | ------------------------------------ | ----------------------- |
| 0256b32e-0bc8-4dac-8369-769dcd9a058d | 1 Talytta Schulze Neves | 64992471909 | null       | b1f2e296-8964-4846-bed4-f9144fa33f0a | 1 Talytta Schulze Neves |
| 58e9dbbf-9286-4132-82c7-0dbde1fb2185 | 3 Diogo G Mota          | 64993296649 | null       | 15303876-9c92-4a42-8fbf-b246828dd676 | 3 Diogo G Mota          |
| 5b5273d2-21e2-4808-9824-5ce0aff63fa1 | 4 Agenda Pro            | 00000000000 | null       | 9973de4f-02e8-4908-8a8e-8fd414f96a81 | 4 Agenda Pro            |
| f45888b7-ff98-453f-8e6d-e3f07fc3aa5d | 5 EURIPIDES             | 00000000000 | null       | d73dac39-30f3-4d51-9dcf-0b6a3d7bfa7a | 5 EURIPIDES             |
| dea44b0d-4d02-407a-be27-b81e70ee35e5 | 6 Teste Final           | 00000000000 | null       | 1f3f2715-e7d2-4527-8557-1f1a103a916f | 6 Teste Final           |
| f4546c02-56be-4965-9ecd-eeec51f30fc5 | 7 ISONEIDE              | 00000000000 | null       | 17e4a3a2-83e8-4e1c-b7d3-1c2cddd5f141 | 7 ISONEIDE              |
| 15c86a75-565e-4f9d-92f3-517a9abba63d | 8 Diogo G Mota          | 00000000000 | null       | 6c747048-1193-47da-9955-bb48894df79b | 8 Diogo G Mota    

TEM NOMES DUPLICADO, MAS AS DATAS DOS EVENTOS E DIFERENTE      |

