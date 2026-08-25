import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Boxes, BrainCircuit, History, PackagePlus, Search, ShoppingCart, Trash2, X, Pencil, RotateCcw, WalletCards, ArrowDownToLine, ArrowUpFromLine, Eye } from 'lucide-react'

type Category = 'Bebidas' | 'Comidas' | 'Doses' | 'Tabacaria' | 'Outros'
type Payment = 'Pix' | 'Dinheiro' | 'Débito' | 'Crédito'
type Product = { id:number; name:string; category:Category; price:number; stock:number; barcode?:string; active:boolean; trackStock?:boolean }
type CartItem = { productId:number; qty:number }
type SaleItem = { productId:number; name:string; qty:number; price:number; trackStock?:boolean }
type Sale = { id:number; createdAt:string; payment:Payment; total:number; received?:number; change?:number; items:SaleItem[]; canceledAt?:string }
type MovementKind = 'Venda' | 'Entrada' | 'Saída' | 'Ajuste' | 'Cancelamento' | 'Cadastro'
type StockMovement = { id:number; productId:number; productName:string; kind:MovementKind; qty:number; createdAt:string; note?:string; saleId?:number }
type CashClosing = { id:number; createdAt:string; opening:number; expected:number; counted:number; difference:number; notes?:string }
type Tab = 'vender'|'historico'|'estoque'|'produtos'|'resumo'

const initialProducts: Product[] = [
{id:1,name:'Coca-Cola Lata',category:'Bebidas',price:6,stock:24,barcode:'7894900011517',active:true},{id:2,name:'Coca-Cola 2L',category:'Bebidas',price:12,stock:10,barcode:'7894900027013',active:true},{id:3,name:'Guaraná Lata',category:'Bebidas',price:5,stock:18,active:true},{id:4,name:'Água 500ml',category:'Bebidas',price:4,stock:30,active:true},{id:5,name:'Del Valle Uva',category:'Bebidas',price:6,stock:12,active:true},{id:6,name:'Del Valle Pêssego',category:'Bebidas',price:6,stock:10,active:true},{id:7,name:'Energético',category:'Bebidas',price:12,stock:14,active:true},{id:8,name:'Água com Gás',category:'Bebidas',price:5,stock:16,active:true},{id:9,name:'Jantinha Completa',category:'Comidas',price:18,stock:0,active:true,trackStock:false},{id:10,name:'Espetinho Carne',category:'Comidas',price:10,stock:0,active:true,trackStock:false},{id:11,name:'Espetinho Frango',category:'Comidas',price:9,stock:0,active:true,trackStock:false},{id:12,name:'Porção de Batata',category:'Comidas',price:20,stock:0,active:true,trackStock:false},{id:13,name:'Salgado',category:'Comidas',price:7,stock:15,active:true},{id:14,name:'Dose Cachaça',category:'Doses',price:5,stock:0,active:true,trackStock:false},{id:15,name:'Dose Whisky',category:'Doses',price:12,stock:0,active:true,trackStock:false},{id:16,name:'Dose Vodka',category:'Doses',price:9,stock:0,active:true,trackStock:false},{id:17,name:'Dose Campari',category:'Doses',price:10,stock:0,active:true,trackStock:false},{id:18,name:'Palheiro Tradicional',category:'Tabacaria',price:3,stock:50,active:true},{id:19,name:'Palheiro Menta',category:'Tabacaria',price:3.5,stock:35,active:true},{id:20,name:'Isqueiro',category:'Tabacaria',price:6,stock:20,active:true},{id:21,name:'Chiclete',category:'Outros',price:2,stock:40,active:true},{id:22,name:'Paçoca',category:'Outros',price:2.5,stock:25,active:true},{id:23,name:'Gelo 3kg',category:'Outros',price:10,stock:8,active:true},{id:24,name:'Carvão 3kg',category:'Outros',price:18,stock:7,active:true},{id:25,name:'Copo Descartável',category:'Outros',price:1,stock:100,active:true}]

const money=(v:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v)
const tracked=(p:Product)=>p.trackStock!==false
const sameDay=(iso:string,date=new Date())=>new Date(iso).toDateString()===date.toDateString()
const parseMoney=(value:string)=>Number(value.replace(/\./g,'').replace(',','.'))||0
const nextId=(items:{id:number}[])=>Math.max(0,...items.map(i=>i.id))+1

