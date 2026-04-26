import type {
  DamageType,
  FeedbackCategory,
  FeedbackPriority,
  FeedbackStatus,
  Role,
} from '@prisma/client';

export const FEEDBACK_CATEGORIES = {
  FAULT: 'FAULT',
  DAMAGE: 'DAMAGE',
  SUGGESTION: 'SUGGESTION',
} as const satisfies Record<string, FeedbackCategory>;

export const FEEDBACK_PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const satisfies Record<string, FeedbackPriority>;

export const FEEDBACK_STATUSES = {
  PENDING: 'PENDING',
  RESOLVED: 'RESOLVED',
  ESCALATED: 'ESCALATED',
  CHARGEABLE: 'CHARGEABLE',
} as const satisfies Record<string, FeedbackStatus>;

export const DAMAGE_TYPES = {
  NATURAL: 'NATURAL',
  INTENTIONAL: 'INTENTIONAL',
} as const satisfies Record<string, DamageType>;

export const FEEDBACK_MANAGER_ROLE = 'MANAGER' as Role;
