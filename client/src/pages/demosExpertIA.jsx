import { Download, Search, Database, Activity, Zap } from 'lucide-react';

export const expertDemos = {
  'acces-expert': { title: 'Accès Collaboratif Expert', description: 'Invitez votre expert-comptable', screens: [
    { title: 'Espace collaboratif', description: 'Collaboration temps réel', component: (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-4 text-white"><h3 className="text-lg font-bold">👨‍💼 Espace Expert-Comptable</h3></div>
        <div className="p-4">
          <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl mb-4">
            <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center text-white text-xl font-bold">EC</div>
            <div className="flex-1"><p className="font-semibold">Cabinet Hamdi & Associés</p><p className="text-sm text-gray-600">expert@cabinet-hamdi.tn</p><p className="text-xs text-green-600 mt-1">● En ligne</p></div>
          </div>
          <div className="space-y-2">
            {[{p:'Voir les transactions',a:true},{p:'Commenter',a:true},{p:'Valider documents',a:true},{p:'Exporter données',a:false},{p:'Modifier écritures',a:false}].map((x,i)=>(
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm">{x.p}</span>
                <div className={`w-10 h-6 rounded-full ${x.a?'bg-green-500':'bg-gray-300'} flex items-center ${x.a?'justify-end':'justify-start'} px-1`}><div className="w-4 h-4 bg-white rounded-full shadow"/></div>
              </div>))}
          </div>
        </div>
      </div>
    )}
  ]},
  'validation-factures': { title: 'Validation Factures', description: 'Double validation', screens: [
    { title: 'Workflow validation', description: 'Sécurité renforcée', component: (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6"><h4 className="font-bold">Factures en attente</h4><span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">5 en attente</span></div>
        <div className="space-y-3">
          {[{r:'FAC-089',f:'TechParts',m:'4,500 TND',v1:true,v2:false},{r:'FAC-088',f:'Bureau Plus',m:'1,200 TND',v1:true,v2:true},{r:'FAC-087',f:'CleanPro',m:'650 TND',v1:false,v2:false}].map((x,i)=>(
            <div key={i} className="p-4 border rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div><p className="font-medium">{x.r} - {x.f}</p><p className="text-sm text-gray-500">{x.m}</p></div>
                {x.v1&&x.v2?<span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">✓ Validée</span>:<span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">En cours</span>}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${x.v1?'bg-green-500':'bg-gray-300'}`}>{x.v1?'✓':'1'}</div><span className="text-xs text-gray-500">Comptable</span></div>
                <div className="flex-1 h-0.5 bg-gray-200"/>
                <div className="flex items-center gap-2"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${x.v2?'bg-green-500':'bg-gray-300'}`}>{x.v2?'✓':'2'}</div><span className="text-xs text-gray-500">Expert</span></div>
              </div>
            </div>))}
        </div>
      </div>
    )}
  ]},
  'export-fec': { title: 'Export FEC', description: 'Format FEC standard', screens: [
    { title: 'Génération FEC', description: 'Conforme réglementation', component: (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 text-center">
          <Database className="w-16 h-16 text-purple-500 mx-auto mb-4"/>
          <h4 className="text-xl font-bold text-purple-800 mb-2">Fichier des Écritures Comptables</h4>
          <div className="grid grid-cols-3 gap-4 text-sm mb-4">
            <div className="bg-white p-3 rounded-lg"><p className="font-bold text-purple-600">1,245</p><p className="text-gray-500">Écritures</p></div>
            <div className="bg-white p-3 rounded-lg"><p className="font-bold text-purple-600">2026</p><p className="text-gray-500">Exercice</p></div>
            <div className="bg-white p-3 rounded-lg"><p className="font-bold text-purple-600">2.4 MB</p><p className="text-gray-500">Taille</p></div>
          </div>
          <button className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium"><Download className="w-5 h-5 inline mr-2"/>Télécharger FEC</button>
        </div>
      </div>
    )}
  ]},
  'tableau-fiscal': { title: 'Tableau Fiscal', description: 'Obligations fiscales', screens: [
    { title: 'Calendrier fiscal', description: 'Aucune échéance manquée', component: (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4 text-white"><h3 className="text-lg font-bold">📅 Calendrier Fiscal 2026</h3><p className="text-sm text-white/80">Prochaine échéance: 12 jours</p></div>
        <div className="p-4 space-y-3">
          {[{d:'15 Mars',o:'Déclaration TVA - Fév',m:'2,450 TND',s:'urgent'},{d:'25 Mars',o:'Acompte IS - T1',m:'3,800 TND',s:'soon'},{d:'15 Avril',o:'CNSS - T1',m:'28,196 TND',s:'planned'},{d:'28 Fév',o:'TVA - Janvier',m:'1,980 TND',s:'done'}].map((e,i)=>(
            <div key={i} className={`flex items-center gap-4 p-3 rounded-lg border ${e.s==='urgent'?'border-red-300 bg-red-50':e.s==='soon'?'border-orange-300 bg-orange-50':e.s==='done'?'border-green-300 bg-green-50':'border-gray-200'}`}>
              <div className="w-16 text-center"><p className="font-bold text-sm">{e.d}</p></div>
              <div className="flex-1"><p className="font-medium text-sm">{e.o}</p><p className="text-xs text-gray-500">{e.m}</p></div>
              <span className={`px-2 py-1 rounded-full text-xs ${e.s==='urgent'?'bg-red-200 text-red-800':e.s==='soon'?'bg-orange-200 text-orange-800':e.s==='done'?'bg-green-200 text-green-800':'bg-gray-200 text-gray-600'}`}>
                {e.s==='urgent'?'⚠️ Urgent':e.s==='soon'?'🔔 Bientôt':e.s==='done'?'✓ Fait':'📋 Planifié'}
              </span>
            </div>))}
        </div>
      </div>
    )}
  ]},
  'historique-transactions': { title: 'Historique Transactions', description: 'Recherche avancée', screens: [
    { title: 'Historique complet', description: 'Audit trail', component: (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-slate-700 to-slate-900 p-4 text-white"><h3 className="text-lg font-bold">🔍 Historique</h3><p className="text-sm text-white/80">2,456 transactions</p></div>
        <div className="p-4">
          <div className="flex gap-2 mb-4"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/><input className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm" placeholder="Rechercher..." disabled/></div></div>
          <div className="space-y-1">
            {[{d:'10/03',r:'TXN-2456',desc:'Vente produit A',m:'+3,500 TND',g:true},{d:'09/03',r:'TXN-2455',desc:'Achat fournitures',m:'-450 TND',g:false},{d:'08/03',r:'TXN-2454',desc:'Prestation conseil',m:'+2,800 TND',g:true},{d:'07/03',r:'TXN-2453',desc:'Loyer Mars',m:'-1,500 TND',g:false}].map((t,i)=>(
              <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500 w-14">{t.d}</span>
                <span className="text-xs font-mono text-gray-400 w-20">{t.r}</span>
                <span className="flex-1 text-sm">{t.desc}</span>
                <span className={`font-semibold text-sm ${t.g?'text-green-600':'text-red-600'}`}>{t.m}</span>
              </div>))}
          </div>
        </div>
      </div>
    )}
  ]}
};

