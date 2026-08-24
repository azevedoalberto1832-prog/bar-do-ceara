import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Boxes, History, PackagePlus, Search, ShoppingCart, Trash2, X } from 'lucide-react'

type Category = 'Bebidas' | 'Comidas' | 'Doses' | 'Tabacaria' | 'Outros'
type Payment = 'Pix' | 'Dinheiro' | 'Débito' | 'Crédito'
type Product = { id: number; name: string; category: Category; price: number; stock: number; barcode?: string; active: boolean }
type CartItem = { productId: number; qty: number }
type Sale = { id: number; createdAt: string; payment: Payment; total: number; items: Array<{ productId: number; name: string; qty: number; price: number }> }
type Tab = 'vender' | 'historico' | 'estoque' | 'produtos' | 'resumo'

const initialProducts: Product[] = [
  { id: 1, name: 'Coca-Cola Lata', category: 'Bebidas', price: 6, stock: 24, barcode: '7894900011517', active: true },
  { id: 2, name: 'Coca-Cola 2L', category: 'Bebidas', price: 12, stock: 10, barcode: '7894900027013', active: true },
  { id: 3, name: 'Guaraná Lata', category: 'Bebidas', price: 5, stock: 18, active: true },
  { id: 4, name: 'Água 500ml', category: 'Bebidas', price: 4, stock: 30, active: true },
  { id: 5, name: 'Del Valle Uva', category: 'Bebidas', price: 6, stock: 12, active: true },
  { id: 6, name: 'Del Valle Pêssego', category: 'Bebidas', price: 6, stock: 10, active: true },
  { id: 7, name: 'Energético', category: 'Bebidas', price: 12, stock: 14, active: true },
  { id: 8, name: 'Água com Gás', category: 'Bebidas', price: 5, stock: 16, active: true },
  { id: 9, name: 'Jantinha Completa', category: 'Comidas', price: 18, stock: 20, active: true },
  { id: 10, name: 'Espetinho Carne', category: 'Comidas', price: 10, stock: 18, active: true },
  { id: 11, name: 'Espetinho Frango', category: 'Comidas', price: 9, stock: 16, active: true },
  { id: 12, name: 'Porção de Batata', category: 'Comidas', price: 20, stock: 12, active: true },
  { id: 13, name: 'Salgado', category: 'Comidas', price: 7, stock: 15, active: true },
  { id: 14, name: 'Dose Cachaça', category: 'Doses', price: 5, stock: 40, active: true },
  { id: 15, name: 'Dose Whisky', category: 'Doses', price: 12, stock: 24, active: true },
  { id: 16, name: 'Dose Vodka', category: 'Doses', price: 9, stock: 28, active: true },
  { id: 17, name: 'Dose Campari', category: 'Doses', price: 10, stock: 18, active: true },
  { id: 18, name: 'Palheiro Tradicional', category: 'Tabacaria', price: 3, stock: 50, active: true },
  { id: 19, name: 'Palheiro Menta', category: 'Tabacaria', price: 3.5, stock: 35, active: true },
  { id: 20, name: 'Isqueiro', category: 'Tabacaria', price: 6, stock: 20, active: true },
  { id: 21, name: 'Chiclete', category: 'Outros', price: 2, stock: 40, active: true },
  { id: 22, name: 'Paçoca', category: 'Outros', price: 2.5, stock: 25, active: true },
  { id: 23, name: 'Gelo 3kg', category: 'Outros', price: 10, stock: 8, active: true },
  { id: 24, name: 'Carvão 3kg', category: 'Outros', price: 18, stock: 7, active: true },
  { id: 25, name: 'Copo Descartável', category: 'Outros', price: 1, stock: 100, active: true }
]

const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

