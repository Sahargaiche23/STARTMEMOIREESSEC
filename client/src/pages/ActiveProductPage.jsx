import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Settings, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import { erpDemos, marketingDemos } from './demosMarketing';
import { expertDemos, iaDemos } from './demosExpertIA';

const ActiveProductPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProduct, setUserProduct] = useState(null);
  const [activeScreen, setActiveScreen] = useState(0);

  useEffect(() => {
    fetchProduct();
    checkAccess();
  }, [slug]);

  const checkAccess = async () => {
    try {
      const res = await api.get('/products/my-products');
      const found = (res.data.products || []).find(p => p.slug === slug && p.status === 'active');
      if (!found) {
        toast.error('Vous devez activer ce produit pour y accéder');
        navigate(`/produit/demo/${slug}`);
        return;
      }
      setUserProduct(found);
    } catch (error) {
      navigate(`/produit/demo/${slug}`);
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/product/${slug}`);
      setProduct(res.data.product);
    } catch (error) {
      toast.error('Produit non trouvé');
      navigate('/mes-offres');
    } finally {
      setLoading(false);
    }
  };

  const allDemos = { ...erpDemos, ...marketingDemos, ...expertDemos, ...iaDemos };
  const demo = allDemos[slug];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!product || !demo) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Ce module n'est pas encore disponible.</p>
        <Link to="/mes-offres" className="text-primary-600 hover:underline mt-2 inline-block">← Retour à mes offres</Link>
      </div>
    );
  }

  const features = product.features || [];
  const screens = demo.screens || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{demo.title}</h1>
            <p className="text-gray-500">{demo.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {userProduct && (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
              <Check className="w-4 h-4" /> Actif
            </span>
          )}
          {userProduct?.daysRemaining != null && (
            <span className="text-sm text-gray-500">{userProduct.daysRemaining}j restants</span>
          )}
        </div>
      </div>

      {/* Tab navigation if multiple screens */}
      {screens.length > 1 && (
        <div className="flex gap-2 border-b border-gray-200 pb-0">
          {screens.map((screen, index) => (
            <button
              key={index}
              onClick={() => setActiveScreen(index)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeScreen === index
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {screen.title}
            </button>
          ))}
        </div>
      )}

      {/* Active screen content */}
      <div className="card">
        {screens[activeScreen] && (
          <>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{screens[activeScreen].title}</h2>
              <p className="text-sm text-gray-500">{screens[activeScreen].description}</p>
            </div>
            <div>{screens[activeScreen].component}</div>
          </>
        )}
      </div>

      {/* Features bar */}
      {features.length > 0 && (
        <div className="card bg-gray-50">
          <div className="flex flex-wrap gap-3">
            {features.map((feature, index) => (
              <span key={index} className="flex items-center gap-1 text-sm text-gray-600 bg-white px-3 py-1 rounded-full border">
                <Check className="w-3 h-3 text-green-500" /> {feature}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveProductPage;