export const iaDemos = {
  'score-sante': { title: 'Score Santé Financière', description: 'Évaluation IA', screens: [
    { title: 'Score global', description: 'Santé financière de votre startup', component: (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white text-center">
          <p className="text-sm text-white/80 mb-2">Score Santé Financière</p>
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="12"/><circle cx="60" cy="60" r="50" fill="none" stroke="white" strokeWidth="12" strokeDasharray="314" strokeDashoffset="63" strokeLinecap="round"/></svg>
            <div className="absolute inset-0 flex items-center justify-center"><span className="text-4xl font-bold">78</span></div>
          </div>
          <p className="text-lg font-semibold">Bonne santé 💪</p>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          {[{l:'Liquidité',s:85},{l:'Rentabilité',s:72},{l:'Endettement',s:90},{l:'Croissance',s:68},{l:'Trésorerie',s:75},{l:'Efficacité',s:82}].map((x,i)=>(
            <div key={i} className="p-3 border rounded-lg">
              <div className="flex justify-between mb-2"><span className="text-sm">{x.l}</span><span className="font-bold">{x.s}/100</span></div>
              <div className="w-full bg-gray-200 rounded-full h-2"><div className={`${x.s>=80?'bg-green-500':x.s>=70?'bg-blue-500':'bg-orange-500'} rounded-full h-2`} style={{width:`${x.s}%`}}/></div>
            </div>))}
        </div>
      </div>
    )},
    { title: 'Recommandations IA', description: 'Conseils personnalisés', component: (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h4 className="font-bold mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-red-500"/>Recommandations</h4>
        <div className="space-y-3">
          {[{i:'🔴',t:'Diversifiez revenus',d:'80% du CA = 1 client'},{i:'🟡',t:'Augmentez runway',d:'4.5 mois → visez 6+'},{i:'🟢',t:'Renégociez charges',d:'Télécom: -15% possible'},{i:'💡',t:'Benchmark',d:'Marge 5pts au-dessus secteur'}].map((r,i)=>(
            <div key={i} className="flex items-start gap-3 p-4 border rounded-xl"><span className="text-xl">{r.i}</span><div><p className="font-medium">{r.t}</p><p className="text-sm text-gray-600">{r.d}</p></div></div>))}
        </div>
      </div>
    )}
  ]},
  'prevision-cashflow': { title: 'Prévision Cashflow', description: 'Prédiction IA trésorerie', screens: [
    { title: 'Prévision 12 mois', description: 'Anticipez avec l\'IA', component: (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-4 text-white flex justify-between items-center">
          <div><h3 className="text-lg font-bold">🔮 Cashflow IA</h3><p className="text-sm text-white/80">Précision: 92%</p></div>
          <div className="text-right"><p className="text-sm text-white/60">Déc 2026</p><p className="text-2xl font-bold">+185K TND</p></div>
        </div>
        <div className="p-4">
          <div className="h-40 flex items-end gap-1 mb-4">
            {[{m:'Mar',v:45,r:true},{m:'Avr',v:52},{m:'Mai',v:48},{m:'Jun',v:58},{m:'Jul',v:42},{m:'Aoû',v:55},{m:'Sep',v:65},{m:'Oct',v:70},{m:'Nov',v:75},{m:'Déc',v:85}].map((d,i)=>(
              <div key={i} className="flex-1 text-center">
                <div className={`mx-auto rounded-t ${d.r?'bg-blue-600':'bg-blue-300 border-2 border-dashed border-blue-500'}`} style={{height:`${d.v*1.5}px`}}/>
                <p className="text-xs text-gray-500 mt-1">{d.m}</p>
              </div>))}
          </div>
          <div className="flex gap-6 text-sm"><div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-600 rounded"/><span>Réel</span></div><div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-300 border-2 border-dashed border-blue-500 rounded"/><span>Prévision IA</span></div></div>
        </div>
      </div>
    )},
    { title: 'Scénarios', description: 'Simulez l\'avenir', component: (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h4 className="font-bold mb-4">📊 Scénarios</h4>
        <div className="space-y-4">
          {[{n:'Optimiste',d:'Croissance 30%',m:'+245K',c:'green'},{n:'Réaliste',d:'Croissance 15%',m:'+185K',c:'blue'},{n:'Pessimiste',d:'Croissance 5%',m:'+120K',c:'orange'}].map((s,i)=>(
            <div key={i} className={`p-4 border-2 rounded-xl ${s.c==='green'?'border-green-200 bg-green-50':s.c==='blue'?'border-blue-200 bg-blue-50':'border-orange-200 bg-orange-50'}`}>
              <div className="flex justify-between"><div><p className="font-bold">{s.n}</p><p className="text-sm text-gray-600">{s.d}</p></div><p className={`text-xl font-bold ${s.c==='green'?'text-green-600':s.c==='blue'?'text-blue-600':'text-orange-600'}`}>{s.m} TND</p></div>
            </div>))}
        </div>
      </div>
    )}
  ]},
  'analyse-concurrence': { title: 'Analyse Concurrence', description: 'Veille concurrentielle', screens: [
    { title: 'Comparatif', description: 'Vous vs concurrents', component: (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-pink-600 p-4 text-white"><h3 className="text-lg font-bold">🏆 Analyse Concurrentielle</h3><p className="text-sm text-white/80">3 concurrents suivis</p></div>
        <div className="p-4">
          <div className="text-xs text-gray-500 grid grid-cols-4 gap-4 p-2 border-b mb-2"><span/><span className="text-center font-bold text-primary-600">Vous</span><span className="text-center">Concurrent A</span><span className="text-center">Concurrent B</span></div>
          {[{c:'Prix',v:'⭐⭐⭐⭐',a:'⭐⭐⭐',b:'⭐⭐⭐⭐⭐'},{c:'Fonctionnalités',v:'⭐⭐⭐⭐⭐',a:'⭐⭐⭐',b:'⭐⭐⭐⭐'},{c:'Support',v:'⭐⭐⭐⭐',a:'⭐⭐⭐⭐⭐',b:'⭐⭐⭐'},{c:'UX/Design',v:'⭐⭐⭐⭐⭐',a:'⭐⭐⭐',b:'⭐⭐⭐⭐'}].map((r,i)=>(
            <div key={i} className="grid grid-cols-4 gap-4 p-2 rounded-lg hover:bg-gray-50">
              <span className="font-medium text-sm">{r.c}</span>
              <span className="text-xs bg-primary-50 p-1 rounded text-center">{r.v}</span>
              <span className="text-xs p-1 rounded text-center">{r.a}</span>
              <span className="text-xs p-1 rounded text-center">{r.b}</span>
            </div>))}
        </div>
      </div>
    )}
  ]},
  'analyse-marche': { title: 'Analyse Marché', description: 'Études de marché IA', screens: [
    { title: 'Tendances', description: 'Analyse de votre secteur', component: (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-700 p-4 text-white"><h3 className="text-lg font-bold">📊 Analyse Marché IA</h3><p className="text-sm text-white/80">Tech / SaaS Tunisie</p></div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-center"><p className="text-sm text-green-600">Taille</p><p className="text-xl font-bold text-green-700">245M</p><p className="text-xs text-green-600">+18%/an</p></div>
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-center"><p className="text-sm text-blue-600">Votre part</p><p className="text-xl font-bold text-blue-700">0.8%</p><p className="text-xs">Potentiel: 3%</p></div>
            <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg text-center"><p className="text-sm text-purple-600">Concurrents</p><p className="text-xl font-bold text-purple-700">12</p></div>
          </div>
          <h4 className="font-semibold text-sm mb-3">Opportunités IA</h4>
          {[{o:'PME sous-desservi',p:'78%'},{o:'Digitalisation post-COVID',p:'85%'},{o:'Expansion Afrique Nord',p:'45%'}].map((x,i)=>(
            <div key={i} className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg mb-2">
              <Zap className="w-5 h-5 text-indigo-600"/>
              <p className="flex-1 font-medium text-sm">{x.o}</p>
              <span className="text-xs font-bold text-indigo-600">{x.p}</span>
            </div>))}
        </div>
      </div>
    )}
  ]},
  'prediction-ventes': { title: 'Prédiction Ventes', description: 'Prévisions ML', screens: [
    { title: 'Prédictions ML', description: 'Basées sur vos données', component: (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-700 p-4 text-white flex justify-between items-center">
          <div><h3 className="text-lg font-bold">🤖 Prédiction Ventes</h3><p className="text-sm text-white/80">Précision: 87%</p></div>
          <div className="text-right"><p className="text-sm text-white/60">Prévision Q2</p><p className="text-2xl font-bold">+42%</p></div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-cyan-50 p-3 rounded-lg text-center"><p className="text-sm text-cyan-600">Ventes prévues</p><p className="text-xl font-bold text-cyan-700">89K TND</p></div>
            <div className="bg-green-50 p-3 rounded-lg text-center"><p className="text-sm text-green-600">Croissance</p><p className="text-xl font-bold text-green-700">+42%</p></div>
            <div className="bg-purple-50 p-3 rounded-lg text-center"><p className="text-sm text-purple-600">Confiance</p><p className="text-xl font-bold text-purple-700">87%</p></div>
          </div>
          <div className="space-y-2">
            {[{p:'Produit A',prev:'35,000 TND',g:'+28%',conf:'92%'},{p:'Produit B',prev:'28,000 TND',g:'+55%',conf:'85%'},{p:'Service C',prev:'26,000 TND',g:'+38%',conf:'88%'}].map((x,i)=>(
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <p className="font-medium">{x.p}</p>
                <span className="font-semibold">{x.prev}</span>
                <span className="text-green-600 font-medium">{x.g}</span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Confiance: {x.conf}</span>
              </div>))}
          </div>
        </div>
      </div>
    )}
  ]}
};
