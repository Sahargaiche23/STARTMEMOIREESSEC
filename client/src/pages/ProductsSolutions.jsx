import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calculator, 
  Users, 
  Building2, 
  TrendingUp, 
  Briefcase, 
  Brain,
  Check,
  Star,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const iconMap = {
  Calculator,
  Users,
  Building2,
  TrendingUp,
  Briefcase,
  Brain
};

const ProductsSolutions = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userProducts, setUserProducts] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, userProductsRes] = await Promise.all([
        api.get('/products/categories'),
        api.get('/products/my-products').catch(() => ({ data: { products: [] } }))
      ]);
      setCategories(categoriesRes.data.categories);
      setUserProducts(userProductsRes.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateProduct = async (productId) => {
    try {
      await api.post('/products/activate', { productId });
      toast.success('Produit activé avec succès !');
      fetchData();
    } catch (error) {
      if (error.response?.data?.requiredPlan) {
        toast.error(`Abonnement ${error.response.data.requiredPlan} requis`);
      } else {
        toast.error(error.response?.data?.message || 'Erreur lors de l\'activation');
      }
    }
  };

  const isProductActivated = (productId) => {
    return userProducts.some(up => up.productId === productId);
  };

  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName] || Calculator;
    return IconComponent;
  };

  const filteredCategories = categories
    .filter(cat => selectedCategory === 'all' || cat.slug === selectedCategory)
    .map(cat => ({
      ...cat,
      products: cat.products.filter(prod => 
        prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter(cat => cat.products.length > 0 || searchTerm === '');

  const getPlanBadgeColor = (plan) => {
    switch (plan) {
      case 'student': return 'bg-gray-100 text-gray-700';
      case 'startup': return 'bg-blue-100 text-blue-700';
      case 'founder': return 'bg-purple-100 text-purple-700';
      case 'enterprise': return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPlanLabel = (plan) => {
    switch (plan) {
      case 'student': return 'Student';
      case 'startup': return 'Startup';
      case 'founder': return 'Founder Pro';
      case 'enterprise': return 'Enterprise';
      default: return plan;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Des logiciels et services pour chaque startup
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto mb-8">
              Quelle que soit la taille de votre startup, StartUpLab a la solution pour vous.
              Activez les modules dont vous avez besoin et développez votre entreprise.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un produit ou service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-300 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tous les produits
            </button>
            {categories.map((cat) => {
              const IconComponent = getIcon(cat.icon);
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.slug
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={selectedCategory === cat.slug ? { backgroundColor: cat.color } : {}}
                >
                  <IconComponent className="w-4 h-4" />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredCategories.map((category) => {
          const IconComponent = getIcon(category.icon);
          return (
            <div key={category.id} className="mb-16">
              {/* Category Header */}
              <div className="flex items-center gap-4 mb-8">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <IconComponent className="w-7 h-7" style={{ color: category.color }} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                  <p className="text-gray-600">{category.description}</p>
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.products.map((product) => (
                  <div 
                    key={product.id}
                    className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-primary-200 group relative"
                  >
                    {/* Badges */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      {product.isPopular === 1 && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                          <Star className="w-3 h-3 fill-current" />
                          Populaire
                        </span>
                      )}
                      {product.isNew === 1 && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          <Sparkles className="w-3 h-3" />
                          Nouveau
                        </span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 pr-20">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {product.description}
                      </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-2 mb-6">
                      {product.features.slice(0, 4).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                      {product.features.length > 4 && (
                        <p className="text-sm text-primary-600 font-medium">
                          +{product.features.length - 4} autres fonctionnalités
                        </p>
                      )}
                    </div>

                    {/* Price & Action */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">
                          {product.price} TND
                        </span>
                        <span className="text-gray-500 text-sm">/mois</span>
                        <div className="mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getPlanBadgeColor(product.requiredPlan)}`}>
                            {getPlanLabel(product.requiredPlan)}+
                          </span>
                        </div>
                      </div>
                      
                      {isProductActivated(product.id) ? (
                        <span className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-medium">
                          <Check className="w-4 h-4" />
                          Activé
                        </span>
                      ) : (
                        <button
                          onClick={() => handleActivateProduct(product.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors group-hover:shadow-md"
                        >
                          Activer
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {filteredCategories.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun produit trouvé
            </h3>
            <p className="text-gray-600">
              Essayez de modifier votre recherche ou vos filtres
            </p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Besoin d'une solution personnalisée ?
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Notre équipe peut créer des modules sur mesure pour votre startup. 
            Contactez-nous pour discuter de vos besoins spécifiques.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-colors"
          >
            Nous contacter
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductsSolutions;
