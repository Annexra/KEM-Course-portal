import { z } from 'zod';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'draft' | 'active' | 'in_review' | 'archived' | 'completed';
export type Department = 'Engineering' | 'DevOps' | 'Product' | 'Security' | 'Customer Support' | 'Operations';

export interface KnowledgeItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  department: Department;
  priority: Priority;
  status: Status;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  tags: string[];
  views: number;
  upvotes: number;
  createdAt: string;
  updatedAt: string;
  executionSteps?: string[];
  estimatedTime?: string;
}

export interface MetricCardData {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  period: string;
  iconName: string;
}

export interface ChartDataPoint {
  name: string;
  created: number;
  resolved: number;
  efficiency: number;
}

export interface DepartmentDistribution {
  name: Department;
  value: number;
  color: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  relatedArticles?: { id: string; title: string; category: string }[];
}

// Zod Schema for Knowledge & Workflow Submission Form
export const knowledgeFormSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(120, 'Title cannot exceed 120 characters'),
  summary: z
    .string()
    .min(15, 'Summary must be at least 15 characters')
    .max(300, 'Summary cannot exceed 300 characters'),
  content: z
    .string()
    .min(30, 'Content body must be at least 30 characters'),
  category: z.string().min(1, 'Please select a category'),
  department: z.enum([
    'Engineering',
    'DevOps',
    'Product',
    'Security',
    'Customer Support',
    'Operations',
  ]),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  estimatedTime: z.string().min(1, 'Please specify estimated execution time (e.g. 15 mins)'),
  tags: z.string().min(2, 'Provide at least one tag separated by commas'),
  executionStepsText: z.string().optional(),
});

export type KnowledgeFormValues = z.infer<typeof knowledgeFormSchema>;
