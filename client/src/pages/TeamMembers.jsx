import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  UserPlus, 
  Users, 
  Mail, 
  Crown, 
  Eye, 
  Trash2, 
  Check, 
  X,
  Clock,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const TeamMembers = () => {
  const { id: projectId } = useParams();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('member');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const [projectRes, membersRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/team-members/${projectId}`)
      ]);
      setProject(projectRes.data.project);
      setMembers(membersRes.data.members);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    setAdding(true);
    try {
      const res = await api.post(`/team-members/${projectId}`, {
        email: newMemberEmail,
        role: newMemberRole
      });
      setMembers([res.data.member, ...members]);
      setNewMemberEmail('');
      setNewMemberRole('member');
      setShowAddModal(false);
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout');
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateRole = async (memberId, role) => {
    try {
      await api.put(`/team-members/${projectId}/${memberId}`, { role });
      setMembers(members.map(m => m.id === memberId ? { ...m, role } : m));
      toast.success('Rôle mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce membre ?')) return;

    try {
      await api.delete(`/team-members/${projectId}/${memberId}`);
      setMembers(members.filter(m => m.id !== memberId));
      toast.success('Membre retiré');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'member': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'viewer': return <Eye className="w-4 h-4 text-gray-500" />;
      default: return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin': return 'bg-yellow-100 text-yellow-800';
      case 'member': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
        <div className="flex items-center gap-4">
          <Link 
            to={`/projects/${projectId}`} 
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Membres d'équipe</h1>
            <p className="text-gray-600">{project?.name}</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Ajouter un membre
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{members.length}</p>
              <p className="text-sm text-gray-600">Total membres</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {members.filter(m => m.status === 'active').length}
              </p>
              <p className="text-sm text-gray-600">Membres actifs</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {members.filter(m => m.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-600">En attente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Liste des membres</h2>
        
        {members.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun membre dans l'équipe</p>
            <p className="text-sm text-gray-400 mt-1">
              Ajoutez des membres pour collaborer sur ce projet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div 
                key={member.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {member.firstName ? member.firstName[0] : member.email[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">
                        {member.firstName && member.lastName 
                          ? `${member.firstName} ${member.lastName}`
                          : member.email
                        }
                      </p>
                      {getRoleIcon(member.role)}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-500">{member.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(member.status)}`}>
                    {member.status === 'active' ? 'Actif' : 'En attente'}
                  </span>
                  
                  <select
                    value={member.role}
                    onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 cursor-pointer ${getRoleBadge(member.role)}`}
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Membre</option>
                    <option value="viewer">Lecteur</option>
                  </select>

                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Retirer le membre"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Role Description */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Niveaux d'accès</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Admin</span>
            </div>
            <p className="text-sm text-yellow-700">
              Peut gérer les membres, créer et modifier toutes les tâches
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">Membre</span>
            </div>
            <p className="text-sm text-blue-700">
              Peut créer des tâches et modifier celles qui lui sont assignées
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-800">Lecteur</span>
            </div>
            <p className="text-sm text-gray-600">
              Peut voir le projet et les tâches sans pouvoir les modifier
            </p>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Ajouter un membre</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="membre@exemple.com"
                    className="input pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Si l'utilisateur existe, il recevra une notification. Sinon, une invitation sera créée.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle
                </label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="input"
                >
                  <option value="admin">Admin - Accès complet</option>
                  <option value="member">Membre - Peut créer et modifier ses tâches</option>
                  <option value="viewer">Lecteur - Lecture seule</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={adding || !newMemberEmail.trim()}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {adding ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMembers;
