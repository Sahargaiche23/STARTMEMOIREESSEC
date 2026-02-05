// Subscription plans and their features
export const PLANS = {
  free: {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    limits: {
      projects: 1,
      ideas: 10,
      teamMembers: 1
    },
    features: {
      ideaGenerator: 'basic',
      businessModelCanvas: true,
      businessPlanPdf: false,
      pitchDeck: false,
      branding: false,
      teamManagement: false,
      exports: 'limited',
      apiAccess: false,
      whiteLabel: false,
      prioritySupport: false
    }
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 29,
    limits: {
      projects: 5,
      ideas: 50,
      teamMembers: 3
    },
    features: {
      ideaGenerator: 'advanced',
      businessModelCanvas: true,
      businessPlanPdf: true,
      pitchDeck: true,
      branding: false,
      teamManagement: false,
      exports: 'limited',
      apiAccess: false,
      whiteLabel: false,
      prioritySupport: false
    }
  },
  pro: {
    id: 'pro',
    name: 'Professionnel',
    price: 79,
    limits: {
      projects: -1, // unlimited
      ideas: -1,
      teamMembers: 10
    },
    features: {
      ideaGenerator: 'advanced',
      businessModelCanvas: true,
      businessPlanPdf: true,
      pitchDeck: true,
      branding: true,
      teamManagement: true,
      exports: 'unlimited',
      apiAccess: false,
      whiteLabel: false,
      prioritySupport: true
    }
  },
  enterprise: {
    id: 'enterprise',
    name: 'Entreprise',
    price: 199,
    limits: {
      projects: -1,
      ideas: -1,
      teamMembers: -1
    },
    features: {
      ideaGenerator: 'advanced',
      businessModelCanvas: true,
      businessPlanPdf: true,
      pitchDeck: true,
      branding: true,
      teamManagement: true,
      exports: 'unlimited',
      apiAccess: true,
      whiteLabel: true,
      prioritySupport: true
    }
  }
};

// Check if user has access to a feature
export const hasFeatureAccess = (userPlan, feature) => {
  const plan = PLANS[userPlan] || PLANS.free;
  return plan.features[feature] === true || plan.features[feature] === 'advanced' || plan.features[feature] === 'unlimited';
};

// Get plan limits
export const getPlanLimits = (userPlan) => {
  const plan = PLANS[userPlan] || PLANS.free;
  return plan.limits;
};

// Check if user can create more projects
export const canCreateProject = (userPlan, currentProjectCount) => {
  const limits = getPlanLimits(userPlan);
  if (limits.projects === -1) return true;
  return currentProjectCount < limits.projects;
};

// Check if user can generate more ideas
export const canGenerateIdea = (userPlan, currentIdeaCount) => {
  const limits = getPlanLimits(userPlan);
  if (limits.ideas === -1) return true;
  return currentIdeaCount < limits.ideas;
};

// Get feature level (basic, advanced, unlimited)
export const getFeatureLevel = (userPlan, feature) => {
  const plan = PLANS[userPlan] || PLANS.free;
  return plan.features[feature];
};

// Get minimum required plan for a feature
export const getRequiredPlan = (feature) => {
  for (const [planId, plan] of Object.entries(PLANS)) {
    if (plan.features[feature] === true || plan.features[feature] === 'advanced' || plan.features[feature] === 'unlimited') {
      return planId;
    }
  }
  return 'enterprise';
};

// Plan hierarchy for comparison
const PLAN_HIERARCHY = ['free', 'starter', 'pro', 'enterprise'];

export const isPlanAtLeast = (userPlan, requiredPlan) => {
  const userIndex = PLAN_HIERARCHY.indexOf(userPlan || 'free');
  const requiredIndex = PLAN_HIERARCHY.indexOf(requiredPlan);
  return userIndex >= requiredIndex;
};
