export interface CommunicationTopic {
  id: string;
  title: string;
  domain: "SOFTWARE_ENGINEER" | "WEB_DEVELOPER" | "DATA_ANALYST" | "GENERAL_ENGINEERING";
  targetAudience: string;
  scenario: string;
  keyTalkingPoints: string[];
  evaluationCriteria: string[];
  prepDurationSeconds: number; // 300 (5 minutes)
  maxPresentationDurationSeconds: number; // 420 (7 minutes)
  minPresentationDurationSeconds: number; // 60 (1 minute minimum)
}

export const COMMUNICATION_TOPICS: CommunicationTopic[] = [
  {
    id: "se-rest-vs-graphql",
    title: "REST vs. GraphQL: Trade-offs, Architectural Styles & Client Fetching",
    domain: "SOFTWARE_ENGINEER",
    targetAudience: "Engineering Lead and Full-Stack Team",
    scenario:
      "Your team is modernizing a legacy backend serving both desktop and mobile clients with high latency on mobile networks. The mobile team proposes migrating from REST to GraphQL, while backend engineers are concerned about caching and server complexity. Present an architectural comparison and recommendation.",
    keyTalkingPoints: [
      "Fundamental differences: Resource-oriented fixed endpoints vs. schema-driven declarative queries",
      "Over-fetching and under-fetching: Mobile payload optimization and the N+1 query problem",
      "Caching strategies: HTTP status codes and CDN edge caching in REST vs. application-layer normalization (Apollo/Relay) in GraphQL",
      "Operational complexity: Query depth limiting, rate limiting, and security considerations",
      "Concrete recommendation: When to choose GraphQL, when REST remains superior, or how to hybridize",
    ],
    evaluationCriteria: [
      "Clear explanation of why N+1 occurs and how DataLoader mitigates it",
      "Honest assessment of CDN edge caching limitations with POST-based GraphQL",
      "Structured presentation with introduction, trade-off matrix, and practical conclusion",
    ],
    prepDurationSeconds: 300,
    maxPresentationDurationSeconds: 420,
    minPresentationDurationSeconds: 60,
  },
  {
    id: "se-database-indexing",
    title: "Demystifying Database Indexing: Explain B-Trees to a Non-Technical Stakeholder",
    domain: "SOFTWARE_ENGINEER",
    targetAudience: "Product Manager and Non-Technical Business Stakeholder",
    scenario:
      "A critical customer search dashboard has slowed from 200ms to 4.5 seconds after table size grew to 8 million rows. You need to request a maintenance window to implement database indexing. Explain how indexes work using clear analogies, why the query is currently slow, and the trade-offs on write speeds.",
    keyTalkingPoints: [
      "The Table Scan problem: The analogy of searching a 1,000-page textbook without an index (scanning page by page)",
      "How a B-Tree index functions: The textbook index analogy pointing directly to exact page numbers",
      "Search efficiency: Logarithmic lookup $O(\\log N)$ vs linear scan $O(N)$ explained simply",
      "The trade-off: Why we shouldn't index every single column (write latency on INSERT/UPDATE and storage overhead)",
      "Next steps: Summary of the proposed change and expected speedup for end users",
    ],
    evaluationCriteria: [
      "Use of accessible, relatable analogies without excessive mathematical jargon",
      "Clear explanation of the read-speed vs write-speed trade-off",
      "Confident stakeholder communication tone and clear action items",
    ],
    prepDurationSeconds: 300,
    maxPresentationDurationSeconds: 420,
    minPresentationDurationSeconds: 60,
  },
  {
    id: "se-microservices-monolith",
    title: "Monolith to Microservices: Architectural Decision-Making & Distributed Realities",
    domain: "SOFTWARE_ENGINEER",
    targetAudience: "VP of Engineering and Architecture Review Board",
    scenario:
      "A fast-growing startup with 35 engineers is experiencing deployment bottlenecks on a monolithic repository. Several engineers are advocating for breaking the entire application into microservices immediately. Present a balanced evaluation of when to split, distributed systems pitfalls, and alternatives.",
    keyTalkingPoints: [
      "The Modular Monolith alternative: Clean domain boundaries before network boundaries",
      "The hidden distributed cost: Network latency, partial failures, distributed tracing, and eventual consistency",
      "Database decomposition: Two-phase commit vs Saga pattern, and the risk of distributed monoliths",
      "Organizational alignment: Conway's Law and team autonomy as the primary justification for microservices",
      "Pragmatic migration strategy: The Strangler Fig pattern and incremental domain extraction",
    ],
    evaluationCriteria: [
      "Nuanced understanding that microservices solve organizational scaling, not code simplicity",
      "Clear explanation of the Strangler Fig pattern",
      "Professional pacing and executive-level architectural framing",
    ],
    prepDurationSeconds: 300,
    maxPresentationDurationSeconds: 420,
    minPresentationDurationSeconds: 60,
  },
  {
    id: "web-core-vitals-perf",
    title: "Modern Web Performance: Core Web Vitals (LCP, INP, CLS) & Rendering Pipelines",
    domain: "WEB_DEVELOPER",
    targetAudience: "Frontend Engineering Team and UX Leadership",
    scenario:
      "Your company e-commerce site experienced a drop in conversion and search engine ranking. Audit shows poor Core Web Vitals scores across mobile devices. Present an analysis of what these metrics measure, browser rendering bottlenecks, and actionable engineering optimizations.",
    keyTalkingPoints: [
      "The 3 Core Web Vitals: Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and Cumulative Layout Shift (CLS)",
      "LCP Optimization: Critical rendering path, image formats (WebP/AVIF), fetch priority, and server-side rendering",
      "INP (replaces FID): Main thread blocking, JavaScript execution budget, breaking long tasks with scheduler/yield",
      "CLS prevention: Explicit aspect-ratio on images/embeds, font loading strategies, and avoiding dynamic content injection above fold",
      "Measurement tooling: Field data (CrUX) vs Lab data (Lighthouse) and continuous performance monitoring",
    ],
    evaluationCriteria: [
      "Precise explanation of INP and why interaction responsiveness matters over static load",
      "Concrete technical remedies for each of the three metrics",
      "Structured, persuasive delivery connecting technical metrics to business outcomes",
    ],
    prepDurationSeconds: 300,
    maxPresentationDurationSeconds: 420,
    minPresentationDurationSeconds: 60,
  },
  {
    id: "web-auth-security",
    title: "Web Security Architecture: JWT vs. HttpOnly Sessions, CSRF, and XSS Defenses",
    domain: "WEB_DEVELOPER",
    targetAudience: "Security Architect and Junior Full-Stack Developers",
    scenario:
      "A junior developer stored sensitive JWT access tokens in browser localStorage. You need to present a security briefing explaining why localStorage is vulnerable to XSS, compare HttpOnly cookie sessions with stateless JWTs, and outline CSRF mitigations.",
    keyTalkingPoints: [
      "The vulnerability of localStorage: Any third-party script or injected XSS vulnerability can read `localStorage.getItem('token')`",
      "HttpOnly, Secure, SameSite cookies: How browser cookie isolation prevents client-side JavaScript access",
      "Stateful Session vs Stateless JWT: Token revocation challenges, database lookup trade-offs, and microservice propagation",
      "CSRF defense in modern browsers: SameSite=Lax/Strict and anti-CSRF token verification for mutating requests",
      "Defense-in-depth: Content Security Policy (CSP), input sanitization, and context-aware escaping",
    ],
    evaluationCriteria: [
      "Accurate distinction between XSS (script execution) and CSRF (unauthorized state change)",
      "Clear rationale for why HttpOnly cookies protect against token exfiltration",
      "Teaching-oriented tone suitable for mentoring junior engineers",
    ],
    prepDurationSeconds: 300,
    maxPresentationDurationSeconds: 420,
    minPresentationDurationSeconds: 60,
  },
  {
    id: "data-batch-vs-streaming",
    title: "Data Architecture: Batch vs. Real-Time Streaming Pipelines with Trade-offs",
    domain: "DATA_ANALYST",
    targetAudience: "Head of Data Engineering and Business Intelligence Stakeholders",
    scenario:
      "A business stakeholder asks why every dashboard and analytics report can't be updated in 'pure real-time sub-second streaming'. Present an explanation of batch processing vs streaming architecture, operational costs, data consistency guarantees, and hybrid architectures.",
    keyTalkingPoints: [
      "Batch Processing: Characteristics (scheduled, high throughput, deep aggregations, cost efficiency) with tools like Spark/dbt",
      "Stream Processing: Characteristics (event-by-event, low latency, windowing, out-of-order arrival) with tools like Kafka/Flink",
      "The cost and complexity curve: Why streaming requires 24/7 dedicated infrastructure, state storage, and complex deduplication",
      "Data consistency: Exactly-once vs at-least-once processing semantics",
      "The Lambda and Kappa Architectures: When to use micro-batching (e.g. 5-minute intervals) as a pragmatic middle ground",
    ],
    evaluationCriteria: [
      "Clear explanation of why business needs should dictate latency requirements, not tech hype",
      "Accurate explanation of event time vs processing time and windowing",
      "Executive balance of technical feasibility and infrastructure costs",
    ],
    prepDurationSeconds: 300,
    maxPresentationDurationSeconds: 420,
    minPresentationDurationSeconds: 60,
  },
  {
    id: "data-ab-testing-stats",
    title: "A/B Testing Rigor: Sample Size, Statistical Significance & Avoiding P-Hacking",
    domain: "DATA_ANALYST",
    targetAudience: "Product Managers and Growth Marketing Leads",
    scenario:
      "A growth marketer stopped an A/B test after 36 hours because 'variant B had a p-value of 0.03 with a +15% conversion lift'. Present a briefing on why early stopping invalidates statistical tests, sample size calculation, and how to conduct rigorous experiments.",
    keyTalkingPoints: [
      "The false positive hazard: How repeated peeking inflates Type I error rates (the 'peeking problem')",
      "Sample size determination: Statistical power (1 - beta), significance level (alpha = 0.05), and minimum detectable effect (MDE)",
      "Simpson's Paradox and Day-of-Week effects: Why full business cycles (7 or 14 full days) must run",
      "Guardrail metrics: Measuring secondary impacts (e.g. higher clicks causing higher refund rates or latency)",
      "Standard operating procedure: Fixed-horizon tests vs sequential testing methodologies",
    ],
    evaluationCriteria: [
      "Accurate statistical explanations rendered intuitive and accessible",
      "Constructive, non-confrontational tone when coaching stakeholders on statistical hygiene",
      "Clear actionable guidelines for future experiments",
    ],
    prepDurationSeconds: 300,
    maxPresentationDurationSeconds: 420,
    minPresentationDurationSeconds: 60,
  },
  {
    id: "eng-postmortem-incident",
    title: "Engineering Incident Postmortem: Root Cause Analysis, 5 Whys & Blameless Culture",
    domain: "GENERAL_ENGINEERING",
    targetAudience: "Engineering Department All-Hands",
    scenario:
      "A production database connection exhaustion took down the main service for 42 minutes during peak hours due to an unindexed query and missing connection pool limits. Present a blameless postmortem explaining the timeline, technical root cause, and systemic preventions.",
    keyTalkingPoints: [
      "Blameless Culture principle: Focus on system design flaws and safety guardrails, not individual human error",
      "The Incident Timeline: Detection (alerts), diagnosis, mitigation (circuit breaker / pool restart), and recovery",
      "Root Cause Analysis using the 5 Whys: Unindexed query -> slow execution -> connection pool saturated -> cascading healthcheck timeouts",
      "Immediate vs Long-term Remediations: Query optimization, aggressive query timeouts, pool sizing, and circuit breakers",
      "Future Safeguards: Load testing in staging, automated alerting thresholds, and runbook documentation",
    ],
    evaluationCriteria: [
      "Empathetic, blameless posture emphasizing psychological safety and engineering resilience",
      "Logical causal chain tracing from trigger to cascading failure",
      "Prioritized, high-impact action items with clear ownership",
    ],
    prepDurationSeconds: 300,
    maxPresentationDurationSeconds: 420,
    minPresentationDurationSeconds: 60,
  },
];

export function getTopicById(id: string): CommunicationTopic | undefined {
  return COMMUNICATION_TOPICS.find((t) => t.id === id);
}

export function getRandomTopic(domain?: string): CommunicationTopic {
  const filtered = domain
    ? COMMUNICATION_TOPICS.filter((t) => t.domain === domain || t.domain === "GENERAL_ENGINEERING")
    : COMMUNICATION_TOPICS;
  const list = filtered.length > 0 ? filtered : COMMUNICATION_TOPICS;
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}
