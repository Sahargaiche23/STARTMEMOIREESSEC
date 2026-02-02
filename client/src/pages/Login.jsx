import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Rocket, Mail, Lock, Eye, EyeOff, Camera, X, Loader2 } from 'lucide-react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import * as faceapi from 'face-api.js';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import api from '../utils/api';

const GOOGLE_CLIENT_ID = '336620578429-9et3ddov717t2hcbabm90tfuupqne5ts.apps.googleusercontent.com';

const Login = () => {
  const navigate = useNavigate();
  const { login, setAuth, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceLoading, setFaceLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        setModelsLoaded(true);
      } catch (error) {
        console.log('Face models not loaded - facial recognition unavailable');
      }
    };
    loadModels();
    
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
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
  };

  const handleFaceLogin = async () => {
    if (!formData.email) {
      toast.error('Veuillez entrer votre email');
      return;
    }
    
    if (!modelsLoaded) {
      toast.error('Modèles de reconnaissance non chargés');
      return;
    }

    setFaceLoading(true);
    try {
      // Wait for video to be ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Try detection with different options
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
        toast.error('Aucun visage détecté. Assurez-vous que votre visage est bien visible.');
        setFaceLoading(false);
        return;
      }

      const response = await api.post('/auth/face/login', {
        email: formData.email,
        faceDescriptor: Array.from(detections.descriptor)
      });

      setAuth(response.data.token, response.data.user);
      toast.success('Connexion réussie !');
      stopCamera();
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reconnaissance faciale échouée');
    } finally {
      setFaceLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await api.post('/auth/google', {
        credential: credentialResponse.credential
      });
      
      setAuth(response.data.token, response.data.user);
      toast.success('Connexion Google réussie !');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Erreur de connexion Google');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      toast.success('Connexion réussie !');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
        {/* Left side - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">StartUpLab</span>
            </Link>
            
            <h1 className="text-3xl font-bold text-white mb-2">Bon retour !</h1>
            <p className="text-gray-300 mb-6">Connectez-vous pour accéder à votre espace.</p>

            {/* Login Method Tabs */}
            <div className="flex gap-2 mb-6 p-1 bg-white/10 rounded-xl">
              <button
                onClick={() => { setLoginMethod('email'); stopCamera(); }}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${loginMethod === 'email' ? 'bg-white text-gray-900' : 'text-white hover:bg-white/10'}`}
              >
                Email
              </button>
              <button
                onClick={() => { setLoginMethod('face'); startCamera(); }}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${loginMethod === 'face' ? 'bg-white text-gray-900' : 'text-white hover:bg-white/10'}`}
              >
                <Camera className="w-4 h-4" /> Visage
              </button>
            </div>

            {loginMethod === 'email' ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="vous@exemple.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded bg-white/10 border-white/20 text-cyan-500" />
                    <span className="text-sm text-gray-300">Se souvenir de moi</span>
                  </label>
                  <a href="#" className="text-sm text-cyan-400 hover:text-cyan-300">
                    Mot de passe oublié ?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isLoading ? 'Connexion...' : 'Se connecter'}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="vous@exemple.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 border-4 border-dashed border-cyan-500/50 rounded-xl pointer-events-none" />
                </div>
                
                <button
                  onClick={handleFaceLogin}
                  disabled={faceLoading || !formData.email}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {faceLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Analyse du visage...</>
                  ) : (
                    <><Camera className="w-5 h-5" /> Se connecter avec le visage</>
                  )}
                </button>
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-white/20" />
              <span className="text-sm text-gray-400">ou continuer avec</span>
              <div className="flex-1 h-px bg-white/20" />
            </div>

            {/* Google Login */}
            <div className="flex justify-center">
              <button
                onClick={() => {
                  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/google/callback')}&response_type=code&scope=openid%20email%20profile&access_type=offline`;
                  window.location.href = googleAuthUrl;
                }}
                className="flex items-center gap-3 px-6 py-3 bg-white text-gray-700 font-medium rounded-full hover:bg-gray-100 transition-colors shadow-lg"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuer avec Google
              </button>
            </div>

            <p className="text-center text-gray-300 mt-8">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium">
                S'inscrire gratuitement
              </Link>
            </p>
          </div>
        </div>

        {/* Right side - Illustration */}
        <div className="hidden lg:flex flex-1 items-center justify-center p-12">
          <div className="text-center text-white max-w-lg">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
              <Rocket className="w-16 h-16" />
            </div>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Transformez vos idées en réalité
            </h2>
            <p className="text-xl text-gray-300">
              Rejoignez des centaines d'entrepreneurs qui utilisent StartUpLab pour créer et développer leur startup.
            </p>
            
            <div className="mt-12 grid grid-cols-3 gap-6">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-3xl font-bold text-cyan-400">500+</div>
                <div className="text-sm text-gray-400">Startups créées</div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-3xl font-bold text-purple-400">98%</div>
                <div className="text-sm text-gray-400">Satisfaction</div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-3xl font-bold text-pink-400">24/7</div>
                <div className="text-sm text-gray-400">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