export default function App(){
 const [products,setProducts]=useState<Product[]>(()=>JSON.parse(localStorage.getItem('bdc_products')||'null')||initialProducts)
 const [sales,setSales]=useState<Sale[]>(()=>JSON.parse(localStorage.getItem('bdc_sales')||'[]'))
 const [movements,setMovements]=useState<StockMovement[]>(()=>JSON.parse(localStorage.getItem('bdc_movements')||'[]'))
 const [closings,setClosings]=useState<CashClosing[]>(()=>JSON.parse(localStorage.getItem('bdc_closings')||'[]'))
 const [cart,setCart]=useState<CartItem[]>([])
 const [tab,setTab]=useState<Tab>('vender')
 const [query,setQuery]=useState('')
 const [category,setCategory]=useState('Todos')
 const [paymentOpen,setPaymentOpen]=useState(false)
 const [cashOpen,setCashOpen]=useState(false)
 const [received,setReceived]=useState('')
 const [productModal,setProductModal]=useState<Product|null|undefined>(undefined)
 const [stockModal,setStockModal]=useState<Product|null>(null)
 const [saleModal,setSaleModal]=useState<Sale|null>(null)
 const [closingOpen,setClosingOpen]=useState(false)
 const [lastCreatedId,setLastCreatedId]=useState<number|null>(null)
 const [historyQuery,setHistoryQuery]=useState('')
 const [historyPayment,setHistoryPayment]=useState<'Todos'|Payment>('Todos')

 useEffect(()=>localStorage.setItem('bdc_products',JSON.stringify(products)),[products])
 useEffect(()=>localStorage.setItem('bdc_sales',JSON.stringify(sales)),[sales])
 useEffect(()=>localStorage.setItem('bdc_movements',JSON.stringify(movements)),[movements])
 useEffect(()=>localStorage.setItem('bdc_closings',JSON.stringify(closings)),[closings])

 const filtered=useMemo(()=>products.filter(p=>p.active&&(category==='Todos'||p.category===category)&&(!query||p.name.toLowerCase().includes(query.toLowerCase())||p.barcode?.includes(query))),[products,category,query])
 const cartDetails=cart.map(i=>({...i,product:products.find(p=>p.id===i.productId)!})).filter(i=>i.product)
 const total=cartDetails.reduce((s,i)=>s+i.product.price*i.qty,0)
 const activeSales=sales.filter(s=>!s.canceledAt)
 const todaySales=activeSales.filter(s=>sameDay(s.createdAt))
 const todayRevenue=todaySales.reduce((a,b)=>a+b.total,0)
 const todayCash=todaySales.filter(s=>s.payment==='Dinheiro').reduce((a,b)=>a+b.total,0)
 const paymentTotals=(['Pix','Dinheiro','Débito','Crédito'] as Payment[]).map(p=>({label:p,value:todaySales.filter(s=>s.payment===p).reduce((a,b)=>a+b.total,0)}))
 const topProducts=useMemo(()=>{const m=new Map<string,number>();todaySales.flatMap(s=>s.items).forEach(i=>m.set(i.name,(m.get(i.name)||0)+i.qty));return[...m.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5)},[todaySales])
 const stockProducts=[...products.filter(p=>p.active)].sort((a,b)=>b.id-a.id)
 const receivedNumber=parseMoney(received)
 const change=Math.max(0,receivedNumber-total)
 const lowStock=products.filter(p=>p.active&&tracked(p)&&p.stock<=5)
 const latestClosing=[...closings].sort((a,b)=>b.id-a.id)[0]

 const insights=useMemo(()=>{
   const items=todaySales.flatMap(s=>s.items).reduce((a,b)=>a+b.qty,0)
   const lines:string[]=[]
   if(!todaySales.length) lines.push('Ainda não há vendas hoje. Faça algumas vendas para o assistente encontrar padrões.')
   if(topProducts[0]) lines.push(`${topProducts[0][0]} lidera o dia com ${topProducts[0][1]} unidade${topProducts[0][1]===1?'':'s'} vendida${topProducts[0][1]===1?'':'s'}.`)
   const best=paymentTotals.slice().sort((a,b)=>b.value-a.value)[0]
   if(best?.value>0) lines.push(`${best.label} concentra ${Math.round(best.value/todayRevenue*100)}% do faturamento de hoje.`)
   if(lowStock.length) lines.push(`${lowStock.length} produto${lowStock.length===1?' está':'s estão'} com estoque em 5 unidades ou menos e merece${lowStock.length===1?'':'m'} reposição.`)
   const hourMap=new Map<number,number>();todaySales.forEach(s=>{const h=new Date(s.createdAt).getHours();hourMap.set(h,(hourMap.get(h)||0)+s.total)})
   const peak=[...hourMap.entries()].sort((a,b)=>b[1]-a[1])[0]
   if(peak) lines.push(`O maior faturamento do dia está na faixa das ${String(peak[0]).padStart(2,'0')}:00 às ${String((peak[0]+1)%24).padStart(2,'0')}:00.`)
   if(todaySales.length>=2) lines.push(`Ticket médio atual de ${money(todayRevenue/todaySales.length)} em ${todaySales.length} vendas e ${items} itens.`)
   return lines.slice(0,5)
 },[todaySales,topProducts,paymentTotals,lowStock.length,todayRevenue])

 const addMovement=(product:Product,kind:MovementKind,qty:number,note?:string,saleId?:number)=>setMovements(prev=>[{id:nextId(prev),productId:product.id,productName:product.name,kind,qty,createdAt:new Date().toISOString(),note,saleId},...prev])

 const addToCart=(p:Product)=>{if(tracked(p)&&p.stock<=0)return;setCart(prev=>{const f=prev.find(i=>i.productId===p.id),q=f?.qty||0;if(tracked(p)&&q>=p.stock)return prev;return f?prev.map(i=>i.productId===p.id?{...i,qty:i.qty+1}:i):[...prev,{productId:p.id,qty:1}]})}
 const updateQty=(id:number,d:number)=>{const p=products.find(x=>x.id===id);if(!p)return;setCart(prev=>prev.map(i=>i.productId===id?{...i,qty:Math.max(0,tracked(p)?Math.min(p.stock,i.qty+d):i.qty+d)}:i).filter(i=>i.qty>0))}
 const scan=(e:React.KeyboardEvent<HTMLInputElement>)=>{if(e.key!=='Enter')return;const code=query.trim();const p=products.find(x=>x.active&&x.barcode===code);if(p){e.preventDefault();addToCart(p);setQuery('')}}
 const cashKey=(key:string)=>{if(key==='C'){setReceived('');return}if(key==='⌫'){setReceived(v=>v.slice(0,-1));return}if(key===','&&received.includes(','))return;setReceived(v=>`${v}${key}`.replace(/^0+(?=\d)/,''))}

 const finishSale=(payment:Payment,cash?:number)=>{
   if(!cart.length)return
   const saleId=nextId(sales)
   const sale:Sale={id:saleId,createdAt:new Date().toISOString(),payment,total,received:cash,change:cash!==undefined?cash-total:undefined,items:cartDetails.map(i=>({productId:i.product.id,name:i.product.name,qty:i.qty,price:i.product.price,trackStock:i.product.trackStock}))}
   setSales(prev=>[sale,...prev])
   setProducts(prev=>prev.map(p=>{const i=cart.find(x=>x.productId===p.id);return i&&tracked(p)?{...p,stock:Math.max(0,p.stock-i.qty)}:p}))
   cartDetails.filter(i=>tracked(i.product)).forEach(i=>addMovement(i.product,'Venda',-i.qty,`Venda #${String(saleId).padStart(4,'0')}`,saleId))
   setCart([]);setPaymentOpen(false);setCashOpen(false);setReceived('')
 }
 const choosePayment=(p:Payment)=>{if(p==='Dinheiro'){setCashOpen(true);setReceived('')}else finishSale(p)}
 const cancelSale=(s:Sale)=>{
   if(s.canceledAt||!confirm(`Cancelar a venda #${String(s.id).padStart(4,'0')}? O estoque será devolvido.`))return
   setProducts(prev=>prev.map(p=>{const i=s.items.find(x=>x.productId===p.id);return i&&i.trackStock!==false&&tracked(p)?{...p,stock:p.stock+i.qty}:p}))
   setSales(prev=>prev.map(x=>x.id===s.id?{...x,canceledAt:new Date().toISOString()}:x))
   s.items.forEach(i=>{const p=products.find(x=>x.id===i.productId);if(p&&i.trackStock!==false&&tracked(p))addMovement(p,'Cancelamento',i.qty,`Cancelamento da venda #${String(s.id).padStart(4,'0')}`,s.id)})
   setSaleModal(null)
 }

 const adjustStock=(product:Product,delta:number,note:string)=>{
   if(!tracked(product)||!delta)return
   const next=Math.max(0,product.stock+delta)
   const actual=next-product.stock
   if(!actual)return
   setProducts(prev=>prev.map(p=>p.id===product.id?{...p,stock:next}:p))
   addMovement(product,actual>0?'Entrada':'Saída',actual,note||'Ajuste manual')
   setStockModal(null)
 }

 const saveProduct=(data:Omit<Product,'id'|'active'>,editing?:Product|null)=>{
   if(editing){setProducts(prev=>prev.map(p=>p.id===editing.id?{...p,...data}:p));setProductModal(undefined);return}
   const id=nextId(products);const product:Product={...data,id,active:true}
   setProducts(prev=>[...prev,product]);setLastCreatedId(id);setProductModal(undefined);setTab('estoque')
   if(tracked(product)&&product.stock>0)addMovement(product,'Cadastro',product.stock,'Estoque inicial do cadastro')
 }
 const deactivateProduct=(p:Product)=>{const used=sales.some(s=>s.items.some(i=>i.productId===p.id));if(used)setProducts(x=>x.map(v=>v.id===p.id?{...v,active:false}:v));else setProducts(x=>x.filter(v=>v.id!==p.id))}
 const reactivateProduct=(p:Product)=>setProducts(x=>x.map(v=>v.id===p.id?{...v,active:true}:v))

 const filteredSales=useMemo(()=>sales.filter(s=>{
   const text=`${s.id} ${s.payment} ${s.items.map(i=>i.name).join(' ')}`.toLowerCase()
   return (historyPayment==='Todos'||s.payment===historyPayment)&&(!historyQuery||text.includes(historyQuery.toLowerCase()))
 }),[sales,historyPayment,historyQuery])

 return <div className="app-shell">
   <aside className="sidebar">
    <div className="brand"><span>BC</span><div><strong>Bar do Ceará</strong><small>PDV local · V0.3</small></div></div>
    <nav>
      <Nav icon={<ShoppingCart size={20}/>} label="Vender" active={tab==='vender'} onClick={()=>setTab('vender')}/>
      <Nav icon={<History size={20}/>} label="Histórico" active={tab==='historico'} onClick={()=>setTab('historico')}/>
      <Nav icon={<Boxes size={20}/>} label="Estoque" active={tab==='estoque'} onClick={()=>setTab('estoque')}/>
      <Nav icon={<PackagePlus size={20}/>} label="Produtos" active={tab==='produtos'} onClick={()=>setTab('produtos')}/>
      <Nav icon={<BarChart3 size={20}/>} label="Resumo" active={tab==='resumo'} onClick={()=>setTab('resumo')}/>
    </nav>
    <div className="sidebar-status"><span/>Funcionando offline</div>
   </aside>

   <main className="main">
    {tab==='vender'&&<>
      <header className="page-header"><div><h1>Nova venda</h1><p>Escolha os produtos e feche a venda em poucos cliques.</p></div><div className="date-chip">{new Date().toLocaleDateString('pt-BR')}</div></header>
      <div className="sell-layout">
       <section className="products-panel">
        <div className="search"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={scan} placeholder="Buscar produto ou escanear código de barras" autoFocus/></div>
        <div className="categories">{['Todos','Bebidas','Comidas','Doses','Tabacaria','Outros'].map(c=><button className={category===c?'active':''} onClick={()=>setCategory(c)} key={c}>{c}</button>)}</div>
        <div className="product-grid">{filtered.map(p=><button className={`product-card ${tracked(p)&&p.stock<=3?'low':''}`} key={p.id} onClick={()=>addToCart(p)}><span className="product-category">{p.category}</span><strong>{p.name}</strong><b>{money(p.price)}</b><small>{!tracked(p)?'Venda livre':p.stock>0?`${p.stock} em estoque`:'Sem estoque'}</small></button>)}</div>
       </section>
       <aside className="cart-panel">
        <div className="cart-title"><div><ShoppingCart size={21}/><strong>Carrinho</strong></div><span>{cart.reduce((a,b)=>a+b.qty,0)} itens</span></div>
        <div className="cart-items">{!cartDetails.length?<div className="empty"><ShoppingCart size={38}/><p>Seu carrinho está vazio</p><small>Clique em um produto para adicionar.</small></div>:cartDetails.map(i=><div className="cart-item" key={i.productId}><div className="cart-item-name"><strong>{i.product.name}</strong><small>{money(i.product.price)} cada</small></div><div className="qty"><button onClick={()=>updateQty(i.productId,-1)}>−</button><span>{i.qty}</span><button onClick={()=>updateQty(i.productId,1)}>+</button></div><b>{money(i.product.price*i.qty)}</b></div>)}</div>
        <div className="cart-footer"><div className="total"><span>Total</span><strong>{money(total)}</strong></div><button className="primary" disabled={!cart.length} onClick={()=>{setCashOpen(false);setReceived('');setPaymentOpen(true)}}>Finalizar venda</button></div>
       </aside>
      </div>
    </>}

    {tab==='historico'&&<Section title="Histórico de vendas" subtitle="Vendas auditáveis, inclusive cancelamentos.">
      <div className="toolbar"><div className="search compact"><Search size={18}/><input value={historyQuery} onChange={e=>setHistoryQuery(e.target.value)} placeholder="Buscar venda ou produto"/></div><select value={historyPayment} onChange={e=>setHistoryPayment(e.target.value as 'Todos'|Payment)}><option>Todos</option><option>Pix</option><option>Dinheiro</option><option>Débito</option><option>Crédito</option></select></div>
      <div className="table-card"><table><thead><tr><th>Venda</th><th>Data e hora</th><th>Pagamento</th><th>Itens</th><th>Total</th><th>Status</th><th></th></tr></thead><tbody>{filteredSales.map(s=><tr key={s.id} className={s.canceledAt?'row-canceled':''}><td>#{String(s.id).padStart(4,'0')}</td><td>{new Date(s.createdAt).toLocaleString('pt-BR')}</td><td><span className="pill">{s.payment}</span></td><td>{s.items.reduce((a,b)=>a+b.qty,0)}</td><td><strong>{money(s.total)}</strong></td><td>{s.canceledAt?<span className="status-canceled">Cancelada</span>:<span className="status-ok">Concluída</span>}</td><td><button className="icon-btn" onClick={()=>setSaleModal(s)} title="Ver detalhes"><Eye size={17}/></button></td></tr>)}</tbody></table>{!filteredSales.length&&<div className="empty-table">Nenhuma venda encontrada.</div>}</div>
    </Section>}

    {tab==='estoque'&&<Section title="Estoque" subtitle={lastCreatedId?'Produto salvo. O item mais recente aparece primeiro.':'Toda alteração manual agora gera histórico.'}>
      <div className="stock-summary"><div><span>Produtos controlados</span><strong>{products.filter(p=>p.active&&tracked(p)).length}</strong></div><div><span>Estoque crítico</span><strong>{lowStock.length}</strong></div><div><span>Movimentações</span><strong>{movements.length}</strong></div></div>
      <div className="table-card"><table><thead><tr><th>Produto</th><th>Categoria</th><th>Estoque</th><th>Preço</th><th>Código</th><th>Ação</th></tr></thead><tbody>{stockProducts.map(p=><tr key={p.id} className={p.id===lastCreatedId?'new-row':''}><td><strong>{p.name}</strong>{p.id===lastCreatedId&&<small className="new-label">Novo produto</small>}</td><td>{p.category}</td><td>{tracked(p)?<span className={`stock-badge ${p.stock<=3?'critical':p.stock<=8?'warning':''}`}>{p.stock}</span>:<span className="pill">Venda livre</span>}</td><td>{money(p.price)}</td><td>{p.barcode||'Manual'}</td><td>{tracked(p)?<button className="secondary" onClick={()=>setStockModal(p)}>Movimentar</button>:<span className="muted">Sem baixa</span>}</td></tr>)}</tbody></table></div>
      <div className="panel movement-panel"><h3>Últimas movimentações</h3>{movements.slice(0,12).map(m=><div className="movement" key={m.id}><span className={m.qty>0?'move-in':'move-out'}>{m.qty>0?<ArrowDownToLine size={16}/>:<ArrowUpFromLine size={16}/>}</span><div><strong>{m.productName}</strong><small>{m.kind} · {new Date(m.createdAt).toLocaleString('pt-BR')}{m.note?` · ${m.note}`:''}</small></div><b>{m.qty>0?'+':''}{m.qty}</b></div>)}{!movements.length&&<p className="muted">Nenhuma movimentação registrada ainda.</p>}</div>
    </Section>}

    {tab==='produtos'&&<Section title="Produtos" subtitle="Cadastre, edite, desative ou reative sem perder histórico." action={<button className="primary small" onClick={()=>setProductModal(null)}>+ Novo produto</button>}>
      <div className="table-card"><table><thead><tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Código</th><th>Status</th><th></th></tr></thead><tbody>{products.map(p=><tr key={p.id} className={!p.active?'row-muted':''}><td><strong>{p.name}</strong></td><td>{p.category}</td><td>{money(p.price)}</td><td>{tracked(p)?p.stock:'Livre'}</td><td>{p.barcode||'Manual'}</td><td>{p.active?<span className="status-ok">Ativo</span>:<span className="status-canceled">Inativo</span>}</td><td><div className="row-actions"><button className="icon-btn" onClick={()=>setProductModal(p)} title="Editar"><Pencil size={17}/></button>{p.active?<button className="icon-danger" onClick={()=>deactivateProduct(p)} title="Desativar"><Trash2 size={17}/></button>:<button className="icon-btn" onClick={()=>reactivateProduct(p)} title="Reativar"><RotateCcw size={17}/></button>}</div></td></tr>)}</tbody></table></div>
    </Section>}

    {tab==='resumo'&&<Section title="Resumo do dia" subtitle="Venda, caixa e sinais operacionais em uma tela." action={<button className="primary small" onClick={()=>setClosingOpen(true)}><WalletCards size={17}/> Fechar caixa</button>}>
      <div className="metrics"><Metric label="Faturamento" value={money(todayRevenue)}/><Metric label="Vendas" value={String(todaySales.length)}/><Metric label="Ticket médio" value={money(todaySales.length?todayRevenue/todaySales.length:0)}/><Metric label="Itens vendidos" value={String(todaySales.flatMap(s=>s.items).reduce((a,b)=>a+b.qty,0))}/></div>
      <div className="dashboard-grid"><div className="panel"><h3>Por forma de pagamento</h3>{paymentTotals.map(p=><div className="pay-line" key={p.label}><span>{p.label}</span><strong>{money(p.value)}</strong></div>)}</div><div className="panel"><h3>Mais vendidos hoje</h3>{topProducts.length?topProducts.map(([n,q],i)=><div className="rank" key={n}><span>{i+1}</span><p>{n}</p><strong>{q}</strong></div>):<p className="muted">Ainda não houve vendas hoje.</p>}</div></div>
      <div className="dashboard-grid lower"><div className="panel smart-panel"><div className="panel-title"><BrainCircuit size={21}/><h3>Assistente inteligente local</h3></div>{insights.map((x,i)=><div className="insight" key={i}><span>{i+1}</span><p>{x}</p></div>)}</div><div className="panel"><h3>Último fechamento</h3>{latestClosing?<><div className="pay-line"><span>Esperado</span><strong>{money(latestClosing.expected)}</strong></div><div className="pay-line"><span>Contado</span><strong>{money(latestClosing.counted)}</strong></div><div className="pay-line"><span>Diferença</span><strong className={latestClosing.difference===0?'good':latestClosing.difference<0?'bad':''}>{money(latestClosing.difference)}</strong></div><small className="muted">{new Date(latestClosing.createdAt).toLocaleString('pt-BR')}</small></>:<p className="muted">Nenhum fechamento realizado.</p>}</div></div>
    </Section>}
   </main>

   {paymentOpen&&<div className="modal-backdrop"><div className="modal product-modal"><button className="modal-x" onClick={()=>{setPaymentOpen(false);setCashOpen(false);setReceived('')}}><X/></button>{!cashOpen?<><h2>Forma de pagamento</h2><p>Total da venda: <strong>{money(total)}</strong></p><div className="payment-grid">{(['Pix','Dinheiro','Débito','Crédito'] as Payment[]).map(p=><button key={p} onClick={()=>choosePayment(p)}>{p}</button>)}</div></>:<form onSubmit={e=>{e.preventDefault();if(receivedNumber>=total)finishSale('Dinheiro',receivedNumber)}}><button type="button" className="back-link" onClick={()=>{setCashOpen(false);setReceived('')}}>← Voltar às formas de pagamento</button><h2>Pagamento em dinheiro</h2><div className="cash-equation"><div><span>Recebido</span><strong>{money(receivedNumber)}</strong></div><b>−</b><div><span>Total</span><strong>{money(total)}</strong></div><b>=</b><div className="change-box"><span>Troco</span><strong>{money(change)}</strong></div></div><div className="cash-presets">{[10,20,50,100].map(v=><button type="button" key={v} onClick={()=>setReceived(String(v))}>{money(v)}</button>)}</div><div className="keypad">{['7','8','9','4','5','6','1','2','3','C','0',',','⌫'].map(k=><button type="button" key={k} className={k==='C'||k==='⌫'?'key-special':''} onClick={()=>cashKey(k)}>{k}</button>)}</div><button className="primary" type="submit" disabled={receivedNumber<total}>Confirmar venda</button></form>}</div></div>}

   {productModal!==undefined&&<ProductModal product={productModal} onClose={()=>setProductModal(undefined)} onSave={saveProduct}/>} 
   {stockModal&&<StockModal product={stockModal} onClose={()=>setStockModal(null)} onSave={adjustStock}/>} 
   {saleModal&&<SaleModal sale={saleModal} onClose={()=>setSaleModal(null)} onCancel={cancelSale}/>} 
   {closingOpen&&<ClosingModal cashSales={todayCash} onClose={()=>setClosingOpen(false)} onSave={(opening,counted,notes)=>{const expected=opening+todayCash;setClosings(prev=>[{id:nextId(prev),createdAt:new Date().toISOString(),opening,expected,counted,difference:counted-expected,notes},...prev]);setClosingOpen(false)}}/>}
 </div>
}

function Nav({icon,label,active,onClick}:{icon:any,label:string,active:boolean,onClick:()=>void}){return <button className={active?'nav active':'nav'} onClick={onClick}>{icon}<span>{label}</span></button>}
function Section({title,subtitle,children,action}:{title:string,subtitle:string,children:any,action?:any}){return <><header className="page-header"><div><h1>{title}</h1><p>{subtitle}</p></div>{action}</header>{children}</>}
function Metric({label,value}:{label:string,value:string}){return <div className="metric"><span>{label}</span><strong>{value}</strong></div>}

function ProductModal({product,onClose,onSave}:{product:Product|null,onClose:()=>void,onSave:(p:Omit<Product,'id'|'active'>,editing?:Product|null)=>void}){
 const[name,setName]=useState(product?.name||''),[price,setPrice]=useState(product?String(product.price).replace('.',','):''),[stock,setStock]=useState(product?String(product.stock):''),[barcode,setBarcode]=useState(product?.barcode||''),[category,setCategory]=useState<Category>(product?.category||'Bebidas'),[trackStock,setTrackStock]=useState(product?tracked(product):true)
 return <div className="modal-backdrop"><form className="modal product-modal" onSubmit={e=>{e.preventDefault();if(!name||!price)return;onSave({name,price:parseMoney(price),stock:trackStock?Number(stock)||0:0,barcode:barcode||undefined,category,trackStock},product)}}><button type="button" className="modal-x" onClick={onClose}><X/></button><h2>{product?'Editar produto':'Novo produto'}</h2><p>{product?'Atualize os dados sem perder o histórico.':'O mínimo necessário para colocar algo à venda.'}</p><label>Nome<input value={name} onChange={e=>setName(e.target.value)} placeholder="Ex.: Coca-Cola 2L" required/></label><div className="form-row"><label>Preço<input value={price} onChange={e=>setPrice(e.target.value)} placeholder="12,00" inputMode="decimal" required/></label>{trackStock&&<label>Estoque atual<input value={stock} onChange={e=>setStock(e.target.value)} placeholder="12" inputMode="numeric"/></label>}</div><label>Categoria<select value={category} onChange={e=>setCategory(e.target.value as Category)}>{['Bebidas','Comidas','Doses','Tabacaria','Outros'].map(c=><option key={c}>{c}</option>)}</select></label><label>Código de barras <small>(opcional)</small><input value={barcode} onChange={e=>setBarcode(e.target.value)} placeholder="Digite ou escaneie"/></label><label className="check-label"><input type="checkbox" checked={trackStock} onChange={e=>setTrackStock(e.target.checked)}/> Controlar estoque deste produto</label><button className="primary" type="submit">{product?'Salvar alterações':'Salvar produto'}</button></form></div>
}

function StockModal({product,onClose,onSave}:{product:Product,onClose:()=>void,onSave:(p:Product,delta:number,note:string)=>void}){
 const[type,setType]=useState<'entrada'|'saida'>('entrada'),[qty,setQty]=useState('1'),[note,setNote]=useState('')
 const n=Math.max(0,Number(qty)||0),delta=type==='entrada'?n:-n
 return <div className="modal-backdrop"><form className="modal product-modal" onSubmit={e=>{e.preventDefault();onSave(product,delta,note)}}><button type="button" className="modal-x" onClick={onClose}><X/></button><h2>Movimentar estoque</h2><p><strong>{product.name}</strong> · Atual: {product.stock}</p><div className="switch"><button type="button" className={type==='entrada'?'active':''} onClick={()=>setType('entrada')}>Entrada</button><button type="button" className={type==='saida'?'active':''} onClick={()=>setType('saida')}>Saída</button></div><label>Quantidade<input autoFocus value={qty} onChange={e=>setQty(e.target.value)} inputMode="numeric"/></label><label>Motivo <small>(opcional)</small><input value={note} onChange={e=>setNote(e.target.value)} placeholder="Ex.: reposição, perda, consumo"/></label><div className="preview-line"><span>Estoque após ajuste</span><strong>{Math.max(0,product.stock+delta)}</strong></div><button className="primary" disabled={!n} type="submit">Confirmar movimentação</button></form></div>
}

function SaleModal({sale,onClose,onCancel}:{sale:Sale,onClose:()=>void,onCancel:(s:Sale)=>void}){
 return <div className="modal-backdrop"><div className="modal"><button className="modal-x" onClick={onClose}><X/></button><h2>Venda #{String(sale.id).padStart(4,'0')}</h2><p>{new Date(sale.createdAt).toLocaleString('pt-BR')} · {sale.payment}</p><div className="sale-lines">{sale.items.map(i=><div key={i.productId}><span>{i.qty}x {i.name}</span><strong>{money(i.qty*i.price)}</strong></div>)}</div><div className="total detail-total"><span>Total</span><strong>{money(sale.total)}</strong></div>{sale.payment==='Dinheiro'&&<div className="cash-detail"><span>Recebido {money(sale.received||0)}</span><span>Troco {money(sale.change||0)}</span></div>}{sale.canceledAt?<div className="cancel-note">Cancelada em {new Date(sale.canceledAt).toLocaleString('pt-BR')}</div>:<button className="danger-button" onClick={()=>onCancel(sale)}>Cancelar venda e devolver estoque</button>}</div></div>
}

function ClosingModal({cashSales,onClose,onSave}:{cashSales:number,onClose:()=>void,onSave:(opening:number,counted:number,notes:string)=>void}){
 const[opening,setOpening]=useState('0'),[counted,setCounted]=useState(''),[notes,setNotes]=useState('')
 const open=parseMoney(opening),count=parseMoney(counted),expected=open+cashSales,difference=count-expected
 return <div className="modal-backdrop"><form className="modal product-modal" onSubmit={e=>{e.preventDefault();onSave(open,count,notes)}}><button type="button" className="modal-x" onClick={onClose}><X/></button><h2>Fechamento de caixa</h2><p>Confira apenas o dinheiro físico. Pix e cartões já estão separados no resumo.</p><label>Fundo inicial<input value={opening} onChange={e=>setOpening(e.target.value)} inputMode="decimal"/></label><div className="preview-line"><span>Vendas em dinheiro</span><strong>{money(cashSales)}</strong></div><div className="preview-line"><span>Dinheiro esperado</span><strong>{money(expected)}</strong></div><label>Dinheiro contado<input value={counted} onChange={e=>setCounted(e.target.value)} inputMode="decimal" placeholder="0,00" required/></label><div className="preview-line emphasis"><span>Diferença</span><strong className={difference===0?'good':difference<0?'bad':''}>{money(difference)}</strong></div><label>Observação <small>(opcional)</small><input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Ex.: troco deixado no caixa"/></label><button className="primary" type="submit">Salvar fechamento</button></form></div>
}
