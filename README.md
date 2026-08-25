# Bar do Ceará — PDV Demo V0.3

Demo local de um PDV simples, rápido e intuitivo para vendas, estoque e gestão básica do Bar do Ceará.

## V0.3 — o que já funciona

- 25 produtos de demonstração
- Busca por nome ou código de barras
- Leitura preparada para leitor USB via código exato + Enter
- Carrinho rápido com controle de quantidade
- Pix, dinheiro, débito e crédito
- Calculadora de troco com teclado numérico e atalhos de cédulas
- Baixa automática de estoque apenas para produtos controlados
- Produtos de venda livre, como jantinhas e doses
- Histórico de vendas com busca e filtro por pagamento
- Detalhes completos de cada venda
- Cancelamento auditável, sem apagar a venda do histórico
- Cancelamento com devolução automática ao estoque
- Estoque com movimentação manual por entrada ou saída
- Histórico das movimentações de estoque
- Cadastro, edição, desativação e reativação de produtos
- Código de barras opcional
- Resumo diário com faturamento, número de vendas, ticket médio e itens vendidos
- Separação por forma de pagamento
- Ranking dos produtos mais vendidos
- Fechamento de caixa físico com fundo inicial, valor esperado, valor contado e diferença
- Histórico do último fechamento
- Assistente inteligente local com insights automáticos sobre vendas, estoque, pagamento e horário de pico
- Persistência local via `localStorage`

## Rodar localmente

Pré-requisito: Node.js instalado.

```bash
git clone https://github.com/azevedoalberto1832-prog/bar-do-ceara.git
cd bar-do-ceara
git switch demo-pdv
npm install
npm run dev
```

Se o projeto já estiver clonado:

```bash
cd %USERPROFILE%\bar-do-ceara
git switch demo-pdv
git pull origin demo-pdv
npm run dev
```

Abra no navegador:

```text
http://localhost:5173
```

## Roteiro de teste V0.3

1. Faça uma venda em Pix e confirme no Histórico e no Resumo.
2. Faça uma venda em Dinheiro, use R$ 50 e confira a equação de troco.
3. Venda um produto com estoque e confirme a baixa automática.
4. Abra Estoque, clique em Movimentar, faça uma entrada e confira o histórico da movimentação.
5. Cadastre um produto com estoque e confirme que ele aparece no topo do Estoque.
6. Edite o produto recém-criado e confirme que o histórico anterior permanece.
7. Abra uma venda no Histórico e cancele. A venda deve permanecer marcada como cancelada e o estoque deve retornar.
8. Faça algumas vendas e abra Resumo para conferir os insights automáticos.
9. Clique em Fechar caixa, informe fundo inicial e dinheiro contado e confira a diferença.
10. Teste o código `7894900011517` na busca e pressione Enter para adicionar Coca-Cola Lata ao carrinho.

## Build de validação

```bash
npm run build
```

## Arquitetura atual

A V0.3 continua propositalmente sem backend. Produtos, vendas, movimentações e fechamentos ficam salvos no navegador para a demo funcionar mesmo sem internet e sem dependências externas.

O bloco "Assistente inteligente local" não usa API de IA nem gera custo. Ele calcula padrões diretamente a partir dos dados da operação. Uma versão posterior pode conectar OpenAI para análises mais profundas, perguntas em linguagem natural e recomendações, sem refazer a base do PDV.
