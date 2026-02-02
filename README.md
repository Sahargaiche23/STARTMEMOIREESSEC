# StartUpLab 🚀

Application web de création de startups pour accompagner les jeunes entrepreneurs tunisiens.

## 📋 Fonctionnalités

- **Générateur d'idées de startups** - Trouvez l'idée parfaite selon votre secteur et vos intérêts
- **Business Model Canvas** - Créez votre modèle économique avec des templates prêts à l'emploi
- **Branding** - Générez le nom, slogan et identité visuelle de votre startup
- **Business Plan PDF** - Créez un plan d'affaires complet et exportez-le en PDF
- **Pitch Deck** - Construisez une présentation pour vos investisseurs
- **Gestion de projet** - Tableau Kanban pour gérer vos tâches et votre équipe
- **Système de paiement** - Intégration avec D17, Flouci et banques tunisiennes

## 🛠️ Stack Technique

### Frontend
- React 18 avec Vite
- Tailwind CSS pour le styling
- Zustand pour la gestion d'état
- React Router pour la navigation
- Lucide React pour les icônes
- Recharts pour les graphiques

### Backend
- Node.js avec Express
- SQLite avec better-sqlite3
- JWT pour l'authentification
- PDFKit pour la génération de PDF
- bcryptjs pour le hashage des mots de passe

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Étapes

1. **Cloner le projet**
```bash
cd /home/sahar/Bureau/memoire/CascadeProjects/windsurf-project
```

2. **Installer les dépendances**
```bash
npm run install-all
```

3. **Configurer l'environnement**
Le fichier `.env` est déjà créé dans `/server/.env` avec les valeurs par défaut.
Modifiez `JWT_SECRET` pour la production.

4. **Lancer l'application**
```bash
npm run dev
```

L'application sera accessible sur :
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Structure du Projet

```
windsurf-project/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   ├── store/          # État global (Zustand)
│   │   └── utils/          # Utilitaires (API, helpers)
│   └── public/             # Assets statiques
├── server/                 # Backend Node.js
│   ├── src/
│   │   ├── database/       # Configuration SQLite
│   │   ├── middleware/     # Middlewares Express
│   │   └── routes/         # Routes API
│   └── data/               # Fichiers de base de données
└── package.json            # Scripts racine
```

## 🔐 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Utilisateur courant
- `PUT /api/auth/profile` - Mise à jour profil
- `PUT /api/auth/password` - Changement mot de passe

### Projets
- `GET /api/projects` - Liste des projets
- `POST /api/projects` - Créer un projet
- `GET /api/projects/:id` - Détails d'un projet
- `PUT /api/projects/:id` - Modifier un projet
- `DELETE /api/projects/:id` - Supprimer un projet

### Idées
- `POST /api/ideas/generate` - Générer des idées
- `GET /api/ideas` - Liste des idées sauvegardées
- `POST /api/ideas` - Sauvegarder une idée
- `POST /api/ideas/:id/to-project` - Convertir en projet

### Business Model
- `GET /api/business-model/project/:id` - Obtenir le canvas
- `POST /api/business-model/project/:id` - Sauvegarder le canvas
- `POST /api/business-model/generate` - Générer depuis template

### Branding
- `POST /api/branding/generate-names` - Générer des noms
- `POST /api/branding/generate-slogans` - Générer des slogans
- `POST /api/branding/generate-logo` - Suggestions de logo
- `GET /api/branding/project/:id` - Obtenir le branding
- `POST /api/branding/project/:id` - Sauvegarder le branding

### Business Plan
- `GET /api/business-plan/project/:id` - Obtenir le plan
- `POST /api/business-plan/project/:id` - Sauvegarder le plan
- `POST /api/business-plan/project/:id/pdf` - Générer PDF

### Pitch Deck
- `GET /api/pitch-deck/project/:id` - Obtenir le pitch deck
- `POST /api/pitch-deck/project/:id/create` - Créer depuis template
- `PUT /api/pitch-deck/project/:id/slides` - Mettre à jour les slides

### Tâches
- `GET /api/tasks/project/:id/kanban` - Vue Kanban
- `POST /api/tasks/project/:id` - Créer une tâche
- `PUT /api/tasks/:id` - Modifier une tâche
- `PATCH /api/tasks/:id/status` - Changer le statut
- `DELETE /api/tasks/:id` - Supprimer une tâche

### Paiements
- `GET /api/payments/plans` - Plans disponibles
- `GET /api/payments/methods` - Méthodes de paiement
- `GET /api/payments/subscription` - Abonnement actuel
- `POST /api/payments/initiate` - Initier un paiement
- `POST /api/payments/confirm/:id` - Confirmer un paiement

## 💳 Intégration Paiement

L'application supporte les méthodes de paiement tunisiennes :
- **D17** - Paiement mobile
- **Flouci** - Paiement mobile
- **Carte bancaire** - Visa/Mastercard tunisiennes
- **Virement bancaire** - IBAN

> Note: L'intégration actuelle est en mode simulation. Pour la production, connectez les APIs réelles de ces services.

## 🔒 Sécurité

- Authentification JWT avec expiration
- Hashage des mots de passe avec bcrypt
- Validation des entrées avec express-validator
- Protection CORS configurée
- Headers de sécurité recommandés pour la production

## 📱 Responsive Design

L'application est entièrement responsive et fonctionne sur :
- Desktop (1024px+)
- Tablette (768px - 1023px)
- Mobile (< 768px)

## 🌐 Déploiement

### Options recommandées
- **Frontend**: Netlify, Vercel
- **Backend**: Render, Railway, Heroku
- **Base de données**: Migrer vers PostgreSQL pour la production

### Variables d'environnement production
```env
PORT=5000
JWT_SECRET=votre_secret_tres_securise
NODE_ENV=production
```

## 📄 Licence

Projet développé dans le cadre d'un mémoire universitaire.

## 👥 Auteur

Développé avec ❤️ pour les entrepreneurs tunisiens.
