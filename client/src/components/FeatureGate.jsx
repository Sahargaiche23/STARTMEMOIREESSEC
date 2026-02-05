import { Link } from 'react-router-dom';
import { Lock, Sparkles } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { hasFeatureAccess, isPlanAtLeast, PLANS } from '../utils/subscription';

const FeatureGate = ({ 
  feature, 
  requiredPlan = 'starter',
  children, 
  fallback = null,
  showUpgradePrompt = true 
}) => {
  const { user } = useAuthStore();
  const userPlan = user?.subscription || 'free';
  
  const hasAccess = feature 
    ? hasFeatureAccess(userPlan, feature)
    : isPlanAtLeast(userPlan, requiredPlan);

  if (hasAccess) {
    return children;
  }

  if (fallback) {
    return fallback;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  const requiredPlanInfo = PLANS[requiredPlan];

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gray-100/80 backdrop-blur-sm rounded-xl z-10 flex items-center justify-center">
        <div className="text-center p-6 max-w-sm">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">
            Fonctionnalité Premium
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Cette fonctionnalité nécessite le plan {requiredPlanInfo?.name || 'supérieur'}
          </p>
          <Link 
            to="/pricing" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            <Sparkles className="w-4 h-4" />
            Mettre à niveau
          </Link>
        </div>
      </div>
      <div className="opacity-30 pointer-events-none">
        {children}
      </div>
    </div>
  );
};

export const UpgradeBanner = ({ requiredPlan = 'starter', message }) => {
  const requiredPlanInfo = PLANS[requiredPlan];
  
  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900">
            {message || `Passez au plan ${requiredPlanInfo?.name} pour débloquer cette fonctionnalité`}
          </p>
          <p className="text-sm text-gray-600">
            À partir de {requiredPlanInfo?.price} TND/mois
          </p>
        </div>
        <Link 
          to="/pricing" 
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
        >
          Voir les plans
        </Link>
      </div>
    </div>
  );
};

export default FeatureGate;
