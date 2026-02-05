import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, Mail, Lock, User, Users, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const InviteRegister = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    verifyInvitation();
  }, [token]);

  const verifyInvitation = async () => {
    try {
      const response = await api.get(`/auth/invite/${token}`);
      setInvitation(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Invitation invalide ou expirée');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post(`/auth/invite/${token}/register`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password
      });

      setAuth(response.data.token, response.data.user);
      toast.success('Compte créé avec succès ! Bienvenue dans l\'équipe !');
      
      // Redirect to the project
      navigate(`/projects/${response.data.projectId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création du compte');
    } finally {
      setSubmitting(false);
    }
  };

  const roleLabels = {
    admin: 'Administrateur',
    member: 'Membre',
    viewer: 'Lecteur'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-cyan-400" />
          <p className="text-xl">Vérification de l'invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Invitation invalide</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <Link 
            to="/login" 
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors"
          >
            Aller à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Rejoindre l'équipe</h1>
          <p className="text-gray-300">
            Vous avez été invité(e) au projet
          </p>
          <p className="text-cyan-400 font-semibold text-lg mt-1">
            "{invitation?.projectName}"
          </p>
        </div>

        {/* Invitation Info */}
        <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-2">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <span className="text-white">{invitation?.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-gray-300">Rôle : <span className="text-white font-medium">{roleLabels[invitation?.role]}</span></span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Prénom</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="Prénom"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nom</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="Nom"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Confirmer le mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Création en cours...
              </>
            ) : (
              'Créer mon compte et rejoindre'
            )}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Vous avez déjà un compte ?{' '}
          <Link to="/login" className="text-cyan-400 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};

export default InviteRegister;
