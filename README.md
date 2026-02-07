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
💡 Services Innovants pour StartUpLab
🚀 1. IA Pitch Coach (Haute valeur)
Analyse vidéo du pitch avec feedback IA (posture, ton, clarté)
Score de persuasion et suggestions d'amélioration
Simulation d'investisseur - questions difficiles générées par IA
💰 Modèle: 29€/pitch ou inclus dans plan Premium
📊 2. Market Validator (Très innovant)
Analyse automatique de la concurrence via scraping
Estimation de taille de marché avec données réelles
Score de viabilité du projet (0-100)
Tendances Google/Social intégrées
💰 Modèle: 49€/analyse ou abonnement
🤝 3. Co-Founder Matching (Networking monétisé)
Matching IA basé sur compétences complémentaires
Profils vérifiés (LinkedIn, portfolio)
Compatibilité personnalité via questionnaire
💰 Modèle: 19€/mois pour accès aux matchs
📈 4. Investor CRM (B2B)
Base de données investisseurs (Business Angels, VC)
Tracking des interactions et relances
Templates d'emails personnalisés
Alertes nouveaux investisseurs dans le secteur
💰 Modèle: 99€/mois (Pro)
🧪 5. Landing Page A/B Tester (Growth)
Générateur de landing pages pour valider l'idée
A/B testing intégré avec analytics
Collecte d'emails early adopters
💰 Modèle: 15€/page ou illimité en Premium
📝 6. Legal Doc Generator (Essentiel)
Statuts juridiques auto-générés
CGV/CGU personnalisées
Contrats co-fondateurs
Pacte d'associés
💰 Modèle: 39€/document ou pack 149€
-------------------------------------------------------------------------
📣 9. Marketing Digital & Growth Hacking

Indispensable pour startups tunisiennes

Services

Stratégie marketing digitale personnalisée

Gestion réseaux sociaux (Facebook, Instagram, LinkedIn)

Copywriting publicitaire

Email marketing & funnels

Automatisation WhatsApp Business

IA

Générateur de campagnes publicitaires

Analyse performances (ROAS, CTR)

Suggestions d’amélioration

💰 Modèle

Pack marketing startup : 299 TND / mois

Campagne unique : 99 TND

Premium illimité
-------------------------------------------------------------------------
🎯 10. Sponsoring & Publicité Payante (Ads)

Très demandé mais mal maîtrisé localement

Plateformes

Facebook & Instagram Ads

Google Ads

TikTok Ads (très fort en Tunisie)

LinkedIn Ads (B2B)

Fonctionnalités

Création automatique des visuels & textes

Estimation budget optimal

Simulation résultats avant lancement

💰 Modèle

Setup campagne : 149 TND

Gestion mensuelle : 20% du budget pub

Pack lancement startup : 399 TND
-------------------------------------------------------------------------
Marketplace de Freelancers Tunisiens

Développeurs

Designers

Marketeurs

Juristes

Comptables

💰 Commission 10–15% par mission
-------------------------------------------------------------------------
📦 STRUCTURE DU MODULE (ADD-ON)
🔹 Add-on 1 : Comptabilité Essentielle (29 TND / mois)
Fonctionnalités incluses

Saisie des revenus

Saisie des dépenses

Calcul automatique :

chiffre d’affaires

charges

bénéfice (gain)

Tableau mensuel des gains

Graphiques simples

Export PDF basique

👉 Cible : startups early-stage

🔹 Add-on 2 : Comptabilité Avancée + IA (49 TND / mois)
Fonctionnalités incluses

Tout le module Essentiel

Bilan comptable automatique

Compte de résultat

Cash Flow

Prévision financière (3–12 mois)

Alertes pertes / burn rate

Conseils IA financiers

Export PDF & Excel

👉 Cible : startups qui cherchent financement / investisseurs

🧱 FONCTIONNALITÉS DÉTAILLÉES (À DÉVELOPPER)
1️⃣ Revenus

Type : vente / service / abonnement

Montant

Date

Client (optionnel)

TVA (optionnelle)

2️⃣ Dépenses

Catégorie (marketing, salaire, outils…)

Montant

Date

Justificatif (upload)

3️⃣ Calculs automatiques
Chiffre d’affaires = somme des revenus
Charges = somme des dépenses
Bénéfice = CA – Charges

4️⃣ Tableaux & graphiques

Revenus mensuels

Dépenses par catégorie

Gains nets

Évolution trésorerie

5️⃣ Exports

PDF (investisseur / banque)

Excel (comptable)

🔐 RÈGLES D’ACCÈS (LOGIQUE ABONNEMENT)
Plan principal	Add-on Comptabilité
Student	❌ Non disponible
Startup	✅ Optionnel
Founder Pro	✅ Inclus Essentiel / Avancé en option
-------------------------------------------------------------------------
🧩 Texte parfait pour ton mémoire

