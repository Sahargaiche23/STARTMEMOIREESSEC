import { Globe, Mail, Map, Search, Package, Truck, Layers, CheckCircle, ArrowUpRight, ArrowDownRight, Download, Palette, Layout, Code, Smartphone } from 'lucide-react';

export const erpDemos = {
  'gestion-fournisseurs': { title: 'Gestion Fournisseurs', description: 'Gérez vos fournisseurs et achats', screens: [
    { title: 'Annuaire Fournisseurs', description: 'Base de données complète', component: (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white flex justify-between items-center">
          <div><h3 className="text-lg font-bold">Mes Fournisseurs</h3><p className="text-sm text-white/80">24 fournisseurs actifs</p></div>
          <button className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium text-sm">+ Ajouter</button>
        </div>
        <div className="p-4 space-y-3">
          {[{name:'TechParts SARL',cat:'Matériel IT',total:'45,200 TND',ok:true},{name:'Bureau Plus',cat:'Fournitures',total:'12,800 TND',ok:true},{name:'LogiTrans',cat:'Transport',total:'8,500 TND',ok:true},{name:'CleanPro',cat:'Services',total:'3,200 TND',ok:false}].map((f,i)=>(
            <div key={i} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><Truck className="w-5 h-5 text-purple-600"/></div>
              <div className="flex-1"><p className="font-medium">{f.name}</p><p className="text-sm text-gray-500">{f.cat}</p></div>
              <div className="text-right"><p className="font-semibold">{f.total}</p><span className={`text-xs px-2 py-1 rounded-full ${f.ok?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}`}>{f.ok?'Actif':'En pause'}</span></div>
            </div>))}
        </div>
      </div>
    )}
  ]},
  'gestion-stock': { title: 'Gestion Stock', description: 'Suivi de stock en temps réel', screens: [
    { title: 'Inventaire', description: 'Vue complète de votre stock', component: (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white"><h3 className="text-lg font-bold">Stock en temps réel</h3><p className="text-sm text-white/80">156 articles • 89,450 TND</p></div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg"><p className="text-sm text-green-600">OK</p><p className="text-xl font-bold text-green-700">132</p></div>
            <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg"><p className="text-sm text-orange-600">Bas</p><p className="text-xl font-bold text-orange-700">18</p></div>
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg"><p className="text-sm text-red-600">Rupture</p><p className="text-xl font-bold text-red-700">6</p></div>
          </div>
          <div className="space-y-2">
            {[{nom:'Laptop HP',qte:12,s:'ok'},{nom:'Écran Dell 27"',qte:3,s:'low'},{nom:'Clavier méca.',qte:0,s:'out'},{nom:'Souris sans fil',qte:45,s:'ok'}].map((p,i)=>(
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3"><Package className="w-5 h-5 text-gray-400"/><p className="font-medium">{p.nom}</p></div>
                <span className="font-semibold">{p.qte} unités</span>
                <span className={`w-3 h-3 rounded-full ${p.s==='ok'?'bg-green-500':p.s==='low'?'bg-orange-500':'bg-red-500'}`}/>
              </div>))}
          </div>
        </div>
      </div>
    )}
  ]},
  'gestion-facturation': { title: 'Gestion Facturation', description: 'Facturation professionnelle', screens: [
    { title: 'Factures', description: 'Gérez vos factures', component: (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 text-white"><h3 className="text-lg font-bold">Facturation</h3><p className="text-sm text-white/80">23 factures ce mois</p></div>
        <div className="p-4">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-green-50 p-3 rounded-lg text-center"><p className="text-xl font-bold text-green-700">18</p><p className="text-xs">Payées</p></div>
            <div className="bg-orange-50 p-3 rounded-lg text-center"><p className="text-xl font-bold text-orange-700">3</p><p className="text-xs">Attente</p></div>
            <div className="bg-red-50 p-3 rounded-lg text-center"><p className="text-xl font-bold text-red-700">2</p><p className="text-xs">Retard</p></div>
            <div className="bg-blue-50 p-3 rounded-lg text-center"><p className="text-xl font-bold text-blue-700">67K</p><p className="text-xs">CA</p></div>
          </div>
          <div className="space-y-2">
            {[{ref:'FAC-045',cl:'Société ABC',m:'12,500 TND',bg:'bg-green-100 text-green-700',s:'Payée'},{ref:'FAC-044',cl:'StartTech',m:'8,750 TND',bg:'bg-orange-100 text-orange-700',s:'Attente'},{ref:'FAC-041',cl:'Digital Plus',m:'3,200 TND',bg:'bg-red-100 text-red-700',s:'Retard'}].map((f,i)=>(
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div><p className="font-medium">{f.ref}</p><p className="text-sm text-gray-500">{f.cl}</p></div>
                <span className="font-semibold">{f.m}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${f.bg}`}>{f.s}</span>
              </div>))}
          </div>
        </div>
      </div>
    )}
  ]},
  'multi-branches': { title: 'Multi-branches', description: 'Gérez plusieurs sites', screens: [
    { title: 'Vue consolidée', description: 'Tous vos sites', component: (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-4 text-white"><h3 className="text-lg font-bold">Multi-Branches</h3><p className="text-sm text-white/80">4 branches • 245,000 TND</p></div>
        <div className="p-4 space-y-3">
          {[{n:'Siège Tunis',ca:'120K',e:25,p:'+15%',g:true},{n:'Agence Sfax',ca:'65K',e:12,p:'+8%',g:true},{n:'Agence Sousse',ca:'42K',e:8,p:'-3%',g:false},{n:'Agence Monastir',ca:'18K',e:5,p:'+22%',g:true}].map((b,i)=>(
            <div key={i} className="flex items-center gap-4 p-4 border rounded-xl">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center"><Layers className="w-6 h-6 text-purple-600"/></div>
              <div className="flex-1"><p className="font-semibold">{b.n}</p><p className="text-sm text-gray-500">{b.e} employés</p></div>
              <p className="font-bold">{b.ca} TND</p>
              <span className={`px-2 py-1 rounded-full text-sm ${b.g?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{b.p}</span>
            </div>))}
        </div>
      </div>
    )}
  ]},
  'tableau-financier': { title: 'Tableau Financier Avancé', description: 'KPIs personnalisés', screens: [
    { title: 'Dashboard', description: 'KPIs en temps réel', component: (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-4 text-white"><p className="text-sm opacity-80">Croissance</p><p className="text-3xl font-bold">+23.5%</p><div className="flex items-center gap-1 text-sm mt-1"><ArrowUpRight className="w-4 h-4"/><span>vs mois dernier</span></div></div>
          <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-4 text-white"><p className="text-sm opacity-80">Marge nette</p><p className="text-3xl font-bold">34.2%</p><div className="flex items-center gap-1 text-sm mt-1"><ArrowUpRight className="w-4 h-4"/><span>+2.1 pts</span></div></div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-4 text-white"><p className="text-sm opacity-80">CAC</p><p className="text-3xl font-bold">45 TND</p><div className="flex items-center gap-1 text-sm mt-1"><ArrowDownRight className="w-4 h-4"/><span>-12%</span></div></div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl p-4 text-white"><p className="text-sm opacity-80">LTV/CAC</p><p className="text-3xl font-bold">4.8x</p><div className="flex items-center gap-1 text-sm mt-1"><ArrowUpRight className="w-4 h-4"/><span>Excellent</span></div></div>
        </div>
        <div className="h-32 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl flex items-end justify-center gap-2 p-4">
          {[30,45,38,55,48,65,58,72,68,80,75,90].map((v,i)=>(<div key={i} className="flex-1 bg-gradient-to-t from-blue-600 to-purple-500 rounded-t" style={{height:`${v}%`}}/>))}
        </div>
      </div>
    )}
  ]}
};

export const marketingDemos = {
  'creation-site': { title: 'Création Site Web', description: 'Créez votre site web startup', screens: [
    { title: 'Templates modernes', description: '12 templates pour startups tunisiennes', component: (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 text-white"><h3 className="text-lg font-bold">🎨 Choisissez votre template</h3></div>
        <div className="p-4 grid grid-cols-3 gap-4">
          {[{n:'SaaS Modern',c:'from-blue-400 to-indigo-600',i:'💻'},{n:'E-commerce',c:'from-green-400 to-emerald-600',i:'🛒'},{n:'Portfolio',c:'from-purple-400 to-pink-600',i:'🎨'},{n:'Restaurant',c:'from-orange-400 to-red-600',i:'🍽️'},{n:'Agence',c:'from-cyan-400 to-blue-600',i:'🏢'},{n:'Blog',c:'from-rose-400 to-red-600',i:'📰'}].map((t,i)=>(
            <div key={i} className="border rounded-xl overflow-hidden hover:shadow-lg cursor-pointer group">
              <div className={`h-24 bg-gradient-to-br ${t.c} flex items-center justify-center text-3xl`}>{t.i}</div>
              <div className="p-3"><p className="font-medium text-sm">{t.n}</p></div>
            </div>))}
        </div>
      </div>
    )},
    { title: 'SEO & Domaine .tn', description: 'Optimisé pour la Tunisie', component: (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3"><Globe className="w-6 h-6 text-green-600"/><div><p className="font-semibold text-green-800">votre-startup.tn</p><p className="text-sm text-green-600">SSL activé ✓</p></div></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[{l:'Performance',s:95},{l:'Accessibilité',s:92},{l:'SEO',s:88},{l:'Bonnes pratiques',s:90}].map((x,i)=>(
            <div key={i} className="p-3 bg-gray-50 rounded-lg"><div className="flex justify-between"><span className="text-sm">{x.l}</span><span className="font-bold">{x.s}/100</span></div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2"><div className={`${x.s>=90?'bg-green-500':'bg-blue-500'} rounded-full h-2`} style={{width:`${x.s}%`}}/></div></div>))}
        </div>
      </div>
    )}
  ]},
  'creation-app': { title: 'Création App Mobile', description: 'Application iOS & Android', screens: [
    { title: 'Design de votre app', description: 'Interface moderne', component: (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-center gap-8">
          <div className="w-48 h-80 bg-gray-900 rounded-3xl p-2 shadow-2xl">
            <div className="w-full h-full bg-gradient-to-b from-primary-500 to-indigo-600 rounded-2xl p-3 flex flex-col">
              <div className="flex justify-between items-center mb-4"><span className="text-white text-xs font-bold">VotreApp</span><div className="w-6 h-6 bg-white/20 rounded-full"/></div>
              <div className="bg-white/20 rounded-xl p-3 mb-3"><p className="text-white text-xs">Bienvenue 👋</p><p className="text-white text-sm font-bold">Sahar</p></div>
              <div className="grid grid-cols-2 gap-2 mb-3">{['📊 Stats','💰 Ventes','👥 Clients','📦 Stock'].map((x,i)=>(<div key={i} className="bg-white/20 rounded-lg p-2 text-center"><p className="text-white text-xs">{x}</p></div>))}</div>
              <div className="flex-1 bg-white/10 rounded-xl"/>
            </div>
          </div>
          <div className="space-y-4">
            {[{l:'iOS & Android',d:'Une seule codebase'},{l:'Push Notifications',d:'Engagez vos utilisateurs'},{l:'Mode hors-ligne',d:'Sans internet'},{l:'Paiement mobile',d:'D17, Flouci, carte'}].map((f,i)=>(
              <div key={i} className="flex items-center gap-3"><CheckCircle className="w-6 h-6 text-green-500"/><div><p className="font-medium">{f.l}</p><p className="text-sm text-gray-500">{f.d}</p></div></div>))}
          </div>
        </div>
      </div>
    )}
  ]},
  'seo-tunisie': { title: 'SEO Tunisie', description: 'Référencement local', screens: [
    { title: 'Audit SEO', description: 'Analyse de votre site', component: (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 p-4 text-white flex justify-between items-center">
          <div><h3 className="text-lg font-bold">Audit SEO</h3><p className="text-sm text-white/80">votre-startup.tn</p></div>
          <div className="text-center"><p className="text-3xl font-bold">72</p><p className="text-xs">/100</p></div>
        </div>
        <div className="p-4 space-y-3">
          {[{l:'Balises meta',s:85,st:'✅',d:'12/14 pages'},{l:'Vitesse',s:68,st:'⚠️',d:'3.2s'},{l:'Mobile',s:95,st:'✅',d:'OK'},{l:'Backlinks',s:42,st:'❌',d:'8 liens'},{l:'Google My Business',s:60,st:'⚠️',d:'Incomplet'}].map((x,i)=>(
            <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
              <span className="text-lg">{x.st}</span>
              <div className="flex-1"><p className="font-medium">{x.l}</p><p className="text-xs text-gray-500">{x.d}</p></div>
              <div className="w-20"><div className="w-full bg-gray-200 rounded-full h-2"><div className={`h-2 rounded-full ${x.s>=80?'bg-green-500':x.s>=60?'bg-orange-500':'bg-red-500'}`} style={{width:`${x.s}%`}}/></div></div>
              <span className="font-bold text-sm">{x.s}</span>
            </div>))}
        </div>
      </div>
    )},
    { title: 'Positionnement Google.tn', description: 'Suivi mots-clés', component: (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h4 className="font-bold mb-4">🔍 Positions Google.tn</h4>
        <div className="space-y-2">
          {[{m:'startup tunisie',p:3,c:'+2'},{m:'comptabilité startup',p:7,c:'+5'},{m:'logiciel gestion tunisie',p:12,c:'+8'},{m:'gestion paie tunisie',p:5,c:'+3'}].map((k,i)=>(
            <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${k.p<=5?'bg-green-100 text-green-700':k.p<=10?'bg-orange-100 text-orange-700':'bg-gray-200 text-gray-600'}`}>{k.p}</span>
              <p className="flex-1 font-medium">{k.m}</p>
              <span className="text-sm font-semibold text-green-600">{k.c}</span>
            </div>))}
        </div>
      </div>
    )}
  ]},
  'facebook-ads': { title: 'Sponsoring Facebook Ads', description: 'Publicités Facebook', screens: [
    { title: 'Dashboard campagnes', description: 'Performance temps réel', component: (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white flex justify-between items-center">
          <div><h3 className="text-lg font-bold">📱 Facebook Ads</h3><p className="text-sm text-white/80">3 campagnes actives</p></div>
          <button className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium text-sm">+ Campagne</button>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center"><p className="text-xs text-blue-600">Dépensé</p><p className="text-xl font-bold text-blue-700">2,450</p></div>
            <div className="bg-green-50 p-3 rounded-lg text-center"><p className="text-xs text-green-600">Revenus</p><p className="text-xl font-bold text-green-700">12,300</p></div>
            <div className="bg-purple-50 p-3 rounded-lg text-center"><p className="text-xs text-purple-600">ROAS</p><p className="text-xl font-bold text-purple-700">5.02x</p></div>
            <div className="bg-orange-50 p-3 rounded-lg text-center"><p className="text-xs text-orange-600">Leads</p><p className="text-xl font-bold text-orange-700">234</p></div>
          </div>
          <div className="space-y-3">
            {[{n:'Promo Ramadan',b:'1,200 TND',l:156,r:'6.2x'},{n:'Lancement produit',b:'800 TND',l:52,r:'3.8x'},{n:'Retargeting',b:'450 TND',l:26,r:'4.5x'}].map((c,i)=>(
              <div key={i} className="p-3 border rounded-lg">
                <div className="flex justify-between mb-1"><div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/><p className="font-medium">{c.n}</p></div><span className="text-sm font-semibold text-purple-600">ROAS {c.r}</span></div>
                <div className="text-sm text-gray-600">Budget: {c.b} • Leads: {c.l}</div>
              </div>))}
          </div>
        </div>
      </div>
    )}
  ]},
  'email-marketing': { title: 'Email Marketing', description: 'Campagnes email', screens: [
    { title: 'Dashboard', description: 'Statistiques campagnes', component: (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-pink-600 to-rose-600 p-4 text-white"><h3 className="text-lg font-bold">✉️ Email Marketing</h3><p className="text-sm text-white/80">3,450 contacts</p></div>
        <div className="p-4">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center"><p className="text-xs">Envoyés</p><p className="text-xl font-bold text-blue-700">12,450</p></div>
            <div className="bg-green-50 p-3 rounded-lg text-center"><p className="text-xs">Ouverture</p><p className="text-xl font-bold text-green-700">34.5%</p></div>
            <div className="bg-purple-50 p-3 rounded-lg text-center"><p className="text-xs">Clics</p><p className="text-xl font-bold text-purple-700">8.2%</p></div>
            <div className="bg-orange-50 p-3 rounded-lg text-center"><p className="text-xs">Conversions</p><p className="text-xl font-bold text-orange-700">156</p></div>
          </div>
          <div className="space-y-2">
            {[{n:'Newsletter Mars',s:'3,450',o:'38%',c:'12%'},{n:'Promo Printemps',s:'2,800',o:'42%',c:'15%'},{n:'Bienvenue',s:'320',o:'65%',c:'22%'}].map((x,i)=>(
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-pink-500"/><p className="font-medium text-sm">{x.n}</p></div>
                <span className="text-xs text-gray-500">{x.s}</span><span className="text-xs text-green-600">{x.o}</span><span className="text-xs text-purple-600">{x.c}</span>
              </div>))}
          </div>
        </div>
      </div>
    )}
  ]},
  'landing-pages': { title: 'Landing Pages', description: 'Pages optimisées conversion', screens: [
    { title: 'Builder Drag & Drop', description: 'Créez sans coder', component: (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex gap-4">
          <div className="w-12 bg-gray-50 rounded-lg p-2 space-y-2">
            {['H1','¶','🖼','▶','📋','⬜'].map((el,i)=>(<div key={i} className="w-8 h-8 bg-white border rounded flex items-center justify-center text-xs cursor-pointer hover:border-primary-400">{el}</div>))}
          </div>
          <div className="flex-1 border-2 border-primary-200 rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-6 text-white text-center">
              <h3 className="text-xl font-bold mb-2">Lancez votre startup</h3>
              <p className="text-sm text-white/80 mb-4">Plateforme tout-en-un</p>
              <button className="px-6 py-2 bg-white text-primary-600 rounded-lg font-semibold text-sm">Commencer →</button>
            </div>
            <div className="p-4 grid grid-cols-3 gap-3">
              {[{n:'500+',l:'Startups'},{n:'98%',l:'Satisfaction'},{n:'24/7',l:'Support'}].map((s,i)=>(<div key={i} className="text-center p-2 bg-gray-50 rounded-lg"><p className="text-lg font-bold text-primary-600">{s.n}</p><p className="text-xs text-gray-500">{s.l}</p></div>))}
            </div>
          </div>
        </div>
      </div>
    )},
    { title: 'A/B Testing', description: 'Optimisez conversions', component: (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="grid grid-cols-2 gap-6">
          <div className="border-2 border-green-300 rounded-xl p-4 relative">
            <span className="absolute -top-3 left-4 bg-green-500 text-white px-3 py-0.5 rounded-full text-xs font-bold">GAGNANT ✓</span>
            <h5 className="font-bold mb-2">Variante A</h5>
            <div className="bg-green-50 rounded-lg p-3 mb-3"><div className="h-6 bg-green-600 rounded w-2/3 mb-2"/><div className="h-3 bg-gray-200 rounded mb-1"/><div className="h-8 bg-green-600 rounded w-1/2"/></div>
            <div className="grid grid-cols-2 gap-2 text-center text-sm"><div className="bg-green-50 p-2 rounded"><p className="font-bold text-green-600">12.4%</p><p className="text-xs">Conv.</p></div><div className="bg-green-50 p-2 rounded"><p className="font-bold text-green-600">1,240</p><p className="text-xs">Visiteurs</p></div></div>
          </div>
          <div className="border rounded-xl p-4">
            <h5 className="font-bold mb-2 mt-1">Variante B</h5>
            <div className="bg-gray-50 rounded-lg p-3 mb-3"><div className="h-6 bg-blue-600 rounded w-1/2 mb-2"/><div className="h-3 bg-gray-200 rounded mb-1"/><div className="h-8 bg-blue-600 rounded w-2/3"/></div>
            <div className="grid grid-cols-2 gap-2 text-center text-sm"><div className="bg-gray-50 p-2 rounded"><p className="font-bold text-gray-600">8.7%</p><p className="text-xs">Conv.</p></div><div className="bg-gray-50 p-2 rounded"><p className="font-bold text-gray-600">1,180</p><p className="text-xs">Visiteurs</p></div></div>
          </div>
        </div>
      </div>
    )}
  ]}
};
