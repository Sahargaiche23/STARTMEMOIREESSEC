import { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, Building, Lock, CreditCard, History, Camera, Upload, Scan, Loader2 } from 'lucide-react';
import * as faceapi from 'face-api.js';
import toast from 'react-hot-toast';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const Profile = () => {
  const { user, updateUser, fetchUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const fileInputRef = useRef(null);
  
  // Face recognition states
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceRegistered, setFaceRegistered] = useState(false);
  const [faceLoading, setFaceLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    company: user?.company || ''
  });

  useEffect(() => {
    fetchUser();
    loadFaceModels();
    checkFaceStatus();
    return () => stopCamera();
  }, []);

  const loadFaceModels = async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models')
      ]);
      setModelsLoaded(true);
    } catch (error) {
      console.log('Face models not loaded');
    }
  };

  const checkFaceStatus = async () => {
    try {
      const response = await api.get('/auth/face/status');
      setFaceRegistered(response.data.hasFaceRegistered);
    } catch (error) {
      console.log('Face status check failed');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      setCameraActive(true);
      // Wait for video element to be in DOM
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Impossible d\'accéder à la caméra');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleFaceRegister = async () => {
    if (!modelsLoaded) {
      toast.error('Modèles non chargés');
      return;
    }

    setFaceLoading(true);
    try {
      // Wait for video to be ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.3 });
      
      let detections = null;
      for (let i = 0; i < 3; i++) {
        detections = await faceapi
          .detectSingleFace(videoRef.current, options)
          .withFaceLandmarks()
          .withFaceDescriptor();
        if (detections) break;
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      if (!detections) {
        toast.error('Aucun visage détecté. Regardez bien la caméra.');
        setFaceLoading(false);
        return;
      }

      await api.post('/auth/face/register', {
        faceDescriptor: Array.from(detections.descriptor)
      });

      setFaceRegistered(true);
      stopCamera();
      toast.success('Reconnaissance faciale configurée !');
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setFaceLoading(false);
    }
  };

  const handleRegisterFromGoogle = async () => {
    if (!user?.avatarUrl || !modelsLoaded) {
      toast.error('Photo Google non disponible');
      return;
    }

    setFaceLoading(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const faceDescriptor = await new Promise((resolve) => {
        img.onload = async () => {
          try {
            const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.2 });
            const detections = await faceapi
              .detectSingleFace(img, options)
              .withFaceLandmarks()
              .withFaceDescriptor();
            resolve(detections ? Array.from(detections.descriptor) : null);
          } catch {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = user.avatarUrl;
      });

      if (!faceDescriptor) {
        toast.error('Impossible de détecter le visage sur la photo Google. Utilisez la caméra.');
        setFaceLoading(false);
        return;
      }

      await api.post('/auth/face/register', { faceDescriptor });
      setFaceRegistered(true);
      toast.success('Reconnaissance faciale configurée depuis votre photo Google !');
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setFaceLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        company: user.company || ''
      });
    }
  }, [user]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (activeTab === 'subscription') {
      fetchSubscription();
    } else if (activeTab === 'history') {
      fetchPaymentHistory();
    }
  }, [activeTab]);

  const fetchSubscription = async () => {
    try {
      const response = await api.get('/payments/subscription');
      setSubscription(response.data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const response = await api.get('/payments/history');
      setPaymentHistory(response.data.payments || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put('/auth/profile', profileData);
      updateUser(response.data.user);
      toast.success('Profil mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    // Compress image before upload
    const compressImage = (file, maxWidth = 200, quality = 0.8) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
    };

    try {
      const avatarUrl = await compressImage(file);
      await api.post('/auth/avatar', { avatarUrl });
      updateUser({ avatarUrl });
      toast.success('Avatar mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de l\'avatar');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Mot de passe modifié');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler votre abonnement ?')) return;
    
    try {
      await api.post('/payments/cancel');
      toast.success('Abonnement annulé');
      fetchSubscription();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Lock },
    { id: 'face', label: 'Reconnaissance', icon: Scan },
    { id: 'subscription', label: 'Abonnement', icon: CreditCard },
    { id: 'history', label: 'Historique', icon: History }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Mon Profil</h1>
        <p className="text-gray-600">Gérez vos informations personnelles et votre abonnement.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="text-center mb-6">
              <div className="relative inline-block">
                {user?.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt="Avatar" 
                    className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-cyan-500"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-white">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white hover:bg-cyan-600 transition-colors shadow-lg"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <h3 className="font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className={`badge mt-2 ${user?.subscription === 'free' ? 'badge-info' : 'badge-success'}`}>
                Plan {user?.subscription || 'Gratuit'}
              </span>
            </div>

            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                    activeTab === tab.id 
                      ? 'bg-primary-50 text-primary-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Informations personnelles</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={user?.email}
                      className="input-field pl-10 bg-gray-50"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="input-field pl-10"
                      placeholder="+216 XX XXX XXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entreprise
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.company}
                      onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                      className="input-field pl-10"
                      placeholder="Nom de votre entreprise"
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Changer le mot de passe</h2>
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="input-field"
                    autoComplete="current-password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="input-field"
                    placeholder="Min. 6 caractères"
                    autoComplete="new-password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="input-field"
                    autoComplete="new-password"
                    required
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Modification...' : 'Modifier le mot de passe'}
                </button>
              </form>
            </div>
          )}

          {/* Face Recognition Tab */}
          {activeTab === 'face' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Reconnaissance faciale</h2>
              <p className="text-gray-600 mb-6">
                Configurez la reconnaissance faciale pour vous connecter plus rapidement et de manière sécurisée.
              </p>
              
              {faceRegistered ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Scan className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800">Reconnaissance faciale activée</p>
                      <p className="text-sm text-green-600">Vous pouvez vous connecter avec votre visage</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-yellow-800">La reconnaissance faciale n'est pas encore configurée.</p>
                </div>
              )}

              {!cameraActive ? (
                <div className="flex flex-col gap-3">
                  {user?.avatarUrl && !faceRegistered && (
                    <button
                      onClick={handleRegisterFromGoogle}
                      disabled={!modelsLoaded || faceLoading}
                      className="btn-primary flex items-center gap-2"
                    >
                      {faceLoading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Analyse en cours...</>
                      ) : (
                        <><img src={user.avatarUrl} alt="" className="w-5 h-5 rounded-full" /> Utiliser ma photo Google</>
                      )}
                    </button>
                  )}
                  <button
                    onClick={startCamera}
                    disabled={!modelsLoaded || faceLoading}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    {faceRegistered ? 'Reconfigurer avec la caméra' : 'Configurer avec la caméra'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-w-md">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleFaceRegister}
                      disabled={faceLoading}
                      className="btn-primary flex items-center gap-2"
                    >
                      {faceLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Analyse en cours...
                        </>
                      ) : (
                        <>
                          <Scan className="w-5 h-5" />
                          Enregistrer mon visage
                        </>
                      )}
                    </button>
                    <button onClick={stopCamera} className="btn-secondary">
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {!modelsLoaded && (
                <p className="text-sm text-gray-500 mt-4">
                  <Loader2 className="w-4 h-4 inline animate-spin mr-2" />
                  Chargement des modèles de reconnaissance...
                </p>
              )}
            </div>
          )}

          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Mon abonnement</h2>
                {subscription && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        Plan {subscription.planDetails?.name || 'Gratuit'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {subscription.planDetails?.price === 0 
                          ? 'Gratuit' 
                          : `${subscription.planDetails?.price} ${subscription.planDetails?.currency}/${subscription.planDetails?.period}`
                        }
                      </p>
                    </div>
                    {subscription.subscription?.plan !== 'free' && (
                      <button onClick={cancelSubscription} className="text-red-600 hover:underline text-sm">
                        Annuler l'abonnement
                      </button>
                    )}
                  </div>
                )}

                {subscription?.planDetails?.features && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Fonctionnalités incluses:</p>
                    <ul className="space-y-1">
                      {subscription.planDetails.features.map((feature, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="card">
                <h3 className="font-medium text-gray-900 mb-4">Changer de plan</h3>
                <p className="text-gray-600 mb-4">
                  Vous souhaitez accéder à plus de fonctionnalités ?
                </p>
                <a href="/pricing" className="btn-primary inline-block">
                  Voir les plans disponibles
                </a>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Historique des paiements</h2>
              {paymentHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 border-b">
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium">Plan</th>
                        <th className="pb-3 font-medium">Montant</th>
                        <th className="pb-3 font-medium">Méthode</th>
                        <th className="pb-3 font-medium">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((payment) => (
                        <tr key={payment.id} className="border-b last:border-0">
                          <td className="py-3 text-sm">
                            {new Date(payment.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="py-3 text-sm capitalize">{payment.subscriptionType}</td>
                          <td className="py-3 text-sm">{payment.amount} {payment.currency}</td>
                          <td className="py-3 text-sm capitalize">{payment.method}</td>
                          <td className="py-3">
                            <span className={`badge ${
                              payment.status === 'completed' ? 'badge-success' :
                              payment.status === 'pending' ? 'badge-warning' :
                              'badge-danger'
                            }`}>
                              {payment.status === 'completed' ? 'Payé' :
                               payment.status === 'pending' ? 'En attente' : 'Échoué'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Aucun paiement</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
