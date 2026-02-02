import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import * as faceapi from 'face-api.js';
import toast from 'react-hot-toast';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const code = searchParams.get('code');
    
    if (code) {
      handleGoogleCallback(code);
    } else {
      toast.error('Erreur de connexion Google');
      navigate('/login');
    }
  }, [searchParams]);

  const extractFaceFromImage = async (imageUrl) => {
    try {
      // Load face-api models
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models')
      ]);

      // Create image element and load the avatar
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve) => {
        img.onload = async () => {
          try {
            const detections = await faceapi
              .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceDescriptor();

            if (detections) {
              resolve(Array.from(detections.descriptor));
            } else {
              resolve(null);
            }
          } catch {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = imageUrl;
      });
    } catch {
      return null;
    }
  };

  const handleGoogleCallback = async (code) => {
    try {
      const response = await api.post('/auth/google/callback', { 
        code,
        redirectUri: window.location.origin + '/auth/google/callback'
      });
      
      setAuth(response.data.token, response.data.user);
      
      // Try to auto-register face from Google avatar
      const avatarUrl = response.data.user?.avatarUrl;
      if (avatarUrl) {
        const faceDescriptor = await extractFaceFromImage(avatarUrl);
        if (faceDescriptor) {
          try {
            await api.post('/auth/face/register', { faceDescriptor });
            toast.success('Connexion Google réussie ! Reconnaissance faciale configurée automatiquement.');
          } catch {
            toast.success('Connexion Google réussie !');
          }
        } else {
          toast.success('Connexion Google réussie !');
        }
      } else {
        toast.success('Connexion Google réussie !');
      }
      
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
