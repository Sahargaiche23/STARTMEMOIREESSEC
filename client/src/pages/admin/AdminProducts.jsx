import { useState, useEffect } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  User,
  Calendar,
  DollarSign,
  Check,
  X,
  Eye,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const AdminProducts = () => {
  const [requests, setRequests] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');
  const [rejectModal, setRejectModal] = useState({ show: false, requestId: null });
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [requestsRes, subsRes] = await Promise.all([
        api.get('/products/admin/requests'),
        api.get('/products/admin/subscriptions')
      ]);
      setRequests(requestsRes.data.requests || []);
      setSubscriptions(subsRes.data.subscriptions || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await api.post(`/products/admin/approve/${requestId}`);
      toast.success('Offre approuvée et activée !');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleReject = async () => {
    if (!rejectModal.requestId) return;
    
    try {
      await api.post(`/products/admin/reject/${rejectModal.requestId}`, {
        reason: rejectReason
      });
      toast.success('Demande refusée');
      setRejectModal({ show: false, requestId: null });
      setRejectReason('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status, isExpiringSoon) => {
    if (status === 'pending') {
      return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">En attente</span>;
    }
    if (status === 'active') {
      if (isExpiringSoon) {
        return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Expire bientôt</span>;
      }
      return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Actif</span>;
    }
    if (status === 'expired') {
      return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Expiré</span>;
    }
    if (status === 'rejected') {
      return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Refusé</span>;
    }
    return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{status}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Offres</h1>
          <p className="text-gray-600">Approuver ou refuser les demandes d'activation</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
              <p className="text-sm text-gray-600">En attente</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {subscriptions.filter(s => s.status === 'active').length}
              </p>
              <p className="text-sm text-gray-600">Actifs</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {subscriptions.filter(s => s.isExpiringSoon).length}
              </p>
              <p className="text-sm text-gray-600">Expire bientôt</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + (s.price || 0), 0)} TND
              </p>
              <p className="text-sm text-gray-600">Revenus actifs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'requests'
              ? 'text-primary-600 border-primary-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          Demandes en attente ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'subscriptions'
              ? 'text-primary-600 border-primary-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          Tous les abonnements ({subscriptions.length})
        </button>
      </div>

      {/* Pending Requests */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-xl border">
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune demande en attente</p>
            </div>
          ) : (
            <div className="divide-y">
              {requests.map((request) => (
                <div key={request.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${request.color}20` }}
                        >
                          <Package className="w-5 h-5" style={{ color: request.color }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{request.productName}</h3>
                          <p className="text-sm text-gray-500">{request.categoryName}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm mt-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{request.firstName} {request.lastName}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Email:</span> {request.email}
                        </div>
                        <div>
                          <span className="text-gray-500">Plan:</span> 
                          <span className="ml-1 font-medium">{request.userPlan}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Demandé:</span> {formatDate(request.requestedAt)}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <span className="font-semibold text-lg text-primary-600">{request.price} TND</span>
                        <span className="text-gray-500">
                          pour {request.duration} {request.durationUnit === 'month' ? 'mois' : request.durationUnit === 'year' ? 'an(s)' : 'jour(s)'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Approuver
                      </button>
                      <button
                        onClick={() => setRejectModal({ show: true, requestId: request.id })}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Refuser
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Subscriptions */}
      {activeTab === 'subscriptions' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Utilisateur</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Produit</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Prix</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Statut</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Expire</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Jours restants</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{sub.firstName} {sub.lastName}</p>
                      <p className="text-sm text-gray-500">{sub.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${sub.color}20` }}
                      >
                        <Package className="w-4 h-4" style={{ color: sub.color }} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{sub.productName}</p>
                        <p className="text-xs text-gray-500">{sub.categoryName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{sub.price} TND</td>
                  <td className="px-4 py-3">{getStatusBadge(sub.status, sub.isExpiringSoon)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {sub.expiresAt ? formatDate(sub.expiresAt) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {sub.daysRemaining !== null ? (
                      <span className={`font-medium ${sub.isExpiringSoon ? 'text-orange-600' : 'text-gray-900'}`}>
                        {sub.daysRemaining} jours
                      </span>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Refuser la demande</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison du refus (optionnel)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Expliquez pourquoi vous refusez cette demande..."
                className="input"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setRejectModal({ show: false, requestId: null })}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium"
              >
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