Le module Comptabilité & Finance est proposé comme supplément optionnel dans les abonnements StartUpLab, permettant aux utilisateurs de suivre leurs revenus, dépenses et gains, tout en générant automatiquement des bilans financiers utiles pour la prise de décision et l’accès au financement.
--------------------------------------------------------------------------------------
📘 Module Comptabilité – Startup
Bilan • Revenus • Gains • Résultat
1️⃣ La comptabilité : c’est quoi pour une startup ?

La comptabilité sert à :

savoir si la startup gagne ou perd de l’argent

montrer la situation financière aux investisseurs, banques, État

prendre de bonnes décisions (embauche, investissement, pricing)

👉 Elle repose sur 3 états financiers principaux :

Le Bilan

Le Compte de Résultat

Le Flux de Trésorerie (bonus, souvent demandé en startup)

2️⃣ Le BILAN comptable

📅 Photo de la startup à une date donnée

📊 Structure du bilan

Le bilan est toujours équilibré :

ACTIF = PASSIF

🟢 ACTIF (Ce que possède la startup)
Actif	Exemples startup
Actif immobilisé	Ordinateurs, serveurs, logiciels, site web
Actif circulant	Cash, banque, clients (factures à recevoir)

👉 Question clé :
Où est utilisé l’argent ?

🔵 PASSIF (D’où vient l’argent)
Passif	Exemples startup
Capitaux propres	Apport fondateurs, investisseurs
Dettes	Prêts bancaires, fournisseurs, impôts

👉 Question clé :
Qui a financé la startup ?

🧮 Exemple de bilan simple
ACTIF	Montant
Cash	20 000
Matériel	10 000
Total Actif	30 000
PASSIF	Montant
Capital fondateurs	25 000
Dettes	5 000
Total Passif	30 000
3️⃣ Le COMPTE DE RÉSULTAT

📅 Sur une période (mois / année)

👉 Il répond à :
La startup gagne ou perd de l’argent ?

📈 REVENUS (Chiffre d’Affaires)

C’est l’argent gagné grâce à l’activité.

Exemples startup :

Abonnements SaaS

Vente d’applications

Prestations de services

Publicité

Commissions

📌 Revenus ≠ cash reçu
(on peut vendre sans être encore payé)

📉 CHARGES (Dépenses)
Charges	Exemples
Charges fixes	Salaires, loyer, hébergement
Charges variables	Marketing, publicité, commissions
Charges financières	Intérêts bancaires
Charges fiscales	Impôts, taxes
🧮 Résultat

Résultat = Revenus – Charges

Résultat positif → bénéfice ✅

Résultat négatif → perte ❌

🧾 Exemple

Revenus : 100 000 DT

Charges : 75 000 DT

➡️ Résultat net = 25 000 DT (gain)

4️⃣ Gains vs Revenus (important 🔥)
❗ Beaucoup confondent
Terme	Signification
Revenus	Argent généré par l’activité normale
Gains	Revenus – Charges
Profit / Bénéfice	Synonyme de gain

👉 Une startup peut :

avoir beaucoup de revenus

mais aucun gain (si charges élevées)

💡 Cas classique des startups en croissance 🚀

5️⃣ Spécificités comptables des STARTUPS
🔹 Dépenses fréquentes

R&D

Marketing digital

Cloud (AWS, Azure)

Développeurs

UX/UI

👉 Souvent pertes au début, c’est normal

🔹 Financement

Love money

Business Angels

Venture Capital

Subventions

➡️ Ces fonds vont surtout dans le passif (capitaux propres)

6️⃣ Trésorerie (Cash Flow) – SUPER important 💰

Une startup peut :

être rentable

mais faire faillite ❌
👉 si elle manque de cash

Flux de trésorerie :
Type	Exemple
Flux d’exploitation	Abonnements encaissés
Flux d’investissement	Achat serveurs
Flux de financement	Levée de fonds
    __________________________________________________________________________
    4️⃣ Module Growth Hacking & Acquisition Client 📈

👉 Comment grandir sans brûler du cash.

Contenu :

Funnels d’acquisition

SEO / Ads / Social Media

Growth loops

Referral systems

Viralité

Automatisation marketing

🎯 Pourquoi rentable ?

Impact direct sur les ventes

Applicable immédiatement
______________________________________________________________________________
8️⃣ Module IA & Automatisation pour Startups 🤖🔥

👉 Module ULTRA tendance.

Contenu :

IA pour marketing

IA pour support client

IA pour finance

Automatisation no-code

Cas concrets (ChatGPT, Zapier, etc.)

🎯 Pourquoi rentable ?

Forte demande

Image innovation
