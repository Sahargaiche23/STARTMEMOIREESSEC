import { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Edit, Trash2, Eye, UserCheck, UserX,
  ChevronLeft, ChevronRight, Shield, Mail
} from 'lucide-react';
import adminApi from '../../utils/adminApi';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 20,
        search,
        role: roleFilter,
        status: statusFilter
      });
      const res = await adminApi.get(`/admin/users?${params}`);
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(p => ({ ...p, page: 1 }));
    fetchUsers();
  };

  const handleViewUser = async (userId) => {
    try {
      const res = await adminApi.get(`/admin/users/${userId}`);
      setSelectedUser(res.data);
      setEditMode(false);
      setShowModal(true);
    } catch (error) {
      toast.error('Erreur lors du chargement de l\'utilisateur');
    }
  };

  const handleUpdateUser = async () => {
    try {
      await adminApi.put(`/admin/users/${selectedUser.user.id}`, {
        firstName: selectedUser.user.firstName,
        lastName: selectedUser.user.lastName,
        email: selectedUser.user.email,
        role: selectedUser.user.role,
        isActive: selectedUser.user.isActive,
        subscription: selectedUser.user.subscriptionPlan
      });
      toast.success('Utilisateur mis à jour');
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    try {
      await adminApi.delete(`/admin/users/${userId}`);
      toast.success('Utilisateur supprimé');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      await adminApi.put(`/admin/users/${user.id}`, {
        ...user,
        isActive: !user.isActive
      });
      toast.success(`Utilisateur ${user.isActive ? 'désactivé' : 'activé'}`);
      fetchUsers();
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Gestion des utilisateurs
          </h1>
          <p className="text-gray-600 mt-1">{pagination.total} utilisateurs au total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les rôles</option>
            <option value="user">Utilisateur</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
          <button type="submit" className="btn-primary">
            <Filter className="w-4 h-4 mr-2" />
            Filtrer
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Abonnement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inscription</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-gray-500">{user.company || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role === 'admin' ? '👑 Admin' : 'Utilisateur'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.subscriptionPlan === 'premium' ? 'bg-yellow-100 text-yellow-700' :
                        user.subscriptionPlan === 'pro' ? 'bg-cyan-100 text-cyan-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.subscriptionPlan || 'free'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleUserStatus(user)}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {user.isActive ? '✓ Actif' : '✗ Inactif'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewUser(user.id)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Voir"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {pagination.page} sur {pagination.pages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Détails de l'utilisateur</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4">
                {selectedUser.user.avatarUrl ? (
                  <img src={selectedUser.user.avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {selectedUser.user.firstName?.[0]}{selectedUser.user.lastName?.[0]}
                  </div>
                )}
                <div>
                  {editMode ? (
                    <div className="flex gap-2">
                      <input
                        value={selectedUser.user.firstName}
                        onChange={(e) => setSelectedUser({
                          ...selectedUser,
                          user: { ...selectedUser.user, firstName: e.target.value }
                        })}
                        className="border rounded px-2 py-1"
                      />
                      <input
                        value={selectedUser.user.lastName}
                        onChange={(e) => setSelectedUser({
                          ...selectedUser,
                          user: { ...selectedUser.user, lastName: e.target.value }
                        })}
                        className="border rounded px-2 py-1"
                      />
                    </div>
                  ) : (
                    <h3 className="text-xl font-bold">{selectedUser.user.firstName} {selectedUser.user.lastName}</h3>
                  )}
                  <p className="text-gray-500">{selectedUser.user.email}</p>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                  {editMode ? (
                    <select
                      value={selectedUser.user.role}
                      onChange={(e) => setSelectedUser({
                        ...selectedUser,
                        user: { ...selectedUser.user, role: e.target.value }
                      })}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="user">Utilisateur</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <p className="py-2">{selectedUser.user.role === 'admin' ? '👑 Admin' : 'Utilisateur'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Abonnement</label>
                  {editMode ? (
                    <select
                      value={selectedUser.user.subscriptionPlan || 'free'}
                      onChange={(e) => setSelectedUser({
                        ...selectedUser,
                        user: { ...selectedUser.user, subscriptionPlan: e.target.value }
                      })}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="premium">Premium</option>
                    </select>
                  ) : (
                    <p className="py-2 capitalize">{selectedUser.user.subscriptionPlan || 'free'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  {editMode ? (
                    <select
                      value={selectedUser.user.isActive ? '1' : '0'}
                      onChange={(e) => setSelectedUser({
                        ...selectedUser,
                        user: { ...selectedUser.user, isActive: e.target.value === '1' }
                      })}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="1">Actif</option>
                      <option value="0">Inactif</option>
                    </select>
                  ) : (
                    <p className="py-2">{selectedUser.user.isActive ? '✓ Actif' : '✗ Inactif'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inscription</label>
                  <p className="py-2">{new Date(selectedUser.user.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              {/* Projects */}
              <div>
                <h4 className="font-semibold mb-2">Projets ({selectedUser.projects?.length || 0})</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedUser.projects?.map((project) => (
                    <div key={project.id} className="p-2 bg-gray-50 rounded-lg text-sm">
                      {project.name}
                    </div>
                  ))}
                  {(!selectedUser.projects || selectedUser.projects.length === 0) && (
                    <p className="text-gray-500 text-sm">Aucun projet</p>
                  )}
                </div>
              </div>

              {/* User Products / Offers */}
              <div>
                <h4 className="font-semibold mb-2">Offres activées ({selectedUser.userProducts?.length || 0})</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedUser.userProducts?.map((product) => (
                    <div key={product.id} className="p-2 bg-blue-50 rounded-lg text-sm flex justify-between items-center">
                      <div>
                        <span className="font-medium">{product.productName}</span>
                        <span className="text-gray-500 ml-2">({product.price} TND/mois)</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        product.status === 'active' ? 'bg-green-100 text-green-700' :
                        product.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {product.status}
                      </span>
                    </div>
                  ))}
                  {(!selectedUser.userProducts || selectedUser.userProducts.length === 0) && (
                    <p className="text-gray-500 text-sm">Aucune offre activée</p>
                  )}
                </div>
              </div>

              {/* Payments */}
              <div>
                <h4 className="font-semibold mb-2">Paiements ({selectedUser.payments?.length || 0})</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedUser.payments?.map((payment) => (
                    <div key={payment.id} className="p-2 bg-gray-50 rounded-lg text-sm flex justify-between">
                      <span>{payment.amount} {payment.currency}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                        payment.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {payment.status === 'completed' ? 'complété' : payment.status === 'rejected' ? 'rejeté' : payment.status}
                      </span>
                    </div>
                  ))}
                  {(!selectedUser.payments || selectedUser.payments.length === 0) && (
                    <p className="text-gray-500 text-sm">Aucun paiement</p>
                  )}
                </div>
              </div>

              {/* Activity Log */}
              <div>
                <h4 className="font-semibold mb-2">Historique d'activité</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedUser.activityLog?.map((activity, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded-lg text-sm flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${
                        activity.type === 'registration' ? 'bg-blue-500' :
                        activity.type === 'project' ? 'bg-purple-500' :
                        activity.type === 'payment' ? 'bg-green-500' :
                        activity.type === 'product' ? 'bg-orange-500' :
                        'bg-gray-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-gray-700">{activity.description}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(activity.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!selectedUser.activityLog || selectedUser.activityLog.length === 0) && (
                    <p className="text-gray-500 text-sm">Aucune activité</p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              {editMode ? (
                <>
                  <button onClick={() => setEditMode(false)} className="btn-secondary">Annuler</button>
                  <button onClick={handleUpdateUser} className="btn-primary">Enregistrer</button>
                </>
              ) : (
                <>
                  <button onClick={() => setShowModal(false)} className="btn-secondary">Fermer</button>
                  <button onClick={() => setEditMode(true)} className="btn-primary flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
