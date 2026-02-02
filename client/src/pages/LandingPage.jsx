import { Link } from 'react-router-dom';
import { 
  Rocket, 
  Lightbulb, 
  LayoutGrid, 
  Palette, 
  FileText, 
  Presentation, 
  Users,
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: Lightbulb,
      title: 'Générateur d\'idées',
      description: 'Trouvez l\'idée de startup parfaite grâce à notre générateur intelligent basé sur vos intérêts et le marché tunisien.'
    },
    {
      icon: LayoutGrid,
      title: 'Business Model Canvas',
      description: 'Créez votre modèle économique avec des templates prêts à l\'emploi et personnalisables.'
    },
    {
      icon: Palette,
      title: 'Branding Complet',
      description: 'Générez le nom, le slogan et l\'identité visuelle de votre startup en quelques clics.'
    },
    {
      icon: FileText,
      title: 'Business Plan PDF',
      description: 'Créez un business plan professionnel et exportez-le en PDF pour vos investisseurs.'
    },
    {
      icon: Presentation,
      title: 'Pitch Deck',
      description: 'Construisez un pitch deck impactant avec nos templates optimisés pour les levées de fonds.'
    },
    {
      icon: Users,
      title: 'Gestion de Projet',
      description: 'Gérez vos tâches et votre équipe avec un tableau Kanban intégré.'
    }
  ];

  const testimonials = [
    {
      name: 'Ahmed Ben Ali',
      role: 'Fondateur, TechStartup',
      content: 'StartUpLab m\'a permis de structurer mon idée et de créer un business plan en quelques heures seulement.',
      rating: 5
    },
    {
      name: 'Sarah Trabelsi',
      role: 'CEO, EcoSolutions',
      content: 'Un outil indispensable pour tout entrepreneur tunisien. Le générateur d\'idées est incroyable !',
      rating: 5
    },
    {
      name: 'Mohamed Karim',
      role: 'Co-fondateur, FinApp',
      content: 'Grâce au pitch deck généré, j\'ai pu lever 100K TND auprès d\'investisseurs locaux.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <Rocket className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold gradient-text">StartUpLab</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Fonctionnalités</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900">Témoignages</a>
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900">Tarifs</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-700 hover:text-gray-900 font-medium">
                Connexion
              </Link>
              <Link to="/register" className="btn-primary">
                Commencer gratuitement
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            La plateforme #1 pour les startups en Tunisie
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Créez votre <span className="gradient-text">startup</span><br />
            de l'idée au lancement
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Tous les outils dont vous avez besoin pour transformer votre idée en une startup réussie. 
            Générateur d'idées, business model, branding, business plan et plus encore.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-lg px-8 py-3 flex items-center justify-center gap-2">
              Démarrer gratuitement
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#features" className="btn-secondary text-lg px-8 py-3">
              Découvrir les fonctionnalités
            </a>
          </div>
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Gratuit pour commencer</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Pas de carte bancaire</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Support en français</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tout ce qu'il faut pour lancer votre startup
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Des outils puissants et intuitifs pour chaque étape de la création de votre entreprise.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card-hover">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ils ont lancé leur startup avec nous
            </h2>
            <p className="text-lg text-gray-600">
              Découvrez les témoignages de nos utilisateurs satisfaits.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-700 font-semibold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Prêt à lancer votre startup ?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Rejoignez des centaines d'entrepreneurs tunisiens qui utilisent StartUpLab pour concrétiser leurs idées.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-600 font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors">
            Créer mon compte gratuitement
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Rocket className="w-8 h-8 text-primary-400" />
                <span className="text-xl font-bold text-white">StartUpLab</span>
              </div>
              <p className="text-sm">
                La plateforme tout-en-un pour créer votre startup en Tunisie.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Fonctionnalités</a></li>
                <li><Link to="/pricing" className="hover:text-white">Tarifs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Conditions d'utilisation</a></li>
                <li><a href="#" className="hover:text-white">Politique de confidentialité</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
            <p>&copy; {new Date().getFullYear()} StartUpLab. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
