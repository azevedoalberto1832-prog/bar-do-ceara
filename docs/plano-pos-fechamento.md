# Plano pós-fechamento — Bar do Ceará

## Situação atual

A versão `demo-pdv` está preparada para demonstração offline em um único computador. Os dados ficam no armazenamento do navegador usado na apresentação. Não publicar nem iniciar custos de infraestrutura antes da confirmação do cliente.

## Gatilho para retomada

Retomar este plano quando o cliente confirmar a contratação e definir:

- computador que será usado no estabelecimento;
- quantidade de usuários e dispositivos;
- necessidade de acesso fora do bar;
- qualidade da internet no local;
- módulos contratados e cronograma das fases.

## Decisões confirmadas para comandas

- nome e telefone são obrigatórios no cadastro do cliente; CPF é opcional;
- o telefone identifica e reaproveita o cadastro interno do cliente;
- vendas de balcão e vendas por comanda são origens diferentes, mas alimentam o mesmo Caixa;
- a comanda só gera receita quando for paga e fechada;
- cada envio dentro da comanda cria uma ficha separada para cozinha;
- a comanda permanece aberta para receber novos pedidos;
- bebidas controlam unidades em estoque;
- refeições, porções e preparos ficam como produção livre nesta fase;
- pedidos podem ser consumo no local, retirada ou delivery;
- delivery usa o status `Saiu para entrega`;
- retirada e consumo local usam o status `Pedido pronto`.

## Fases funcionais aprovadas

1. Cadastro de clientes e catálogo específico do bar.
2. Abertura de comandas, inclusão de itens e múltiplos pedidos por comanda.
3. Painel de cozinha/atendimento e status por modalidade.
4. Fechamento da comanda, pagamento e integração com Caixa e estoque.
5. Banco central, autenticação, publicação web e operação offline sincronizada.

### Andamento da demo

- fase 1 concluída: cadastro de clientes e cardápio do bar;
- fase 2 concluída: abertura de comandas por cliente, modalidades de atendimento e múltiplos pedidos separados;
- fase 3 concluída: painel operacional, cozinha, retirada e acompanhamento de delivery;
- fase 4 concluída: fechamento de comanda, pagamento, venda no histórico, caixa e estoque integrados;
- publicação web da demo preparada para GitHub Pages;
- próxima fase da operação real: banco central, usuários e sincronização entre aparelhos.

## Etapa 1 — congelar e proteger a demo aprovada

1. Registrar os fluxos aprovados pelo cliente.
2. Separar dados fictícios dos dados reais do estabelecimento.
3. Fazer cópia exportável dos produtos iniciais.
4. Definir data de início da operação real.

## Etapa 2 — banco central e acesso

1. Criar projeto Supabase.
2. Modelar empresas, usuários, produtos, vendas, itens, estoque, movimentos de caixa e fechamentos.
3. Implementar autenticação e permissões.
4. Aplicar RLS em todas as tabelas expostas.
5. Migrar o armazenamento local para uma camada de dados sincronizável.
6. Criar auditoria para cancelamentos, alterações e exclusões.

## Etapa 3 — publicação web

1. Publicar o frontend React/Vite em hospedagem conectada ao GitHub.
2. Configurar variáveis de ambiente sem credenciais secretas no código.
3. Criar ambientes de teste e produção.
4. Configurar domínio próprio quando aprovado.
5. Validar backup, restauração e atualização sem perda de dados.

## Etapa 4 — funcionamento offline real

1. Transformar o frontend em PWA instalável.
2. Usar armazenamento local estruturado para operações pendentes.
3. Criar fila idempotente de vendas, estoque e caixa.
4. Sincronizar automaticamente quando a internet voltar.
5. Resolver conflitos sem duplicar vendas ou movimentações.
6. Exibir claramente estado online, offline, pendente e sincronizado.

## Testes executados na demo

- carregamento dos 25 produtos iniciais;
- venda em Pix com baixa de estoque;
- entrada automática da venda no Caixa;
- saída manual e recálculo de entradas, saídas e saldo;
- edição de saída manual;
- filtro de movimentações;
- persistência de venda, estoque e caixa após recarregar;
- venda em dinheiro e cálculo de troco;
- fechamento considerando venda e saída manual em dinheiro;
- verificação do console do navegador sem erros.

## Proteções adicionadas após os testes

- recuperação segura quando o armazenamento local estiver inválido;
- bloqueio de código de barras duplicado;
- bloqueio da edição direta do saldo de estoque no cadastro de produto;
- proteção contra venda duplicada por clique rápido;
- cancelamento baseado no estado de estoque registrado no momento da venda.

## Limitações aceitas somente para demonstração

- os dados existem apenas no navegador e computador usados;
- não há login, permissões, backup remoto ou sincronização;
- não há operação simultânea em vários dispositivos;
- o fechamento considera os movimentos do dia, não uma sessão formal de abertura/fechamento;
- exclusões manuais do Caixa não possuem auditoria imutável;
- não há exportação para Excel ou impressão fiscal;
- o layout atual prioriza computador e não celular;
- o servidor local precisa permanecer ligado durante a demonstração.

Essas limitações não devem ser levadas para a operação definitiva.
