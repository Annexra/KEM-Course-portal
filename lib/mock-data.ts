import { KnowledgeItem, MetricCardData, ChartDataPoint, DepartmentDistribution } from '@/types';

export const MOCK_KNOWLEDGE_ITEMS: KnowledgeItem[] = [
  {
    id: 'kem-101',
    title: 'Kubernetes Multi-Region Cluster Failover Playbook',
    slug: 'kubernetes-multi-region-cluster-failover',
    summary: 'Step-by-step emergency procedure to redirect ingress traffic and migrate stateless services during a primary region outage.',
    content: `## Emergency Regional Failover Procedure

This runbook outlines the required actions when Primary Region US-East-1 experiences a network partition or datacenter failure.

### 1. Pre-requisites & Sanity Check
- Verify Datadog / Grafana alert confirms > 40% packet loss on ingress gateways.
- Ensure Cloudflare DNS API tokens are active in secret manager.

### 2. Traffic Shift via Global Traffic Management
\`\`\`bash
kubectl exec -it deployment/traffic-router -n edge -- ./shift-traffic.sh --target us-west-2 --percentage 100
\`\`\`

### 3. Stateful Storage Sync Verification
- Check PostgreSQL read-replica lag in Target Region: \`SELECT pg_last_wal_receive_lsn() - pg_last_wal_replay_lsn();\`
- Promote US-West-2 secondary database to Primary if replication lag < 50ms.

### 4. Post-Cutover Verification
Run automated canary test suite to confirm end-to-end API response time < 120ms.`,
    category: 'Runbook & Operations',
    department: 'DevOps',
    priority: 'urgent',
    status: 'active',
    author: {
      name: 'Alex Rivera',
      role: 'Principal SRE',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    tags: ['Kubernetes', 'DevOps', 'Failover', 'AWS', 'Emergency'],
    views: 1420,
    upvotes: 189,
    createdAt: '2026-08-14T09:20:00Z',
    updatedAt: '2026-09-28T14:10:00Z',
    executionSteps: [
      'Confirm incident scope via PagerDuty alerting dashboard',
      'Execute Cloudflare GTM traffic failover command',
      'Promote target region database replica to primary',
      'Notify #incident-response Slack channel with timestamped log',
    ],
    estimatedTime: '12 mins',
  },
  {
    id: 'kem-102',
    title: 'Zero-Trust API Gateway Authentication & OAuth2 Architecture',
    slug: 'zero-trust-api-gateway-auth',
    summary: 'Architectural overview and implementation details for JWT validation, mTLS handshake, and role-based access control (RBAC).',
    content: `## Zero-Trust Security Paradigm

Our API Gateway enforces mutual TLS (mTLS) combined with OAuth2 JWT Bearer token inspection at every service ingress.

### Key Architecture Components
1. **Envoy Proxy Sidecars**: Terminate mTLS and extract client certificates.
2. **Open Policy Agent (OPA)**: Evaluates fine-grained authorization policies in sub-millisecond time.
3. **Keycloak Identity Provider**: Issues short-lived access tokens (15-minute expiration) with RS256 signatures.

### Standard Request Flow
- Client requests JWT from Identity Provider using Client Credentials grant.
- Headers passed to backend include \`X-Auth-User-Id\`, \`X-Auth-Roles\`, and \`X-Tenant-Id\`.`,
    category: 'Architecture',
    department: 'Security',
    priority: 'high',
    status: 'active',
    author: {
      name: 'Dr. Elena Rostova',
      role: 'Chief Information Security Officer',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
    tags: ['Security', 'OAuth2', 'JWT', 'Zero-Trust', 'API Gateway'],
    views: 2150,
    upvotes: 342,
    createdAt: '2026-07-10T11:00:00Z',
    updatedAt: '2026-09-30T16:45:00Z',
    executionSteps: [
      'Issue client certificate via internal Vault PKI',
      'Configure Envoy filter chain with OPA authorization endpoint',
      'Register microservice scopes in OAuth2 server dashboard',
    ],
    estimatedTime: '45 mins',
  },
  {
    id: 'kem-103',
    title: 'Micro-Frontend Modular Asset Bundling & Performance Guide',
    slug: 'micro-frontend-asset-bundling',
    summary: 'Best practices for optimizing Webpack Module Federation, shared React dependencies, and tree-shaking across distributed web modules.',
    content: `## Optimizing Micro-Frontend Performance

When managing 8+ independent web micro-apps within a unified shell, preventing duplicated React DOM assets is critical for sub-second page loads.

### Module Federation Configuration
\`\`\`js
// webpack.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'dashboard_app',
      filename: 'remoteEntry.js',
      remotes: {
        analytics: 'analytics_app@https://cdn.kem.io/remotes/analytics.js',
      },
      shared: { react: { singleton: true }, 'react-dom': { singleton: true } },
    }),
  ],
};
\`\`\`

### Metrics & Budgets
- Shell bundle size budget: **< 120KB gzipped**
- Shared vendor chunk: **Single instance cached via CDN**`,
    category: 'Frontend Engineering',
    department: 'Engineering',
    priority: 'medium',
    status: 'active',
    author: {
      name: 'Marcus Chen',
      role: 'Staff Frontend Engineer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    tags: ['Frontend', 'Next.js', 'Performance', 'React', 'Webpack'],
    views: 980,
    upvotes: 124,
    createdAt: '2026-09-01T15:30:00Z',
    updatedAt: '2026-09-25T10:15:00Z',
    executionSteps: [
      'Verify singleton configuration in ModuleFederationPlugin',
      'Audit bundle report with Next.js Bundle Analyzer',
      'Test cross-module state hydration using Zustand store bridge',
    ],
    estimatedTime: '25 mins',
  },
  {
    id: 'kem-104',
    title: 'Product Requirements Document (PRD): Automated AI Knowledge Extraction',
    slug: 'prd-automated-ai-knowledge-extraction',
    summary: 'Functional and non-functional requirements for auto-indexing Slack conversations, GitHub Pull Requests, and Jira tickets into KEM vectors.',
    content: `## PRD: KEM Automated AI RAG Pipeline

### Executive Summary
Engineers spend an average of 4.2 hours per week searching for institutional knowledge buried in Slack threads and closed Pull Requests. This feature automatically extracts problem-solution pairs and ingests them into KEM Vector Database.

### User Stories
- As a Developer, I want to react with \`:kem-index:\` to any Slack message so it is summarized into a searchable KEM playbook.
- As a Team Lead, I want AI to alert me when 3 similar support requests occur without a documented knowledge article.

### Target KPIs
- **95% accuracy** on search vector retrieval
- **< 2 seconds** retrieval latency for AI Chat assistant queries`,
    category: 'Product Strategy',
    department: 'Product',
    priority: 'high',
    status: 'in_review',
    author: {
      name: 'Sarah Jenkins',
      role: 'VP of Product Management',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    },
    tags: ['Product', 'AI', 'RAG', 'PRD', 'Automation'],
    views: 1650,
    upvotes: 210,
    createdAt: '2026-09-15T08:00:00Z',
    updatedAt: '2026-10-01T11:00:00Z',
    executionSteps: [
      'Review engineering effort estimate with Data Team Lead',
      'Finalize Slack App scopes and OAuth security review',
      'Schedule Beta testing with 3 pilot engineering teams',
    ],
    estimatedTime: '30 mins',
  },
  {
    id: 'kem-105',
    title: 'Database Partitioning & Index Tuning for High-Throughput Logs',
    slug: 'database-partitioning-index-tuning',
    summary: 'Guidelines for PostgreSQL declarative time-series table partitioning, BRIN indexes, and vacuum maintenance on 100M+ row tables.',
    content: `## PostgreSQL Partitioning Strategy

For logs and execution event tables growing past 10 million rows daily, standard B-Tree indexing degrades insert performance.

### Declarative Range Partitioning
\`\`\`sql
CREATE TABLE execution_logs (
    id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    payload JSONB
) PARTITION BY RANGE (created_at);

-- Monthly partition creation script
CREATE TABLE execution_logs_2026_10 PARTITION OF execution_logs
    FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
\`\`\`

### BRIN Index Optimization
Use Block Range Indexes (BRIN) on \`created_at\` for 99% smaller index footprints.`,
    category: 'Database & Storage',
    department: 'Engineering',
    priority: 'medium',
    status: 'active',
    author: {
      name: 'David Kim',
      role: 'Lead Database Architect',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
    tags: ['PostgreSQL', 'Database', 'Indexing', 'SQL', 'Performance'],
    views: 820,
    upvotes: 95,
    createdAt: '2026-08-20T14:15:00Z',
    updatedAt: '2026-09-18T16:00:00Z',
    executionSteps: [
      'Create range partitions 2 months in advance via cron job',
      'Verify BRIN index usage via EXPLAIN ANALYZE queries',
      'Set pg_cron automated drop policy for partitions older than 180 days',
    ],
    estimatedTime: '40 mins',
  },
  {
    id: 'kem-106',
    title: 'Customer Onboarding SLA Escalation Matrix',
    slug: 'customer-onboarding-sla-escalation-matrix',
    summary: 'Standard operating protocol for resolving enterprise onboarding blockers and escalating priority tickets to tier-3 engineering.',
    content: `## Enterprise Customer Escalation Standard

When an Enterprise Tier customer encounters setup friction during SSO configuration or API integration, follow this response matrix.

### SLA Timeframes
- **Level 1 (Blocker)**: 15-minute initial response | 2-hour resolution SLA
- **Level 2 (Major)**: 1-hour initial response | 8-hour resolution SLA
- **Level 3 (Minor)**: 4-hour response | 48-hour resolution SLA

### Primary Escalation Contacts
- Tier 3 On-Call Lead: PagerDuty \`@oncall-eng-support\`
- Executive Sponsor: Director of Customer Success`,
    category: 'Operations',
    department: 'Customer Support',
    priority: 'high',
    status: 'active',
    author: {
      name: 'Chloe Bennett',
      role: 'Head of Customer Success',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    },
    tags: ['Support', 'SLA', 'Escalation', 'Operations', 'Enterprise'],
    views: 640,
    upvotes: 78,
    createdAt: '2026-07-28T10:00:00Z',
    updatedAt: '2026-09-12T12:30:00Z',
    executionSteps: [
      'Tag ticket as #enterprise-blocker in Zendesk/Jira',
      'Trigger PagerDuty incident if resolution time exceeds 60 minutes',
      'Schedule post-incident debrief with customer technical lead',
    ],
    estimatedTime: '15 mins',
  },
];

export const MOCK_METRIC_CARDS: MetricCardData[] = [
  {
    title: 'Total Knowledge Articles',
    value: '1,482',
    change: '+14.2%',
    isPositive: true,
    period: 'vs last month',
    iconName: 'BookOpen',
  },
  {
    title: 'Execution Workflows Active',
    value: '348',
    change: '+8.7%',
    isPositive: true,
    period: 'vs last month',
    iconName: 'Zap',
  },
  {
    title: 'Mean Time to Resolution (MTTR)',
    value: '18.4 mins',
    change: '-24.6%',
    isPositive: true,
    period: 'vs last month',
    iconName: 'Clock',
  },
  {
    title: 'AI Search Accuracy',
    value: '98.6%',
    change: '+2.1%',
    isPositive: true,
    period: 'vs last month',
    iconName: 'Sparkles',
  },
];

export const MOCK_CHART_DATA: ChartDataPoint[] = [
  { name: 'Mon', created: 24, resolved: 28, efficiency: 92 },
  { name: 'Tue', created: 35, resolved: 32, efficiency: 88 },
  { name: 'Wed', created: 48, resolved: 46, efficiency: 95 },
  { name: 'Thu', created: 52, resolved: 50, efficiency: 96 },
  { name: 'Fri', created: 40, resolved: 43, efficiency: 98 },
  { name: 'Sat', created: 18, resolved: 20, efficiency: 99 },
  { name: 'Sun', created: 14, resolved: 16, efficiency: 100 },
];

export const MOCK_DEPARTMENT_DISTRIBUTION: DepartmentDistribution[] = [
  { name: 'Engineering', value: 42, color: '#6366f1' },
  { name: 'DevOps', value: 25, color: '#06b6d4' },
  { name: 'Product', value: 15, color: '#10b981' },
  { name: 'Security', value: 10, color: '#f43f5e' },
  { name: 'Operations', value: 8, color: '#f59e0b' },
];

export const MOCK_AI_KNOWLEDGE_BASE = [
  {
    keywords: ['kubernetes', 'failover', 'cluster', 'outage', 'region'],
    reply: 'For Kubernetes region outages, follow the **Kubernetes Multi-Region Cluster Failover Playbook** (`kem-101`). Execute: `kubectl exec -it deployment/traffic-router -n edge -- ./shift-traffic.sh --target us-west-2` and verify DB replica lag is < 50ms.',
    articleId: 'kem-101',
  },
  {
    keywords: ['security', 'oauth', 'jwt', 'mtls', 'zero trust', 'auth'],
    reply: 'Our security architecture enforces Zero-Trust with mTLS via Envoy Proxy sidecars and 15-minute OAuth2 JWTs issued by Keycloak. Check `kem-102` for full mTLS & OPA configuration steps.',
    articleId: 'kem-102',
  },
  {
    keywords: ['frontend', 'react', 'webpack', 'bundle', 'micro-frontend'],
    reply: 'To optimize micro-frontend bundles, set singleton sharing for `react` & `react-dom` in Webpack ModuleFederationPlugin (`kem-103`). Keep the shell app under 120KB gzipped.',
    articleId: 'kem-103',
  },
  {
    keywords: ['prd', 'rag', 'slack', 'extract', 'ai'],
    reply: 'The PRD for Automated AI Knowledge Extraction (`kem-104`) specifies Slack message indexing via `:kem-index:` emoji reaction and Jira vector synchronization with < 2s latency.',
    articleId: 'kem-104',
  },
  {
    keywords: ['postgres', 'database', 'sql', 'index', 'partition'],
    reply: 'For heavy log tables in PostgreSQL, implement monthly range partitioning and BRIN indexes (`kem-105`) to achieve 99% smaller index sizes compared to standard B-Trees.',
    articleId: 'kem-105',
  },
];
