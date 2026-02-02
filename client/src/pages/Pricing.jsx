import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Rocket, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const Pricing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansRes, methodsRes] = await Promise.all([
        api.get('/payments/plans'),
        api.get('/payments/methods')
      ]);
      setPlans(plansRes.data.plans || []);
      setPaymentMethods(methodsRes.data.methods || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan) => {
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour choisir un plan');
      navigate('/login');
      return;
    }
    if (plan.id === 'free') {
      toast.info('Vous êtes déjà sur le plan gratuit');
      return;
    }
    setSelectedPlan(plan);
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error('Choisissez une méthode de paiement');
      return;
    }

    setProcessing(true);
    try {
      const response = await api.post('/payments/initiate', {
        planId: selectedPlan.id,
        paymentMethod: selectedMethod
      });

      toast.success('Paiement initié !');
      
      // For demo, auto-confirm the payment
      await api.post(`/payments/confirm/${response.data.transactionId}`);
      toast.success('Abonnement activé avec succès !');
      
      setSelectedPlan(null);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur de paiement');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Rocket className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold gradient-text">StartUpLab</span>
            </Link>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-secondary flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Retour au tableau de bord
              </Link>
            ) : (
              <Link to="/login" className="btn-primary">Se connecter</Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choisissez votre plan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Des tarifs adaptés à chaque étape de votre startup. Commencez gratuitement et évoluez selon vos besoins.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan) => {
            const isCurrentPlan = user?.subscription === plan.id;
            const isPopular = plan.id === 'pro';
            
            return (
              <div 
                key={plan.id}
                className={`card relative ${isPopular ? 'border-2 border-primary-500 shadow-lg' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                      Populaire
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">
                      {plan.currency}/{plan.period || 'gratuit'}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-5 h-5 text-green-500 shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isCurrentPlan}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    isCurrentPlan 
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : isPopular
                        ? 'btn-primary'
                        : 'btn-secondary'
                  }`}
                >
                  {isCurrentPlan ? 'Plan actuel' : plan.price === 0 ? 'Commencer' : 'Choisir ce plan'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Payment Modal */}
        {selectedPlan && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Paiement - {selectedPlan.name}</h2>
                <p className="text-gray-600">
                  {selectedPlan.price} {selectedPlan.currency}/{selectedPlan.period}
                </p>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="font-medium text-gray-900">Méthode de paiement</h3>
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedMethod === method.id 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={selectedMethod === method.id}
                        onChange={(e) => setSelectedMethod(e.target.value)}
                        className="text-primary-600"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{method.name}</p>
                        <p className="text-sm text-gray-500">{method.description}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setSelectedPlan(null)} 
                    className="btn-secondary flex-1"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={handlePayment}
                    disabled={processing || !selectedMethod}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    {processing ? 'Traitement...' : 'Payer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'Puis-je changer de plan à tout moment ?',
                a: 'Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Le changement prend effet immédiatement.'
              },
              {
                q: 'Quels moyens de paiement acceptez-vous ?',
                a: 'Nous acceptons D17, Flouci, les cartes bancaires tunisiennes (Visa/Mastercard) et les virements bancaires.'
              },
              {
                q: 'Y a-t-il un engagement ?',
                a: 'Non, tous nos plans sont sans engagement. Vous pouvez annuler à tout moment.'
              },
              {
                q: 'Mes données sont-elles sécurisées ?',
                a: 'Oui, nous utilisons le chiffrement SSL et respectons les normes de sécurité les plus strictes pour protéger vos données.'
              }
            ].map((faq, i) => (
              <div key={i} className="card">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