export default function App() {
  const [products, setProducts] = useState<Product[]>(() => JSON.parse(localStorage.getItem('bdc_products') || 'null') || initialProducts)
  const [sales, setSales] = useState<Sale[]>(() => JSON.parse(localStorage.getItem('bdc_sales') || '[]'))
  const [cart, setCart] = useState<CartItem[]>([])
  const [tab, setTab] = useState<Tab>('vender')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todos')
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [newProductOpen, setNewProductOpen] = useState(false)

  useEffect(() => localStorage.setItem('bdc_products', JSON.stringify(products)), [products])
  useEffect(() => localStorage.setItem('bdc_sales', JSON.stringify(sales)), [sales])

  const filtered = useMemo(() => products.filter(p => p.active && (category === 'Todos' || p.category === category) && (!query || p.name.toLowerCase().includes(query.toLowerCase()) || p.barcode?.includes(query))), [products, category, query])
  const cartDetails = cart.map(item => ({ ...item, product: products.find(p => p.id === item.productId)! })).filter(i => i.product)
  const total = cartDetails.reduce((sum, i) => sum + i.product.price * i.qty, 0)

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return
    setCart(prev => {
      const found = prev.find(i => i.productId === product.id)
      const currentQty = found?.qty || 0
      if (currentQty >= product.stock) return prev
      return found ? prev.map(i => i.productId === product.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { productId: product.id, qty: 1 }]
    })
  }

  const updateQty = (productId: number, delta: number) => {
    const stock = products.find(p => p.id === productId)?.stock || 0
    setCart(prev => prev.map(i => i.productId === productId ? { ...i, qty: Math.max(0, Math.min(stock, i.qty + delta)) } : i).filter(i => i.qty > 0))
  }

  const finishSale = (payment: Payment) => {
    if (!cart.length) return
    const sale: Sale = {
      id: (sales[0]?.id || 0) + 1,
      createdAt: new Date().toISOString(),
      payment,
      total,
      items: cartDetails.map(i => ({ productId: i.product.id, name: i.product.name, qty: i.qty, price: i.product.price }))
    }
    setSales(prev => [sale, ...prev])
    setProducts(prev => prev.map(p => {
      const item = cart.find(i => i.productId === p.id)
      return item ? { ...p, stock: Math.max(0, p.stock - item.qty) } : p
    }))
    setCart([])
    setPaymentOpen(false)
  }

  const cancelSale = (sale: Sale) => {
    setProducts(prev => prev.map(p => {
      const item = sale.items.find(i => i.productId === p.id)
      return item ? { ...p, stock: p.stock + item.qty } : p
    }))
    setSales(prev => prev.filter(s => s.id !== sale.id))
  }

  const today = new Date().toDateString()
  const todaySales = sales.filter(s => new Date(s.createdAt).toDateString() === today)
  const todayRevenue = todaySales.reduce((s, sale) => s + sale.total, 0)
  const paymentTotals = (['Pix', 'Dinheiro', 'Débito', 'Crédito'] as Payment[]).map(p => ({ label: p, value: todaySales.filter(s => s.payment === p).reduce((a,b) => a + b.total, 0) }))
  const topProducts = useMemo(() => {
    const map = new Map<string, number>()
    todaySales.flatMap(s => s.items).forEach(i => map.set(i.name, (map.get(i.name) || 0) + i.qty))
    return [...map.entries()].sort((a,b) => b[1] - a[1]).slice(0,5)
  }, [todaySales])

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span>BC</span><div><strong>Bar do Ceará</strong><small>PDV local</small></div></div>
      <nav>
        <Nav icon={<ShoppingCart size={20}/>} label="Vender" active={tab==='vender'} onClick={() => setTab('vender')} />
        <Nav icon={<History size={20}/>} label="Histórico" active={tab==='historico'} onClick={() => setTab('historico')} />
        <Nav icon={<Boxes size={20}/>} label="Estoque" active={tab==='estoque'} onClick={() => setTab('estoque')} />
        <Nav icon={<PackagePlus size={20}/>} label="Produtos" active={tab==='produtos'} onClick={() => setTab('produtos')} />
        <Nav icon={<BarChart3 size={20}/>} label="Resumo" active={tab==='resumo'} onClick={() => setTab('resumo')} />
      </nav>
      <div className="sidebar-status"><span></span>Funcionando offline</div>
    </aside>

    <main className="main">
      {tab === 'vender' && <>
        <header className="page-header"><div><h1>Nova venda</h1><p>Escolha os produtos e feche a venda em poucos cliques.</p></div><div className="date-chip">{new Date().toLocaleDateString('pt-BR')}</div></header>
        <div className="sell-layout">
          <section className="products-panel">
            <div className="search-row"><div className="search"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar produto ou escanear código de barras" autoFocus /></div></div>
            <div className="categories">{['Todos','Bebidas','Comidas','Doses','Tabacaria','Outros'].map(c => <button className={category===c?'active':''} onClick={()=>setCategory(c)} key={c}>{c}</button>)}</div>
            <div className="product-grid">{filtered.map(p => <button className={`product-card ${p.stock<=3?'low':''}`} key={p.id} onClick={()=>addToCart(p)}><span className="product-category">{p.category}</span><strong>{p.name}</strong><b>{money(p.price)}</b><small>{p.stock > 0 ? `${p.stock} em estoque` : 'Sem estoque'}</small></button>)}</div>
          </section>
          <aside className="cart-panel">
            <div className="cart-title"><div><ShoppingCart size={21}/><strong>Carrinho</strong></div><span>{cart.reduce((a,b)=>a+b.qty,0)} itens</span></div>
            <div className="cart-items">{cartDetails.length === 0 ? <div className="empty"><ShoppingCart size={38}/><p>Seu carrinho está vazio</p><small>Clique em um produto para adicionar.</small></div> : cartDetails.map(i => <div className="cart-item" key={i.productId}><div className="cart-item-name"><strong>{i.product.name}</strong><small>{money(i.product.price)} cada</small></div><div className="qty"><button onClick={()=>updateQty(i.productId,-1)}>−</button><span>{i.qty}</span><button onClick={()=>updateQty(i.productId,1)}>+</button></div><b>{money(i.product.price*i.qty)}</b></div>)}</div>
            <div className="cart-footer"><div className="total"><span>Total</span><strong>{money(total)}</strong></div><button className="primary" disabled={!cart.length} onClick={()=>setPaymentOpen(true)}>Finalizar venda</button></div>
          </aside>
        </div>
      </>}

      {tab === 'historico' && <Section title="Histórico de vendas" subtitle="Todas as vendas registradas neste navegador."><div className="table-card"><table><thead><tr><th>Venda</th><th>Data e hora</th><th>Pagamento</th><th>Itens</th><th>Total</th><th></th></tr></thead><tbody>{sales.map(s => <tr key={s.id}><td>#{String(s.id).padStart(4,'0')}</td><td>{new Date(s.createdAt).toLocaleString('pt-BR')}</td><td><span className="pill">{s.payment}</span></td><td>{s.items.reduce((a,b)=>a+b.qty,0)}</td><td><strong>{money(s.total)}</strong></td><td><button className="danger-link" onClick={()=>cancelSale(s)}>Cancelar</button></td></tr>)}</tbody></table>{!sales.length && <div className="empty-table">Nenhuma venda registrada ainda.</div>}</div></Section>}

      {tab === 'estoque' && <Section title="Estoque" subtitle="Entrada e saída simples, sem transformar o balcão numa faculdade."><div className="table-card"><table><thead><tr><th>Produto</th><th>Categoria</th><th>Estoque</th><th>Preço</th><th>Código</th><th>Ajuste rápido</th></tr></thead><tbody>{products.filter(p=>p.active).map(p => <tr key={p.id}><td><strong>{p.name}</strong></td><td>{p.category}</td><td><span className={`stock-badge ${p.stock<=3?'critical':p.stock<=8?'warning':''}`}>{p.stock}</span></td><td>{money(p.price)}</td><td>{p.barcode || 'Manual'}</td><td><div className="adjust"><button onClick={()=>setProducts(x=>x.map(v=>v.id===p.id?{...v,stock:Math.max(0,v.stock-1)}:v))}>−1</button><button onClick={()=>setProducts(x=>x.map(v=>v.id===p.id?{...v,stock:v.stock+1}:v))}>+1</button><button onClick={()=>setProducts(x=>x.map(v=>v.id===p.id?{...v,stock:v.stock+12}:v))}>+12</button></div></td></tr>)}</tbody></table></div></Section>}

      {tab === 'produtos' && <Section title="Produtos" subtitle="Cadastre qualquer item, com ou sem código de barras." action={<button className="primary small" onClick={()=>setNewProductOpen(true)}>+ Novo produto</button>}><div className="table-card"><table><thead><tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Código</th><th>Status</th><th></th></tr></thead><tbody>{products.map(p => <tr key={p.id}><td><strong>{p.name}</strong></td><td>{p.category}</td><td>{money(p.price)}</td><td>{p.stock}</td><td>{p.barcode || 'Manual'}</td><td>{p.active?'Ativo':'Inativo'}</td><td><button className="icon-danger" title="Excluir ou desativar" onClick={()=>{
        const used = sales.some(s=>s.items.some(i=>i.productId===p.id));
        if (used) setProducts(x=>x.map(v=>v.id===p.id?{...v,active:false}:v)); else setProducts(x=>x.filter(v=>v.id!==p.id));
      }}><Trash2 size={17}/></button></td></tr>)}</tbody></table></div></Section>}

      {tab === 'resumo' && <Section title="Resumo do dia" subtitle="O que entrou hoje, sem depender da memória de ninguém."><div className="metrics"><Metric label="Faturamento" value={money(todayRevenue)}/><Metric label="Vendas" value={String(todaySales.length)}/><Metric label="Ticket médio" value={money(todaySales.length?todayRevenue/todaySales.length:0)}/><Metric label="Itens vendidos" value={String(todaySales.flatMap(s=>s.items).reduce((a,b)=>a+b.qty,0))}/></div><div className="dashboard-grid"><div className="panel"><h3>Por forma de pagamento</h3>{paymentTotals.map(p=><div className="pay-line" key={p.label}><span>{p.label}</span><strong>{money(p.value)}</strong></div>)}</div><div className="panel"><h3>Mais vendidos hoje</h3>{topProducts.length ? topProducts.map(([name,qty],idx)=><div className="rank" key={name}><span>{idx+1}</span><p>{name}</p><strong>{qty}</strong></div>) : <p className="muted">Ainda não houve vendas hoje.</p>}</div></div></Section>}
    </main>

    {paymentOpen && <div className="modal-backdrop"><div className="modal"><button className="modal-x" onClick={()=>setPaymentOpen(false)}><X/></button><h2>Forma de pagamento</h2><p>Total da venda: <strong>{money(total)}</strong></p><div className="payment-grid">{(['Pix','Dinheiro','Débito','Crédito'] as Payment[]).map(p=><button key={p} onClick={()=>finishSale(p)}>{p}</button>)}</div></div></div>}
    {newProductOpen && <ProductModal onClose={()=>setNewProductOpen(false)} onSave={(product)=>{ setProducts(p=>[...p,{...product,id:Math.max(0,...p.map(x=>x.id))+1,active:true}]); setNewProductOpen(false) }}/>} 
  </div>
}

function Nav({icon,label,active,onClick}:{icon:any,label:string,active:boolean,onClick:()=>void}) { return <button className={active?'nav active':'nav'} onClick={onClick}>{icon}<span>{label}</span></button> }
function Section({title,subtitle,children,action}:{title:string,subtitle:string,children:any,action?:any}) { return <><header className="page-header"><div><h1>{title}</h1><p>{subtitle}</p></div>{action}</header>{children}</> }
function Metric({label,value}:{label:string,value:string}) { return <div className="metric"><span>{label}</span><strong>{value}</strong></div> }

function ProductModal({onClose,onSave}:{onClose:()=>void,onSave:(p:Omit<Product,'id'|'active'>)=>void}) {
  const [name,setName]=useState(''); const [price,setPrice]=useState(''); const [stock,setStock]=useState(''); const [barcode,setBarcode]=useState(''); const [category,setCategory]=useState<Category>('Bebidas')
  return <div className="modal-backdrop"><form className="modal product-modal" onSubmit={e=>{e.preventDefault(); if(!name||!price)return; onSave({name,price:Number(price.replace(',','.')),stock:Number(stock)||0,barcode:barcode||undefined,category})}}><button type="button" className="modal-x" onClick={onClose}><X/></button><h2>Novo produto</h2><p>O mínimo necessário para colocar algo à venda.</p><label>Nome<input value={name} onChange={e=>setName(e.target.value)} placeholder="Ex.: Coca-Cola 2L" required /></label><div className="form-row"><label>Preço<input value={price} onChange={e=>setPrice(e.target.value)} placeholder="12,00" inputMode="decimal" required /></label><label>Estoque inicial<input value={stock} onChange={e=>setStock(e.target.value)} placeholder="12" inputMode="numeric" /></label></div><label>Categoria<select value={category} onChange={e=>setCategory(e.target.value as Category)}>{['Bebidas','Comidas','Doses','Tabacaria','Outros'].map(c=><option key={c}>{c}</option>)}</select></label><label>Código de barras <small>(opcional)</small><input value={barcode} onChange={e=>setBarcode(e.target.value)} placeholder="Digite ou escaneie" /></label><button className="primary" type="submit">Salvar produto</button></form></div>
}
