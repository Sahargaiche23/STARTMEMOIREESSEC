import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Calendar,
  RefreshCw,
  ArrowRight,
  ChevronRight,
  Timer,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const MySubscriptions = () => {
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({ active: 0, pending: 0, expired: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      const res = await api.get('/products/my-products');
      setProducts(res.data.products || []);
      setSummary(res.data.summary || { active: 0, pending: 0, expired: 0, rejected: 0 });
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (userProductId) => {
    try {
      await api.post(`/products/renew/${userProductId}`, { duration: 1 });
      toast.success('Demande de renouvellement envoyée !');
      fetchMyProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const getFilteredProducts = () => {
    switch (activeTab) {
      case 'active':
        return products.filter(p => p.status === 'active' && !p.isExpired);
      case 'pending':
        return products.filter(p => p.status === 'pending');
      case 'expired':
        return products.filter(p => p.status === 'expired' || p.isExpired);
      case 'rejected':
        return products.filter(p => p.status === 'rejected');
      default:
        return products;
    }
  };

  const getStatusBadge = (product) => {
    if (product.status === 'pending') {
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
          <Clock className="w-4 h-4" />
          En attente
        </span>
      );
    }
    if (product.status === 'rejected') {
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
          <XCircle className="w-4 h-4" />
          Refusée
        </span>
      );
    }
    if (product.isExpired || product.status === 'expired') {
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
          <AlertTriangle className="w-4 h-4" />
          Expiré
        </span>
      );
    }
    if (product.isExpiringSoon) {
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
          <Timer className="w-4 h-4" />
          Expire bientôt
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
        <CheckCircle className="w-4 h-4" />
        Actif
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const filteredProducts = getFilteredProducts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Offres & Abonnements</h1>
          <p className="text-gray-600">Gérez vos produits et services actifs</p>
        </div>
        <Link
          to="/entreprise/produits-solutions"
          className="btn-primary flex items-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Découvrir plus d'offres
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveTab('active')}
          className={`card cursor-pointer transition-all ${activeTab === 'active' ? 'ring-2 ring-green-500' : 'hover:shadow-md'}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{summary.active}</p>
              <p className="text-sm text-gray-600">Actifs</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('pending')}
          className={`card cursor-pointer transition-all ${activeTab === 'pending' ? 'ring-2 ring-amber-500' : 'hover:shadow-md'}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{summary.pending}</p>
              <p className="text-sm text-gray-600">En attente</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('expired')}
          className={`card cursor-pointer transition-all ${activeTab === 'expired' ? 'ring-2 ring-gray-500' : 'hover:shadow-md'}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{summary.expired}</p>
              <p className="text-sm text-gray-600">Expirés</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('rejected')}
          className={`card cursor-pointer transition-all ${activeTab === 'rejected' ? 'ring-2 ring-red-500' : 'hover:shadow-md'}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{summary.rejected}</p>
              <p className="text-sm text-gray-600">Refusées</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {activeTab === 'active' && 'Offres actives'}
          {activeTab === 'pending' && 'Demandes en attente'}
          {activeTab === 'expired' && 'Offres expirées'}
          {activeTab === 'rejected' && 'Demandes refusées'}
        </h2>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune offre dans cette catégorie</p>
            <Link 
              to="/entreprise/produits-solutions"
              className="inline-flex items-center gap-2 mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              Découvrir les offres
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${product.color}20` }}
                      >
                        <Package className="w-5 h-5" style={{ color: product.color }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-500">{product.categoryName}</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">{product.description}</p>

                    {/* Subscription Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Prix</p>
                        <p className="font-semibold text-gray-900">{product.price} TND</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Durée</p>
                        <p className="font-semibold text-gray-900">
                          {product.duration} {product.durationUnit === 'month' ? 'mois' : product.durationUnit === 'year' ? 'an(s)' : 'jour(s)'}
                        </p>
                      </div>
                      {product.activatedAt && (
                        <div>
                          <p className="text-gray-500">Activé le</p>
                          <p className="font-semibold text-gray-900">{formatDate(product.activatedAt)}</p>
                        </div>
                      )}
                      {product.expiresAt && (
                        <div>
                          <p className="text-gray-500">Expire le</p>
                          <p className={`font-semibold ${product.isExpiringSoon ? 'text-orange-600' : 'text-gray-900'}`}>
                            {formatDate(product.expiresAt)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Days Remaining */}
                    {product.status === 'active' && product.daysRemaining !== null && (
                      <div className="mt-4 flex items-center gap-2">
                        <Timer className={`w-4 h-4 ${product.isExpiringSoon ? 'text-orange-500' : 'text-green-500'}`} />
                        <span className={`text-sm font-medium ${product.isExpiringSoon ? 'text-orange-600' : 'text-green-600'}`}>
                          {product.daysRemaining} jours restants
                        </span>
                      </div>
                    )}

                    {/* Admin Note for rejected */}
                    {product.status === 'rejected' && product.adminNote && (
                      <div className="mt-4 p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-700">
                          <strong>Raison :</strong> {product.adminNote}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    {getStatusBadge(product)}
                    
                    {/* Renew button for expired or expiring soon */}
                    {(product.isExpired || product.isExpiringSoon || product.status === 'expired') && (
                      <button
                        onClick={() => handleRenew(product.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Renouveler
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySubscriptions;
