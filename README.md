# Bar do Ceará — PDV Demo

Demo local de um PDV simples e intuitivo para vendas, estoque e gestão básica do Bar do Ceará.

## O que já funciona

- 25 produtos de demonstração
- Busca por nome ou código de barras
- Carrinho rápido
- Pix, dinheiro, débito e crédito
- Baixa automática de estoque
- Histórico de vendas com data e hora
- Cancelamento de venda com devolução ao estoque
- Estoque com ajustes rápidos
- Cadastro de produto com código de barras opcional
- Exclusão de produto nunca vendido e desativação de produto com histórico
- Resumo diário com faturamento, vendas, ticket médio, itens vendidos e formas de pagamento
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

Abra no navegador:

```text
http://localhost:5173
```

O servidor Vite está configurado com `host: true`, então também pode ser acessado por outros dispositivos na mesma rede local usando o IP do computador e a porta 5173.

## Build de validação

```bash
npm run build
```

## Arquitetura atual

A demo não depende de backend. Produtos e vendas ficam salvos no navegador para reduzir risco e dependências durante a apresentação. A próxima evolução natural é trocar a camada de persistência por banco real sem redesenhar o fluxo do PDV.
