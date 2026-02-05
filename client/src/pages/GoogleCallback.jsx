import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();
  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent double processing (React StrictMode calls useEffect twice)
    if (processedRef.current) return;
    
    const code = searchParams.get('code');
    
    if (code) {
      processedRef.current = true;
      handleGoogleCallback(code);
    } else {
      toast.error('Erreur de connexion Google');
      navigate('/login');
    }
  }, [searchParams]);

  const handleGoogleCallback = async (code) => {
    try {
      const response = await api.post('/auth/google/callback', { 
        code,
        redirectUri: window.location.origin + '/auth/google/callback'
      });
      
      setAuth(response.data.token, response.data.user);
      
      toast.success('Connexion Google réussie !');
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Google callback error:', error);
      toast.error('Erreur de connexion Google');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center text-white">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-cyan-400" />
        <p className="text-xl">Connexion en cours...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
