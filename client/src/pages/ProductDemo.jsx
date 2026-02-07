import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Check, Play, Star, Lock, Calculator, 
  TrendingUp, TrendingDown, PieChart, FileText, 
  Receipt, BarChart3, Download, Users, Briefcase, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const ProductDemo = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [userProduct, setUserProduct] = useState(null);

  // Mapping des produits vers leurs pages réelles
  const productRedirects = {
    'bilan-auto': '/comptabilite/bilan',
    'comptabilite-lite': '/comptabilite',
    'comptabilite-pro': '/comptabilite',
    'tva-tunisie': '/comptabilite/tva',
    'export-expert': '/comptabilite/export',
    'pack-comptabilite-complet': '/comptabilite'
  };

  useEffect(() => {
    fetchProduct();
    checkUserProduct();
  }, [slug]);

  const checkUserProduct = async () => {
    try {
      const res = await api.get('/products/my-products');
      const found = res.data.products?.find(p => p.slug === slug);
      if (found) {
        setUserProduct(found);
      }
    } catch (error) {
      // Ignore if not logged in
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/product/${slug}`);
      setProduct(res.data.product);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Produit non trouvé');
      navigate('/entreprise/produits-solutions');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    if (user?.subscription !== 'enterprise') {
      toast.error('Cette fonctionnalité nécessite un abonnement Enterprise');
      navigate('/pricing');
      return;
    }

    setActivating(true);
    try {
      await api.post('/products/activate', { productId: product.id, duration: 1 });
      toast.success('Demande envoyée ! En attente d\'approbation.');
      navigate('/mes-offres');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    } finally {
      setActivating(false);
    }
  };

  const getDemoContent = () => {
    if (!product) return null;

    // Demo content based on product slug
    const demos = {
      'comptabilite-lite': {
        title: 'StartUp Comptabilité Lite',
        description: 'Comptabilité simplifiée pour les petites startups',
        screens: [
          {
            title: 'Tableau de bord mensuel',
            description: 'Visualisez vos revenus et dépenses en un coup d\'œil',
            component: (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600">Revenus</p>
                    <p className="text-2xl font-bold text-green-700">12,450 TND</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-sm text-red-600">Dépenses</p>
                    <p className="text-2xl font-bold text-red-700">8,320 TND</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600">Bénéfice</p>
                    <p className="text-2xl font-bold text-blue-700">4,130 TND</p>
                  </div>
                </div>
                <div className="h-32 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-16 h-16 text-primary-400" />
                </div>
              </div>
            )
          },
          {
            title: 'Saisie revenus/dépenses',
            description: 'Ajoutez vos transactions facilement',
            component: (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex gap-2 mb-4">
                  <button className="flex-1 py-3 bg-green-500 text-white rounded-lg font-medium">
                    <TrendingUp className="w-5 h-5 inline mr-2" />
                    Revenu
                  </button>
                  <button className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-lg font-medium">
                    <TrendingDown className="w-5 h-5 inline mr-2" />
                    Dépense
                  </button>
                </div>
                <div className="space-y-3">
                  <input className="w-full p-3 border rounded-lg" placeholder="Catégorie: Ventes produits" disabled />
                  <input className="w-full p-3 border rounded-lg" placeholder="Montant: 1,500 TND" disabled />
                  <input className="w-full p-3 border rounded-lg" placeholder="Date: 07/02/2026" disabled />
                </div>
              </div>
            )
          }
        ]
      },
      'comptabilite-pro': {
        title: 'StartUp Comptabilité Pro',
        description: 'Comptabilité complète avec bilan et prévisions',
        screens: [
          {
            title: 'Bilan automatique',
            description: 'Bilan actif/passif généré automatiquement',
            component: (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="grid grid-cols-2 gap-6">
                  <div className="border-r pr-6">
                    <h4 className="font-semibold text-green-600 mb-3">ACTIF</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span>Trésorerie</span><span className="font-medium">45,000 TND</span></div>
                      <div className="flex justify-between"><span>Créances clients</span><span className="font-medium">12,000 TND</span></div>
                      <div className="flex justify-between font-bold border-t pt-2"><span>Total Actif</span><span>57,000 TND</span></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-600 mb-3">PASSIF</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span>Dettes fournisseurs</span><span className="font-medium">8,000 TND</span></div>
                      <div className="flex justify-between"><span>Capitaux propres</span><span className="font-medium">49,000 TND</span></div>
                      <div className="flex justify-between font-bold border-t pt-2"><span>Total Passif</span><span>57,000 TND</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )
          },
          {
            title: 'Prévision financière',
            description: 'Anticipez votre trésorerie sur 12 mois',
            component: (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-end gap-2 h-40">
                  {[65, 72, 68, 85, 90, 88, 95, 102, 98, 110, 115, 125].map((val, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-primary-500 to-primary-300 rounded-t" 
                         style={{ height: `${val}%` }} />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Jan</span><span>Fév</span><span>Mar</span><span>Avr</span><span>Mai</span><span>Jun</span>
                  <span>Jul</span><span>Aoû</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Déc</span>
                </div>
              </div>
            )
          }
        ]
      },
      'bilan-auto': {
        title: 'Bilan Automatique',
        description: 'Génération automatique de bilans comptables',
        screens: [
          {
            title: 'Bilan Actif / Passif',
            description: 'Vue complète de votre situation financière',
            component: (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-4 text-white flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold">États Financiers</h3>
                    <p className="text-sm text-white/80">Bilan, compte de résultat et cash flow</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">07/02/2026</span>
                    <button className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      Exporter PDF
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex gap-4 mb-4 border-b">
                    <button className="px-4 py-2 border-b-2 border-primary-600 text-primary-600 font-medium">Bilan</button>
                    <button className="px-4 py-2 text-gray-500">Compte de Résultat</button>
                    <button className="px-4 py-2 text-gray-500">Cash Flow</button>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <h4 className="font-bold text-green-800">ACTIF</h4>
                        <span className="text-xs text-gray-500 ml-auto">Au 07/02/2026</span>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="text-green-700 font-medium">Actif Circulant</div>
                        <div className="flex justify-between pl-4">
                          <span>Trésorerie disponible</span>
                          <span className="font-bold text-green-600">600,00 TND</span>
                        </div>
                        <div className="text-green-700 font-medium mt-2">Détail par catégorie</div>
                        <div className="flex justify-between pl-4">
                          <span>Ventes produits</span>
                          <span>1200,00 TND</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t font-bold">
                          <span>TOTAL ACTIF</span>
                          <span className="text-green-600">600,00 TND</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <PieChart className="w-5 h-5 text-blue-600" />
                        <h4 className="font-bold text-blue-800">PASSIF</h4>
                        <span className="text-xs text-gray-500 ml-auto">Au 07/02/2026</span>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="text-blue-700 font-medium">Dettes</div>
                        <div className="flex justify-between pl-4">
                          <span>Dettes courantes</span>
                          <span>0,00 TND</span>
                        </div>
                        <div className="text-blue-700 font-medium mt-2">Capitaux Propres</div>
                        <div className="flex justify-between pl-4">
                          <span>Résultat cumulé</span>
                          <span className="font-bold text-blue-600">600,00 TND</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t font-bold">
                          <span>TOTAL PASSIF</span>
                          <span className="text-blue-600">600,00 TND</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          },
          {
            title: 'Compte de Résultat',
            description: 'Analyse des revenus et charges',
            component: (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="font-bold text-lg mb-4">Compte de Résultat - Exercice 2026</h4>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-green-700">Produits d'exploitation</span>
                      <span className="font-bold text-green-600">15,500 TND</span>
                    </div>
                    <div className="text-sm text-gray-600 pl-4 space-y-1">
                      <div className="flex justify-between"><span>Ventes de marchandises</span><span>12,000 TND</span></div>
                      <div className="flex justify-between"><span>Prestations de services</span><span>3,500 TND</span></div>
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-red-700">Charges d'exploitation</span>
                      <span className="font-bold text-red-600">-8,200 TND</span>
                    </div>
                    <div className="text-sm text-gray-600 pl-4 space-y-1">
                      <div className="flex justify-between"><span>Achats de matières</span><span>-4,500 TND</span></div>
                      <div className="flex justify-between"><span>Charges de personnel</span><span>-2,500 TND</span></div>
                      <div className="flex justify-between"><span>Autres charges</span><span>-1,200 TND</span></div>
                    </div>
                  </div>
                  <div className="bg-primary-50 p-4 rounded-lg border-2 border-primary-200">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-primary-700">Résultat Net</span>
                      <span className="font-bold text-2xl text-primary-600">+7,300 TND</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          },
          {
            title: 'Analyse automatique',
            description: 'Indicateurs et recommandations IA',
            component: (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="font-bold text-lg mb-4">Analyse Financière Automatique</h4>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">47%</p>
                    <p className="text-sm text-gray-600">Marge nette</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">1.8</p>
                    <p className="text-sm text-gray-600">Ratio liquidité</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-600">+23%</p>
                    <p className="text-sm text-gray-600">Croissance</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-primary-50 to-indigo-50 p-4 rounded-lg border border-primary-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm">IA</div>
                    <div>
                      <p className="font-medium text-primary-800">Recommandation IA</p>
                      <p className="text-sm text-gray-600 mt-1">Votre marge nette est excellente (47%). Considérez d'investir dans l'expansion pour maintenir cette croissance.</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          }
        ]
      },
      'tva-tunisie': {
        title: 'TVA Tunisie Auto',
        description: 'Calcul et déclaration TVA automatisés',
        screens: [
          {
            title: 'Calcul automatique TVA',
            description: 'TVA 19% et 7% calculées automatiquement',
            component: (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="bg-orange-50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-orange-700 font-medium">Période: Février 2026</span>
                    <span className="text-sm bg-orange-200 px-2 py-1 rounded">Taux: 19%</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span>TVA Collectée</span>
                    <span className="font-bold text-orange-600">2,365 TND</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span>TVA Déductible</span>
                    <span className="font-bold text-green-600">1,580 TND</span>
                  </div>
                  <div className="flex justify-between p-3 bg-red-50 rounded border border-red-200">
                    <span className="font-medium">TVA à payer</span>
                    <span className="font-bold text-red-600">785 TND</span>
                  </div>
                </div>
              </div>
            )
          }
        ]
      },
      'export-expert': {
        title: 'Export Expert-Comptable',
        description: 'Export de données pour votre expert-comptable',
        screens: [
          {
            title: 'Formats d\'export',
            description: 'FEC, Excel, PDF - Compatible tous logiciels',
            component: (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="grid grid-cols-3 gap-4">
                  <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 text-center hover:border-purple-500 cursor-pointer">
                    <FileText className="w-10 h-10 text-purple-500 mx-auto mb-2" />
                    <p className="font-medium">Format FEC</p>
                    <p className="text-xs text-gray-500">Standard légal</p>
                  </div>
                  <div className="border-2 border-dashed border-green-300 rounded-lg p-4 text-center hover:border-green-500 cursor-pointer">
                    <Download className="w-10 h-10 text-green-500 mx-auto mb-2" />
                    <p className="font-medium">Excel/CSV</p>
                    <p className="text-xs text-gray-500">Données brutes</p>
                  </div>
                  <div className="border-2 border-dashed border-red-300 rounded-lg p-4 text-center hover:border-red-500 cursor-pointer">
                    <FileText className="w-10 h-10 text-red-500 mx-auto mb-2" />
                    <p className="font-medium">PDF</p>
                    <p className="text-xs text-gray-500">Rapport complet</p>
                  </div>
                </div>
              </div>
            )
          }
        ]
      },
      'pack-comptabilite-complet': {
        title: 'Pack Comptabilité Complet',
        description: 'Toutes les solutions comptabilité en un seul pack',
        screens: [
          {
            title: 'Tableau de bord complet',
            description: 'Vue d\'ensemble de votre comptabilité',
            component: (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-4 text-white">
                    <p className="text-sm opacity-80">Revenus</p>
                    <p className="text-2xl font-bold">45,230 TND</p>
                    <p className="text-xs opacity-70">+12% ce mois</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-xl p-4 text-white">
                    <p className="text-sm opacity-80">Dépenses</p>
                    <p className="text-2xl font-bold">28,150 TND</p>
                    <p className="text-xs opacity-70">-5% ce mois</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-4 text-white">
                    <p className="text-sm opacity-80">Bénéfice Net</p>
                    <p className="text-2xl font-bold">17,080 TND</p>
                    <p className="text-xs opacity-70">Marge: 37.8%</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl p-4 text-white">
                    <p className="text-sm opacity-80">TVA à payer</p>
                    <p className="text-2xl font-bold">3,245 TND</p>
                    <p className="text-xs opacity-70">Échéance: 15/03</p>
                  </div>
                </div>
                <div className="h-40 bg-gradient-to-r from-primary-100 via-green-100 to-blue-100 rounded-xl flex items-center justify-center">
                  <div className="flex items-end gap-2 h-32">
                    {[40, 55, 45, 70, 65, 80, 75, 90, 85, 95, 88, 100].map((val, i) => (
                      <div key={i} className="w-6 bg-gradient-to-t from-primary-600 to-primary-400 rounded-t transition-all hover:from-primary-700"
                           style={{ height: `${val}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            )
          },
          {
            title: 'Bilan & Compte de résultat',
            description: 'États financiers générés automatiquement',
            component: (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="grid grid-cols-2 gap-6">
                  <div className="border rounded-xl p-4">
                    <h4 className="font-bold text-green-600 mb-4 flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      ACTIF
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-2 bg-green-50 rounded">
                        <span>Trésorerie</span>
                        <span className="font-semibold">125,000 TND</span>
                      </div>
                      <div className="flex justify-between p-2 bg-green-50 rounded">
                        <span>Créances clients</span>
                        <span className="font-semibold">45,000 TND</span>
                      </div>
                      <div className="flex justify-between p-2 bg-green-50 rounded">
                        <span>Stocks</span>
                        <span className="font-semibold">32,000 TND</span>
                      </div>
                      <div className="flex justify-between p-3 bg-green-200 rounded-lg font-bold">
                        <span>TOTAL ACTIF</span>
                        <span>202,000 TND</span>
                      </div>
                    </div>
                  </div>
                  <div className="border rounded-xl p-4">
                    <h4 className="font-bold text-blue-600 mb-4 flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      PASSIF
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-2 bg-blue-50 rounded">
                        <span>Dettes fournisseurs</span>
                        <span className="font-semibold">28,000 TND</span>
                      </div>
                      <div className="flex justify-between p-2 bg-blue-50 rounded">
                        <span>Emprunts</span>
                        <span className="font-semibold">50,000 TND</span>
                      </div>
                      <div className="flex justify-between p-2 bg-blue-50 rounded">
                        <span>Capitaux propres</span>
                        <span className="font-semibold">124,000 TND</span>
                      </div>
                      <div className="flex justify-between p-3 bg-blue-200 rounded-lg font-bold">
                        <span>TOTAL PASSIF</span>
                        <span>202,000 TND</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          },
          {
            title: 'TVA & Déclarations',
            description: 'Gestion automatique de la TVA tunisienne',
            component: (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <p className="text-sm text-orange-600">TVA Collectée (19%)</p>
                    <p className="text-xl font-bold text-orange-700">8,594 TND</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-sm text-green-600">TVA Déductible</p>
                    <p className="text-xl font-bold text-green-700">5,349 TND</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-sm text-red-600">TVA à Payer</p>
                    <p className="text-xl font-bold text-red-700">3,245 TND</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h5 className="font-semibold mb-3">Historique des déclarations</h5>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-white rounded border">
                      <span>Janvier 2026</span>
                      <span className="text-green-600 font-medium">✓ Déclarée</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded border">
                      <span>Février 2026</span>
                      <span className="text-orange-600 font-medium">⏳ En cours</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          },
          {
            title: 'Export & Partage',
            description: 'Exportez vos données pour votre expert-comptable',
            component: (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold mb-4">Formats disponibles</h5>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-purple-50 cursor-pointer">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Format FEC</p>
                          <p className="text-xs text-gray-500">Fichier des Écritures Comptables</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-green-50 cursor-pointer">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Download className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Excel / CSV</p>
                          <p className="text-xs text-gray-500">Données tabulaires</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-red-50 cursor-pointer">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">Rapport PDF</p>
                          <p className="text-xs text-gray-500">États financiers complets</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-4">Partage sécurisé</h5>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          EC
                        </div>
                        <div>
                          <p className="font-medium">Expert-Comptable</p>
                          <p className="text-sm text-gray-600">cabinet@exemple.tn</p>
                        </div>
                      </div>
                      <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium">
                        Envoyer les documents
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          }
        ]
      },
      'gestion-employes': {
        title: 'Gestion Employés',
        description: 'Gérez vos employés facilement',
        screens: [
          {
            title: 'Liste des employés',
            description: 'Vue d\'ensemble de votre équipe',
            component: (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold">Mes Employés</h3>
                      <p className="text-sm text-white/80">12 employés actifs</p>
                    </div>
                    <button className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium text-sm">
                      + Ajouter
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {[
                      { name: 'Ahmed Ben Ali', role: 'Développeur Senior', dept: 'IT', salary: '3,500 TND', status: 'Actif' },
                      { name: 'Fatma Trabelsi', role: 'Chef de Projet', dept: 'Management', salary: '4,200 TND', status: 'Actif' },
                      { name: 'Mohamed Sassi', role: 'Designer UI/UX', dept: 'Créatif', salary: '2,800 TND', status: 'Actif' },
                      { name: 'Sarra Karoui', role: 'Comptable', dept: 'Finance', salary: '2,500 TND', status: 'Congé' }
                    ].map((emp, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{emp.name}</p>
                          <p className="text-sm text-gray-500">{emp.role} • {emp.dept}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">{emp.salary}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${emp.status === 'Actif' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {emp.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          },
          {
            title: 'Fiche employé détaillée',
            description: 'Toutes les informations d\'un employé',
            component: (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-start gap-6 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                    AB
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">Ahmed Ben Ali</h3>
                    <p className="text-gray-600">Développeur Senior • IT</p>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">CDI</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">Temps plein</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Date d'embauche</p>
                    <p className="font-semibold">15/03/2023</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Salaire brut</p>
                    <p className="font-semibold text-green-600">3,500 TND</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">N° CNSS</p>
                    <p className="font-semibold">12345678</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Congés restants</p>
                    <p className="font-semibold">18 jours</p>
                  </div>
                </div>
              </div>
            )
          },
          {
            title: 'Documents employé',
            description: 'Contrats, attestations et documents RH',
            component: (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="font-bold mb-4">Documents de Ahmed Ben Ali</h4>
                <div className="space-y-3">
                  {[
                    { name: 'Contrat CDI', date: '15/03/2023', type: 'PDF', icon: '📄' },
                    { name: 'Attestation de travail', date: '01/02/2026', type: 'PDF', icon: '📋' },
                    { name: 'Fiche de paie - Janvier 2026', date: '31/01/2026', type: 'PDF', icon: '💰' },
                    { name: 'Certificat CNSS', date: '15/03/2023', type: 'PDF', icon: '🏛️' }
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-blue-50 cursor-pointer">
                      <span className="text-2xl">{doc.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-gray-500">{doc.date}</p>
                      </div>
                      <button className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-sm">
                        Télécharger
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        ]
      },
      'fiches-paie': {
        title: 'Fiches de Paie Auto',
        description: 'Génération automatique des fiches de paie',
        screens: [
          {
            title: 'Génération automatique',
            description: 'Fiches de paie calculées automatiquement',
            component: (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold">Fiches de Paie - Février 2026</h3>
                      <p className="text-sm text-white/80">12 fiches à générer</p>
                    </div>
                    <button className="px-4 py-2 bg-white text-green-600 rounded-lg font-medium text-sm">
                      Générer tout
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">12</p>
                      <p className="text-xs text-gray-600">Employés</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">36,500</p>
                      <p className="text-xs text-gray-600">Masse salariale</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-orange-600">3,285</p>
                      <p className="text-xs text-gray-600">CNSS</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-red-600">4,380</p>
                      <p className="text-xs text-gray-600">IRPP</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: 'Ahmed Ben Ali', brut: '3,500', net: '2,835', status: 'ready' },
                      { name: 'Fatma Trabelsi', brut: '4,200', net: '3,360', status: 'ready' },
                      { name: 'Mohamed Sassi', brut: '2,800', net: '2,310', status: 'pending' }
                    ].map((emp, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{emp.name}</p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-gray-500">Brut: {emp.brut} TND</p>
                          <p className="font-semibold text-green-600">Net: {emp.net} TND</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${emp.status === 'ready' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {emp.status === 'ready' ? '✓ Prête' : '⏳ En cours'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          },
          {
            title: 'Détail fiche de paie',
            description: 'Calcul détaillé avec retenues CNSS et IRPP',
            component: (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold">Fiche de Paie</h3>
                    <p className="text-gray-600">Ahmed Ben Ali - Février 2026</p>
                  </div>
                  <button className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    PDF
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-green-700">Salaire Brut</span>
                      <span className="font-bold text-green-600">3,500.00 TND</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex justify-between"><span>Salaire de base</span><span>3,200.00 TND</span></div>
                      <div className="flex justify-between"><span>Prime de rendement</span><span>300.00 TND</span></div>
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-red-700">Retenues</span>
                      <span className="font-bold text-red-600">-665.00 TND</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex justify-between"><span>CNSS (9.18%)</span><span>-321.30 TND</span></div>
                      <div className="flex justify-between"><span>IRPP</span><span>-343.70 TND</span></div>
                    </div>
                  </div>
                  <div className="bg-blue-100 p-4 rounded-lg border-2 border-blue-300">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-blue-800">Salaire Net à Payer</span>
                      <span className="font-bold text-2xl text-blue-600">2,835.00 TND</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          },
          {
            title: 'Export PDF professionnel',
            description: 'Fiches de paie au format légal tunisien',
            component: (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-red-500" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">Aperçu PDF</h4>
                  <p className="text-gray-600 mb-4">Format conforme à la législation tunisienne</p>
                  <div className="bg-gray-50 rounded-lg p-4 text-left text-sm max-w-sm mx-auto">
                    <p className="font-bold border-b pb-2 mb-2">BULLETIN DE PAIE</p>
                    <p>Entreprise: StartUpLab SARL</p>
                    <p>Employé: Ahmed Ben Ali</p>
                    <p>Période: Février 2026</p>
                    <p className="mt-2 font-semibold">Net à payer: 2,835.00 TND</p>
                  </div>
                </div>
              </div>
            )
          }
        ]
      },
      'declaration-cnss': {
        title: 'Déclaration CNSS',
        description: 'Déclarations CNSS automatisées',
        screens: [
          {
            title: 'Calcul des cotisations',
            description: 'Cotisations CNSS calculées automatiquement',
            component: (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold">Déclaration CNSS</h3>
                      <p className="text-sm text-white/80">Trimestre 1 - 2026</p>
                    </div>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                      Échéance: 15/04/2026
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600">Masse salariale</p>
                      <p className="text-xl font-bold text-blue-600">109,500 TND</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600">Part patronale (16.57%)</p>
                      <p className="text-xl font-bold text-orange-600">18,144 TND</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600">Part salariale (9.18%)</p>
                      <p className="text-xl font-bold text-green-600">10,052 TND</p>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-amber-800">Total à déclarer</p>
                        <p className="text-sm text-amber-600">Part patronale + Part salariale</p>
                      </div>
                      <p className="text-2xl font-bold text-amber-600">28,196 TND</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          },
          {
            title: 'Déclaration trimestrielle',
            description: 'Formulaire DS conforme CNSS',
            component: (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">🏛️</span>
                  Déclaration de Salaires (DS)
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">N° Employeur CNSS</p>
                      <p className="font-semibold">12345-67</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Trimestre</p>
                      <p className="font-semibold">T1 2026</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Nombre d'employés</p>
                      <p className="font-semibold">12</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Jours déclarés</p>
                      <p className="font-semibold">1,080</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {['Janvier 2026', 'Février 2026', 'Mars 2026'].map((month, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <span>{month}</span>
                      <span className="font-semibold">36,500 TND</span>
                      <span className="text-green-600">✓</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          },
          {
            title: 'Export formulaires',
            description: 'Génération des formulaires officiels',
            component: (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="font-bold mb-4">Formulaires à télécharger</h4>
                <div className="space-y-3">
                  {[
                    { name: 'Déclaration DS - T1 2026', desc: 'Déclaration trimestrielle des salaires', icon: '📋' },
                    { name: 'Bordereau de paiement', desc: 'À joindre avec le règlement', icon: '💳' },
                    { name: 'Liste nominative', desc: 'Détail par employé', icon: '📊' }
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-orange-50 cursor-pointer">
                      <span className="text-3xl">{doc.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-gray-500">{doc.desc}</p>
                      </div>
                      <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm">
                        Télécharger
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        ]
      },
      'gestion-conges': {
        title: 'Gestion Congés',
        description: 'Suivi des congés et absences',
        screens: [
          {
            title: 'Demandes en ligne',
            description: 'Les employés font leurs demandes en ligne',
            component: (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold">Demandes de Congés</h3>
                      <p className="text-sm text-white/80">3 demandes en attente</p>
                    </div>
                    <button className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium text-sm">
                      + Nouvelle demande
                    </button>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { emp: 'Ahmed Ben Ali', type: 'Congé annuel', dates: '15/03 - 22/03/2026', days: 6, status: 'pending' },
                    { emp: 'Fatma Trabelsi', type: 'Congé maladie', dates: '10/03 - 12/03/2026', days: 3, status: 'pending' },
                    { emp: 'Mohamed Sassi', type: 'Congé annuel', dates: '01/04 - 15/04/2026', days: 11, status: 'pending' }
                  ].map((req, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                        {req.emp.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{req.emp}</p>
                        <p className="text-sm text-gray-500">{req.type} • {req.dates}</p>
                      </div>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {req.days} jours
                      </span>
                      <div className="flex gap-2">
                        <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200">✓</button>
                        <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          },
          {
            title: 'Solde temps réel',
            description: 'Suivi des soldes de congés par employé',
            component: (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="font-bold mb-4">Soldes de congés</h4>
                <div className="space-y-4">
                  {[
                    { name: 'Ahmed Ben Ali', used: 6, remaining: 18, total: 24 },
                    { name: 'Fatma Trabelsi', used: 10, remaining: 14, total: 24 },
                    { name: 'Mohamed Sassi', used: 3, remaining: 21, total: 24 },
                    { name: 'Sarra Karoui', used: 15, remaining: 9, total: 24 }
                  ].map((emp, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{emp.name}</span>
                        <span className="text-sm text-gray-500">{emp.remaining}/{emp.total} jours restants</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                          style={{ width: `${(emp.used / emp.total) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{emp.used} jours pris</span>
                        <span>{emp.remaining} jours disponibles</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          },
          {
            title: 'Planning équipe',
            description: 'Vue calendrier des absences',
            component: (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold">Planning Mars 2026</h4>
                  <div className="flex gap-2">
                    <button className="p-2 border rounded-lg">←</button>
                    <button className="p-2 border rounded-lg">→</button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                    <div key={day} className="font-medium text-gray-500 py-2">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <div 
                      key={day} 
                      className={`p-2 text-center rounded-lg text-sm ${
                        [15, 16, 17, 18, 19, 20, 21, 22].includes(day) 
                          ? 'bg-purple-100 text-purple-700' 
                          : [10, 11, 12].includes(day)
                            ? 'bg-orange-100 text-orange-700'
                            : 'hover:bg-gray-100'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-100 rounded" />
                    <span>Ahmed (Congé annuel)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-100 rounded" />
                    <span>Fatma (Maladie)</span>
                  </div>
                </div>
              </div>
            )
          }
        ]
      },
      'signature-contrat': {
        title: 'Signature Contrat Digital',
        description: 'Signature électronique des contrats',
        screens: [
          {
            title: 'Signature légale',
            description: 'Signature électronique conforme à la loi tunisienne',
            component: (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold">Signature Électronique</h3>
                      <p className="text-sm text-white/80">Conforme à la loi n°2000-83</p>
                    </div>
                    <span className="px-3 py-1 bg-green-500 rounded-full text-sm flex items-center gap-1">
                      ✓ Certifié
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-4">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h4 className="font-bold text-lg mb-2">Contrat de Travail CDI</h4>
                    <p className="text-gray-600 mb-4">Ahmed Ben Ali - Développeur Senior</p>
                    <div className="flex justify-center gap-4">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                          ✓
                        </div>
                        <p className="text-xs text-gray-500">Employeur</p>
                        <p className="text-xs font-medium text-green-600">Signé</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-1">
                          ⏳
                        </div>
                        <p className="text-xs text-gray-500">Employé</p>
                        <p className="text-xs font-medium text-yellow-600">En attente</p>
                      </div>
                    </div>
                  </div>
                  <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700">
                    Envoyer pour signature
                  </button>
                </div>
              </div>
            )
          },
          {
            title: 'Horodatage',
            description: 'Preuve de date et heure certifiée',
            component: (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  Horodatage Certifié
                </h4>
                <div className="bg-indigo-50 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Date de signature</p>
                      <p className="font-semibold">07/02/2026 à 14:32:15</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fuseau horaire</p>
                      <p className="font-semibold">UTC+1 (Tunis)</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Hash SHA-256</p>
                      <p className="font-mono text-xs">a3f2b8c9...</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Certificat</p>
                      <p className="font-semibold text-green-600">✓ Valide</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                    ✓
                  </div>
                  <div>
                    <p className="font-medium text-green-800">Document authentique</p>
                    <p className="text-sm text-green-600">Intégrité vérifiée et horodatage certifié</p>
                  </div>
                </div>
              </div>
            )
          },
          {
            title: 'Archivage sécurisé',
            description: 'Conservation légale des contrats signés',
            component: (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="font-bold mb-4">📁 Archives des Contrats</h4>
                <div className="space-y-3">
                  {[
                    { name: 'CDI - Ahmed Ben Ali', date: '15/03/2023', status: 'signed', parties: 2 },
                    { name: 'CDI - Fatma Trabelsi', date: '01/06/2023', status: 'signed', parties: 2 },
                    { name: 'CDD - Mohamed Sassi', date: '01/01/2026', status: 'signed', parties: 2 },
                    { name: 'Avenant - Ahmed Ben Ali', date: '01/02/2026', status: 'pending', parties: 1 }
                  ].map((contract, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        contract.status === 'signed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {contract.status === 'signed' ? '✓' : '⏳'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{contract.name}</p>
                        <p className="text-sm text-gray-500">{contract.date} • {contract.parties}/2 signatures</p>
                      </div>
                      <button className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-100">
                        Voir
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        ]
      }
    };

    return demos[product.slug] || {
      title: product.name,
      description: product.description,
      screens: [{
        title: 'Aperçu',
        description: 'Découvrez les fonctionnalités de ce module',
        component: (
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <Calculator className="w-16 h-16 text-primary-500 mx-auto mb-4" />
            <p className="text-gray-600">Démonstration bientôt disponible</p>
          </div>
        )
      }]
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const demo = getDemoContent();
  const features = Array.isArray(product?.features) ? product.features : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/entreprise/produits-solutions" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{demo.title}</h1>
          <p className="text-gray-600">{demo.description}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-primary-600">{product?.price} TND<span className="text-sm text-gray-500">/mois</span></p>
          <p className="text-sm text-gray-500">Plan requis: {product?.requiredPlan}</p>
        </div>
      </div>

      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
            <Play className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">Démonstration interactive</h2>
            <p className="text-white/80">Découvrez les fonctionnalités avant d'activer</p>
          </div>
          {userProduct?.status === 'active' ? (
            <Link
              to={productRedirects[slug] || '/mes-offres'}
              className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              Accéder à la fonctionnalité
            </Link>
          ) : userProduct?.status === 'pending' ? (
            <div className="px-6 py-3 bg-yellow-500 text-white rounded-xl font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5" />
              En attente d'approbation
            </div>
          ) : user?.subscription === 'enterprise' ? (
            <button
              onClick={handleActivate}
              disabled={activating}
              className="px-6 py-3 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              {activating ? 'Envoi...' : 'Activer maintenant'}
            </button>
          ) : (
            <Link
              to="/pricing"
              className="px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors flex items-center gap-2"
            >
              <Lock className="w-5 h-5" />
              Passer à Enterprise
            </Link>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Fonctionnalités incluses</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Demo Screens */}
      <div className="space-y-6">
        {demo.screens.map((screen, index) => (
          <div key={index} className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                {index + 1}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{screen.title}</h3>
                <p className="text-sm text-gray-500">{screen.description}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              {screen.component}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="card bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300">
        <div className="text-center py-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Prêt à commencer ?</h3>
          <p className="text-gray-600 mb-4">Activez ce module et commencez à gérer votre comptabilité</p>
          {userProduct?.status === 'active' ? (
            <Link to={productRedirects[slug] || '/mes-offres'} className="btn-primary px-8 py-3 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700">
              <Check className="w-5 h-5" />
              Accéder à la fonctionnalité
            </Link>
          ) : userProduct?.status === 'pending' ? (
            <div className="btn-primary px-8 py-3 inline-flex items-center gap-2 bg-yellow-500">
              <Clock className="w-5 h-5" />
              En attente d'approbation
            </div>
          ) : user?.subscription === 'enterprise' ? (
            <button
              onClick={handleActivate}
              disabled={activating}
              className="btn-primary px-8 py-3"
            >
              {activating ? 'Envoi en cours...' : `Activer pour ${product?.price} TND/mois`}
            </button>
          ) : (
            <Link to="/pricing" className="btn-primary px-8 py-3 inline-flex items-center gap-2">
              <Star className="w-5 h-5" />
              Passer à Enterprise pour accéder
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDemo;
