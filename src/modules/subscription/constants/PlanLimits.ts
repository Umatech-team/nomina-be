export enum PlanType {
  FREE = 'plan_free',
  PRO = 'plan_pro_monthly',
  ENTERPRISE = 'plan_enterprise',
}

export interface PlanLimits {
  maxWorkspaces: number;
  maxAccountsPerWorkspace: number;
  maxCategories: number;
  maxTransactionsPerMonth: number;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  [PlanType.FREE]: {
    maxWorkspaces: 1,
    maxAccountsPerWorkspace: 2,
    maxCategories: 10,
    maxTransactionsPerMonth: 50,
  },
  [PlanType.PRO]: {
    maxWorkspaces: 5,
    maxAccountsPerWorkspace: 10,
    maxCategories: 50,
    maxTransactionsPerMonth: -1, // Ilimitado
  },
  [PlanType.ENTERPRISE]: {
    maxWorkspaces: -1, // Ilimitado
    maxAccountsPerWorkspace: -1,
    maxCategories: -1,
    maxTransactionsPerMonth: -1,
  },
};

export function getPlanLimits(planId: string): PlanLimits {
  return PLAN_LIMITS[planId] ?? PLAN_LIMITS[PlanType.FREE]; // Default: FREE
}
