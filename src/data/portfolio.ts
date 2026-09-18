export const personalInfo = {
  name: "Malav Gajera",
  title: "Backend & Cloud Engineer",
  email: "gajera.ma@northeastern.edu",
  phone: "+1 857-605-9334",
  github: "https://github.com/malav-250",
  linkedin: "https://www.linkedin.com/in/malav-gajera-884003202/",
  resumeUrl: "/resume.pdf",
  location: "Boston, MA",
};

export const heroContent = {
  headline: "Backend & Cloud",
  headlineAccent: "Engineer",
  subheadline:
    "MS in Software Engineering @ Northeastern (3.9 GPA), graduating Dec 2026. Building production APIs, cloud infrastructure, and CI/CD pipelines. Most recently a Software Engineer Co-op at Crewasis in New York.",
  stats: [
    { value: "3.9", label: "MS GPA — Northeastern" },
    { value: "Dec '26", label: "Graduating" },
    { value: "Jan '27", label: "Available Full-Time" },
  ],
};

export const aboutContent = {
  description:
    "I'm a Master's student at Northeastern University finishing my MS in Software Engineering (3.9 GPA), graduating December 2026. Most recently I spent five months in New York as a Software Engineer Co-op at Crewasis — writing Django APIs, optimizing PostgreSQL queries, provisioning AWS infrastructure, and shipping weekly. Before that, two internships at Tatvasoft in Ahmedabad building REST APIs in C#/ASP.NET Core, and nine months as a research assistant at Nirma University working on reinforcement learning and audio classification. I focus on backend services, cloud infrastructure, and the CI/CD that ties them together.",
  highlights: [
    {
      title: "Backend Services",
      description:
        "Building REST APIs with Django, Spring Boot, FastAPI, and ASP.NET Core. Query optimization, connection pooling, and caching with Redis for low-latency responses.",
      icon: "server",
    },
    {
      title: "Cloud & Infrastructure",
      description:
        "AWS (EC2, RDS, S3, Lambda, SNS), Terraform IaC, Docker containers, and GitHub Actions CI/CD. Infrastructure that's reproducible and version-controlled.",
      icon: "cloud",
    },
    {
      title: "Databases & Storage",
      description:
        "PostgreSQL, MySQL, MongoDB, Redis. Schema design, indexing strategies, query plan analysis, and caching layers for production workloads.",
      icon: "database",
    },
  ],
};

export interface ProjectDecision {
  title: string;
  body: string;
}

export interface ProjectScreenshot {
  // Path relative to /public (e.g. "/screenshots/foo.png")
  src: string;
  alt: string;
  caption?: string;
  // Optional kind hint for layout (full-bleed dashboard vs. social card)
  kind?: "dashboard" | "card" | "diagram";
}

export interface CaseStudy {
  // Reading time estimate ("4 min read")
  readingTime?: string;
  // Architecture diagram in Mermaid syntax
  architecture: {
    diagram: string;
    caption?: string;
  };
  // Deeper problem framing for the detail page
  problemDeep: string;
  // The interesting technical decisions, each with its trade-off
  decisions: ProjectDecision[];
  // What actually shipped / measurable outcomes
  outcomes: string[];
  // Honest list of what you'd improve / next steps
  nextSteps: string[];
  // Optional screenshots: repo OG cards, running dashboards, etc.
  screenshots?: ProjectScreenshot[];
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  problem: string;
  solution: string;
  impact: string[];
  techStack: string[];
  categories: string[];
  github?: string;
  live?: string;
  featured: boolean;
  badge?: string;
  caseStudy?: CaseStudy;
}

export const projects: Project[] = [
  // ── FEATURED ─────────────────────────────────────────────────
  {
    id: "distributed-task-queue",
    title: "Distributed Task Queue",
    subtitle: "Celery + RabbitMQ — Circuit Breakers, Observability, Terraform",
    description:
      "Production-grade distributed task queue processing asynchronous workloads (image transformation, PDF rendering, webhook dispatch) with FastAPI, Celery, and RabbitMQ. Includes fault-tolerant resilience patterns, full observability, and Terraform-based AWS deployment.",
    problem:
      "Async workloads like image processing and webhook delivery need reliable queue-based processing with retry logic, deduplication, and observability — without dropping messages under load.",
    solution:
      "Built a FastAPI service backed by Celery workers and RabbitMQ with exponential-backoff retries and application-level dead-letter routing, so a terminal failure lands in an inspectable, replayable state instead of disappearing. Added per-client sliding-window rate limiting, Redis-backed circuit breakers, and Postgres-enforced idempotency-key deduplication. Provisioned Prometheus + Grafana dashboards and structured JSON logging with correlation-ID tracing. Containerized 8 services via Docker Compose and codified AWS deployment (ECS Fargate, RDS, ElastiCache) with Terraform.",
    impact: [
      "Every terminal failure recorded in an inspectable dead-letter state — no silent drops",
      "Zero duplicate executions across 10K jobs under induced worker crashes",
      "8 containerized services with Prometheus/Grafana observability",
    ],
    techStack: [
      "FastAPI",
      "Celery",
      "RabbitMQ",
      "Redis",
      "Prometheus",
      "Grafana",
      "Docker Compose",
      "Terraform",
      "AWS ECS Fargate",
      "PostgreSQL",
    ],
    categories: ["backend", "cloud"],
    github: "https://github.com/malav-250/distributed-task-queue",
    featured: true,
    caseStudy: {
      readingTime: "5 min read",
      problemDeep:
        "Async workloads — image transforms, PDF rendering, webhook delivery — need queue-based processing. Production task queues fail in subtle ways: silent message drops under broker restarts, duplicate execution when a worker dies mid-task, and cascading failures when a downstream API gets slow and consumes every worker thread. A naive Celery setup hits all three within the first month of real traffic.",
      architecture: {
        diagram: `flowchart LR
    Client["FastAPI<br/>Producer"]
    RL[("Redis<br/>rate limit")]
    RMQ[["RabbitMQ<br/>main queue"]]
    Workers["Celery<br/>Workers"]
    DLQ[["Dead Letter<br/>Queue"]]
    CB[("Redis<br/>Circuit Breaker")]
    DB[("PostgreSQL<br/>job state<br/>+ idempotency")]
    Prom["Prometheus"]
    Graf["Grafana"]

    Client -->|"check limit"| RL
    Client -->|"check idem key"| DB
    Client -->|"publish"| RMQ
    RMQ --> Workers
    Workers -->|"retry × 3<br/>exp backoff"| RMQ
    Workers -->|"terminal failure"| DLQ
    Workers -->|"upstream slow"| CB
    Workers -->|"status transitions"| DB
    Workers -->|"metrics"| Prom
    Prom --> Graf`,
        caption:
          "The producer checks a Postgres-enforced idempotency key before publishing. RabbitMQ retries with exponential backoff; the worker's failure hook — not the broker — moves terminal failures to a DLQ and records the state transition in Postgres. Redis-backed circuit breakers shed load when downstream APIs slow down.",
      },
      decisions: [
        {
          title: "Dead-lettering in the application, not the broker",
          body: "RabbitMQ will dead-letter for you: set x-dead-letter-exchange on a queue and the broker routes rejected messages itself. I chose not to let it. Celery's failure hook classifies the exception, writes a dead_lettered status to Postgres, and forwards a summary to a dedicated queue. That makes the DLQ a SQL predicate rather than a FIFO queue — filterable, paginated, carrying per-attempt audit history, and replayable with a single HTTP call. The cost is real and I'd name it in an interview: broker-level dead-lettering keeps working when my application or my database is down, and mine does not.",
        },
        {
          title: "Idempotency keys, not natural-key dedup",
          body: "Natural-key dedup (e.g. 'has this user_id+image_id been processed?') breaks down when retries cross worker boundaries. Clients pass an idempotency key on enqueue and a uniqueness constraint on the jobs table enforces it, so a duplicate submission returns the original job with a 200 rather than creating a second one. Execution-level dedup is a separate mechanism: the worker skips a job only if it is already completed, and that status is written after the work finishes, never before — marking it first would turn a mid-task crash into silent loss.",
        },
        {
          title: "Circuit breakers in Redis, not in-process",
          body: "An in-process circuit breaker (e.g. pybreaker) doesn't share state across worker processes — each one has to fail independently before tripping. Backing the breaker state in Redis makes it cluster-wide: one worker tripping the breaker protects the whole pool from hammering a sick upstream.",
        },
        {
          title: "RabbitMQ over Kafka or SQS",
          body: "Kafka's strengths (high-throughput log, replay) didn't match the workload — these are jobs, not events. SQS is fine but FIFO queue limits made it awkward. RabbitMQ gives me per-queue priority support (x-max-priority), first-class Celery integration, and a well-understood operational model.",
        },
      ],
      outcomes: [
        "Every terminal failure landed in an inspectable dead_lettered state — no failure exited the system unrecorded",
        "Zero duplicate executions across 10K jobs with workers SIGKILL-ed mid-task",
        "At-least-once execution with a narrow residual window, not exactly-once — the duplicate-counting harness cannot certify zero loss",
        "8 services orchestrated via Docker Compose; Terraform deploys the same topology to ECS Fargate",
      ],
      nextSteps: [
        "Replace Docker Compose with EKS to practice K8s operational patterns",
        "Add OpenTelemetry distributed tracing — correlation IDs are propagated but not yet emitted as spans",
        "Add a Kafka topic for fan-out events (e.g. job completed → downstream consumers)",
        "Publish load-test results from k6 with p50/p95/p99 graphs as part of the README",
      ],
      screenshots: [
        {
          src: "/screenshots/repo-task-queue.png",
          alt: "GitHub repository preview for distributed-task-queue",
          caption: "Source repo on GitHub — FastAPI, Celery, RabbitMQ, observability stack",
          kind: "card",
        },
      ],
    },
  },
  {
    id: "voice-agent",
    title: "Real-Time AI Voice Agent",
    subtitle: "Sub-Second Phone Conversations — Streaming STT + LLM + TTS",
    description:
      "Production voice agent that handles real phone calls with sub-second response latency. Composes Deepgram STT/TTS with an LLM router into a streaming pipeline so the agent starts replying before the caller has finished speaking.",
    problem:
      "Real-time voice AI lives or dies on latency: every 200ms past a turn-taking threshold feels like an awkward pause. Naive STT → LLM → TTS pipelines serialize three slow systems and blow the budget on the first sentence.",
    solution:
      "Built a streaming pipeline over Twilio Media Streams (bidirectional WebSocket audio): Deepgram's STT emits partial transcripts as the caller speaks, an interrupt-aware router commits to a response once the utterance stabilizes, and TTS chunks stream back as the LLM token-streams. Barge-in support lets the user cut the agent off mid-sentence — the router drops in-flight TTS and resets to listening.",
    impact: [
      "Sub-second perceived latency via end-to-end streaming (no full STT→LLM→TTS wait)",
      "Barge-in support — caller can interrupt the agent mid-sentence",
      "Interrupt-aware router discards stale partial transcripts",
      "Twilio Media Streams + WebSocket for full-duplex audio",
    ],
    techStack: [
      "Python",
      "Deepgram",
      "Twilio Media Streams",
      "WebSocket",
      "LLM",
      "Streaming",
    ],
    categories: ["ai", "backend"],
    github: "https://github.com/malav-250/deepgram-voice-agent",
    featured: true,
    caseStudy: {
      readingTime: "4 min read",
      problemDeep:
        "Real-time voice AI lives or dies on perceived latency. Human turn-taking happens around 200ms; anything past 500ms feels awkward. A naive STT → LLM → TTS pipeline serializes three slow systems — each waits for the previous to finish — so the user hears a multi-second pause after every utterance. The voice agent needs to start replying before the caller has even finished speaking.",
      architecture: {
        diagram: `flowchart LR
    Phone["Phone Caller"]
    TW["Twilio<br/>Media Streams"]
    Server["FastAPI<br/>WebSocket Server"]
    STT["Deepgram STT<br/>(streaming)"]
    Router["Interrupt-Aware<br/>Router"]
    LLM["LLM<br/>(token stream)"]
    TTS["Deepgram TTS<br/>(streaming)"]

    Phone <-->|"audio"| TW
    TW <-->|"WebSocket<br/>bidirectional"| Server
    Server -->|"caller chunks"| STT
    STT -->|"partial<br/>transcripts"| Router
    Router -->|"stable<br/>utterance"| LLM
    LLM -->|"streaming<br/>tokens"| TTS
    TTS -->|"audio chunks"| Server
    Router -.->|"barge-in:<br/>drop in-flight"| TTS`,
        caption:
          "Audio streams in both directions over a single WebSocket. STT emits partial transcripts continuously; the router decides when the utterance is stable enough to commit to an LLM call. TTS chunks start playing as the LLM token-streams.",
      },
      decisions: [
        {
          title: "Stream everything, never wait",
          body: "Deepgram's STT emits partial transcripts every ~100ms. The LLM emits tokens as they're generated. TTS speaks chunks as they arrive. Every stage starts producing output before the previous stage finishes — total perceived latency becomes the latency of the *slowest single chunk*, not the sum of all stages.",
        },
        {
          title: "Interrupt-aware router for utterance commitment",
          body: "When does the caller actually mean 'go'? Pause detection is fragile (some people speak slowly, some don't pause). The router watches for transcript stability — when the last N partial transcripts agree on the same text, the utterance is committed and sent to the LLM. If the caller resumes speaking mid-commit, the in-flight LLM call is cancelled.",
        },
        {
          title: "Barge-in support",
          body: "When the agent is mid-sentence and the caller starts talking, the agent has to stop. The router detects new STT input, sends a cancellation signal to the LLM, and immediately drops the in-flight TTS audio buffer. This is the single biggest UX difference between a 'voice AI demo' and something a real customer would tolerate.",
        },
        {
          title: "Twilio Media Streams over WebRTC",
          body: "WebRTC would give lower latency but requires JS in a browser. Twilio Media Streams works over the public switched telephone network — any phone, anywhere, no app required. The latency hit (~80-150ms round-trip over the carrier network) is acceptable for the use case (customer service, scheduling, lead qualification).",
        },
      ],
      outcomes: [
        "End-to-end perceived latency well under 1 second on a real phone call",
        "Barge-in works reliably — caller can cut the agent off and the agent immediately yields",
        "Interrupt-aware router prevents 'commit and regret' loops when speech is hesitant",
        "Single FastAPI service handles the entire bidirectional audio pipeline",
      ],
      nextSteps: [
        "Add an eval harness: scripted dialogues + measured turn-taking latency + transcript accuracy",
        "Add a tool-calling layer (e.g. lookup calendar, book appointment) with structured-output validation",
        "Persist conversation transcripts + audio for offline review",
        "Test fallback paths: STT timeout, LLM provider outage, TTS quota exceeded",
      ],
      screenshots: [
        {
          src: "/screenshots/repo-voice-agent.png",
          alt: "GitHub repository preview for deepgram-voice-agent",
          caption: "Source repo on GitHub — streaming pipeline over Twilio Media Streams",
          kind: "card",
        },
      ],
    },
  },
  {
    id: "cloud-native-app",
    title: "Resilient Cloud Deployment Platform",
    subtitle: "Full AWS Stack — Terraform IaC, Multi-AZ, Blue-Green CI/CD",
    description:
      "Production-grade cloud platform spanning 3 repositories: a FastAPI web service, Terraform IaC for the full AWS stack, and serverless Lambda functions for event-driven email verification. Designed to survive an AZ outage and ship via PR-triggered rolling deploys.",
    problem:
      "Building a real production deployment surface — not a toy demo — means handling the hard parts: AZ failure, blue-green cutover, private-subnet databases, and IaC that you can hand off without a runbook.",
    solution:
      "FastAPI app on custom Packer AMIs deployed to an Auto Scaling Group spread across 3 AZs behind an ALB with SSL/TLS. RDS in private subnets reachable only from the app tier. Serverless email verification: SNS triggers Lambda, which writes tokens to DynamoDB and dispatches via SendGrid. Entire stack codified in Terraform — VPC, ASG, ALB, RDS, IAM roles. GitHub Actions handles PR validation, AMI bake, and rolling replacement.",
    impact: [
      "Multi-AZ VPC across 3 zones with Auto Scaling + ALB",
      "Terraform IaC managing every resource across 3 repos",
      "Zero-downtime CI/CD: PR validation → AMI bake → rolling deploy",
      "Serverless email flow: SNS → Lambda → DynamoDB → SendGrid",
    ],
    techStack: [
      "AWS",
      "Terraform",
      "FastAPI",
      "Packer",
      "GitHub Actions",
      "Lambda",
      "SNS",
      "DynamoDB",
      "RDS PostgreSQL",
      "S3",
    ],
    categories: ["cloud", "backend"],
    github: "https://github.com/malav-250/cloud-webapp",
    featured: true,
    caseStudy: {
      readingTime: "5 min read",
      problemDeep:
        "A 'real' production deployment surface — not a toy demo — has to handle the hard parts: AZ failure, blue-green cutover, private-subnet databases, IAM that follows least privilege, and infrastructure-as-code you can hand to the next engineer without a runbook. Most class projects stop at 'deploys to EC2'. This one had to survive an availability zone going dark.",
      architecture: {
        diagram: `flowchart TB
    User["User"]
    DNS["Route 53"]
    ALB{"ALB<br/>SSL/TLS"}

    subgraph VPC["VPC — 3 AZs"]
        subgraph Public["Public Subnets"]
            NAT["NAT Gateway"]
        end
        subgraph Private["Private Subnets"]
            EC2a["FastAPI EC2<br/>AZ-a"]
            EC2b["FastAPI EC2<br/>AZ-b"]
            EC2c["FastAPI EC2<br/>AZ-c"]
            RDS[("RDS PostgreSQL<br/>Multi-AZ")]
        end
    end

    S3[("S3<br/>image storage")]
    SNS["SNS<br/>signup events"]
    Lambda["Lambda<br/>email verifier"]
    DDB[("DynamoDB<br/>verification tokens")]
    SG["SendGrid"]

    User --> DNS
    DNS --> ALB
    ALB --> EC2a
    ALB --> EC2b
    ALB --> EC2c
    EC2a --> RDS
    EC2b --> RDS
    EC2c --> RDS
    EC2a --> S3
    EC2a -->|"user signed up"| SNS
    SNS --> Lambda
    Lambda --> DDB
    Lambda --> SG`,
        caption:
          "Three-AZ Auto Scaling Group behind an ALB. RDS lives in private subnets, reachable only from the app tier. Email verification runs as a serverless side-channel (SNS → Lambda → DynamoDB → SendGrid) so signup latency stays low.",
      },
      decisions: [
        {
          title: "3 AZs over 2",
          body: "AWS bills for cross-AZ traffic, so 3 AZs costs more than 2. But with 2 AZs, losing one means halving capacity instantly; with 3, you keep 67%. For a service that's supposed to survive a real outage, the math favors 3. Production AWS deployments rarely use fewer.",
        },
        {
          title: "Custom Packer AMIs over containers",
          body: "ECS/EKS would be cleaner long-term, but the goal here was to learn the IaC-from-scratch surface: VPC, subnets, route tables, SGs, IAM, ASG, launch templates. Packer bakes the FastAPI app + deps + systemd unit into an AMI; the ASG launches new instances from each AMI version. Slower than container redeploys, but every primitive is in Terraform.",
        },
        {
          title: "Blue-green via ASG instance refresh",
          body: "Each new AMI triggers an ASG instance refresh: new instances spin up on the new AMI, the ALB drains traffic from the old ones, and only after health checks pass does the cutover complete. If health checks fail, the refresh halts and the old fleet stays serving. This is the simplest CI/CD pattern that gives real zero-downtime semantics on EC2.",
        },
        {
          title: "DynamoDB for verification tokens, not RDS",
          body: "Tokens are short-lived (TTL-expiring), high-write, low-read, and access-pattern is just 'lookup by token string'. RDS would mean adding another connection from Lambda → RDS through a VPC endpoint (slow cold starts, more config). DynamoDB is fully managed, has built-in TTL, and Lambda hits it over the public AWS API with millisecond latency.",
        },
        {
          title: "SNS/Lambda for email — out of the request path",
          body: "Sending email synchronously during signup ties your p99 latency to SendGrid's worst day. By publishing to SNS instead and letting Lambda handle email, the signup request returns the moment the user row is persisted. If email is slow or failing, the user still gets a fast signup; verification just takes longer.",
        },
      ],
      outcomes: [
        "Multi-AZ VPC across 3 zones; verified failover by terminating instances in a single AZ",
        "Terraform manages every resource across 3 repos — webapp, infra, serverless",
        "Zero-downtime CI/CD: PR validation → AMI bake → ASG rolling refresh",
        "Serverless email side-channel keeps signup p99 latency decoupled from SendGrid",
      ],
      nextSteps: [
        "Add CloudFront in front of the ALB for global edge caching of static assets",
        "Migrate to ECS Fargate to drop the AMI bake step and tighten the deploy loop",
        "Run a real GameDay: terminate an AZ via Chaos Engineering and measure recovery time",
        "Publish a cost teardown — $/month per traffic tier, separated by service",
      ],
      screenshots: [
        {
          src: "/screenshots/repo-cloud-webapp.png",
          alt: "GitHub repository: FastAPI web service",
          caption: "FastAPI web service (repo 1 of 3)",
          kind: "card",
        },
        {
          src: "/screenshots/repo-cloud-iac.png",
          alt: "GitHub repository: Terraform infrastructure",
          caption: "Terraform IaC for the full AWS stack (repo 2 of 3)",
          kind: "card",
        },
        {
          src: "/screenshots/repo-cloud-serverless.png",
          alt: "GitHub repository: serverless email verification",
          caption: "Lambda email verifier (repo 3 of 3)",
          kind: "card",
        },
      ],
    },
  },
  {
    id: "transportation-platform",
    title: "Vehicle Rental Microservices Platform",
    subtitle: "Spring Boot — Concurrent Booking with Transactional Locks",
    description:
      "Ride-booking platform built on Spring Boot microservices. The interesting problem: prevent double-booking when multiple users hit checkout for the same vehicle in the same second. Solved with row-level locking on availability + Redis caching for high-read paths.",
    problem:
      "Ride-booking platforms face a fundamental race condition — two users at checkout for the same vehicle. Naive implementations either double-book and lose customer trust, or serialize every booking and kill throughput. Both are unacceptable.",
    solution:
      "Microservices in Java Spring Boot split along bounded contexts (auth, bookings, payments, notifications). Row-level pessimistic locks on the vehicle-availability table serialize only conflicting bookings — browsing and reads stay parallel. Redis caches hot read paths (vehicle listings, session state) so the database isn't hammered by traffic that doesn't need a write. JWT with role-scoped RBAC isolates customer, driver, and admin permissions. Next.js handles the frontend with server-side data fetching.",
    impact: [
      "Concurrent ride-booking via row-level locks — no double-bookings under contention",
      "Sub-200ms reads via Redis caching of vehicle listings and sessions",
      "JWT/RBAC isolating customer, driver, and admin permission sets",
      "Bounded-context microservices: auth, bookings, payments, notifications",
    ],
    techStack: [
      "Java",
      "Spring Boot",
      "PostgreSQL",
      "Redis",
      "JWT/RBAC",
      "Next.js",
    ],
    categories: ["backend"],
    github: "https://github.com/malav-250/transportation-platform",
    featured: true,
  },

  // ── OTHER PROJECTS ───────────────────────────────────────────
  {
    id: "distributed-training-infra",
    title: "Distributed Training Infrastructure",
    subtitle: "Multi-GPU Pipeline — PyTorch DDP, HDF5, ETL",
    description:
      "High-performance distributed training system using PyTorch DDP across multiple GPUs with optimized ETL pipelines and HDF5 compression for large datasets.",
    problem:
      "Training on 32GB+ datasets was bottlenecked by single-GPU processing and inefficient data loading that wasted compute time.",
    solution:
      "Engineered a multi-GPU pipeline using PyTorch DDP across 3 GPUs with parallelized gradient synchronization. Built an ETL pipeline with HDF5 compression and parallel feature extraction to eliminate I/O bottlenecks. Monitored with Weights & Biases dashboards.",
    impact: [
      "39% reduction in training time via multi-GPU parallelization",
      "25x faster data loading with HDF5 compression pipeline",
      "25% improved GPU utilization through batch size tuning",
      "Real-time experiment tracking with Weights & Biases",
    ],
    techStack: [
      "Python",
      "PyTorch DDP",
      "HDF5",
      "ETL",
      "Weights & Biases",
    ],
    categories: ["ai", "backend"],
    github: "https://github.com/malav-250/distributed-training-pipeline",
    featured: false,
  },

  // ── HACKATHONS ──────────────────────────────────────────────────
  {
    id: "rare-disease-hackathon",
    title: "RareSense — Rare Disease Diagnostic Tool",
    subtitle: "Harvard Rare Disease Hackathon 2025",
    description:
      "AI-powered diagnostic tool using phenotype-driven disease matching with the Human Phenotype Ontology (HPO) to help healthcare professionals identify rare genetic disorders.",
    problem:
      "Rare diseases affect millions but are notoriously difficult to diagnose, with patients often waiting years for an accurate diagnosis due to the vast number of potential conditions.",
    solution:
      "Built a Streamlit-based web application that allows healthcare professionals to input patient phenotypes and match them against known genetic disorders using the HPO database, providing ranked differential diagnoses.",
    impact: [
      "Phenotype-driven matching across known genetic disorders",
      "Built at Harvard Rare Disease Hackathon 2025",
      "Interactive Streamlit UI for healthcare professionals",
      "Leverages Human Phenotype Ontology for accurate matching",
    ],
    techStack: [
      "Python",
      "Streamlit",
      "HPO",
      "Bioinformatics",
      "Data Science",
    ],
    categories: ["ai", "fullstack"],
    github: "https://github.com/malav-250/Harvard-Rare-Disease-Hackathon-2025",
    featured: false,
    badge: "Hackathon Winner",
  },
  {
    id: "papervet",
    title: "PaperVet — Research Paper Compliance AI",
    subtitle: "MINeD 2025 Hackathon · 3rd Place",
    description:
      "Computer-vision pipeline that audits research papers against submission guidelines automatically — catching formatting and compliance issues before reviewers see them.",
    problem:
      "Research papers frequently get desk-rejected on formatting alone (margins, fonts, figure resolution, citation style). Authors waste days on revisions that an automated checker could surface in seconds.",
    solution:
      "Built an OCR + computer-vision audit pipeline: PyTesseract extracts text, OpenCV measures layout properties (margins, line spacing, font sizes), and a rules engine validates each property against a configurable submission template. Generates an annotated PDF report flagging every violation with location and fix.",
    impact: [
      "40% reduction in research paper rejection rates among test users",
      "Annotated PDF reports pinpoint every compliance violation",
      "Configurable rule engine — swap submission templates per venue",
      "3rd place at MINeD 2025 Hackathon",
    ],
    techStack: [
      "Python",
      "OpenCV",
      "PyTesseract",
      "OCR",
      "Computer Vision",
      "Rule Engine",
    ],
    categories: ["ai", "fullstack"],
    featured: false,
    badge: "Hackathon Winner",
  },

  // ── CREATIVE ────────────────────────────────────────────────────
  {
    id: "air-chords",
    title: "Air Chords",
    subtitle: "Vision-Based Musical Interface with Hand Gestures",
    description:
      "Real-time computer vision application that transforms hand gestures into musical chords using OpenCV and MIDI synthesis.",
    problem:
      "Traditional musical instruments have steep learning curves. Gesture-based interfaces can make music creation more accessible and interactive.",
    solution:
      "Built a real-time vision-based musical interface using Python and OpenCV for hand gesture recognition, mapping detected gestures to MIDI chord synthesis for an intuitive, touchless musical experience.",
    impact: [
      "Real-time hand gesture recognition via OpenCV",
      "Gesture-to-MIDI chord mapping for touchless music creation",
      "Low-latency computer vision pipeline for responsive interaction",
      "Creative intersection of computer vision and music technology",
    ],
    techStack: [
      "Python",
      "OpenCV",
      "MIDI",
      "Computer Vision",
      "Real-Time Processing",
    ],
    categories: ["ai"],
    github: "https://github.com/malav-250/Air-Chords",
    featured: false,
  },

  // ── RESEARCH ────────────────────────────────────────────────────
  // Carried out as a Research Assistant at Nirma University under
  // Prof. Anuja Nair, Mar–Dec 2023. Neither project was published;
  // these are research + implementation, not papers.
  {
    id: "lung-sound-detection",
    title: "Lung Sound Disease Detection",
    subtitle: "Attention over Pre-trained EfficientNet — ICBHI 2017",
    description:
      "Six-class respiratory disease classification from lung auscultation audio, using mel-spectrogram features and an EfficientNet-B0 backbone with an added attention mechanism.",
    problem:
      "Respiratory disease screening from auscultation depends on clinician experience and is hard to scale. The ICBHI 2017 dataset is the standard benchmark, and it is small, class-imbalanced, and recorded on mixed hardware — which makes it very easy to build a model that scores well and generalises badly.",
    solution:
      "Carried out as a Research Assistant at Nirma University under Prof. Anuja Nair, under the working title 'Lung Sound Disease Detection using Attention over Pre-trained EfficientNet Architecture'. Audio was bandpass-filtered with a Butterworth filter between 250Hz and 2000Hz to keep the range where adventitious sounds live, augmented by time stretching, pitch shifting and audio shifting, and converted to mel spectrograms. Classification across six classes — Healthy, COPD, URTI, LRTI, Bronchiectasis and Pneumonia — used EfficientNet-B0 pre-trained on ImageNet with an attention mechanism added over the feature maps.",
    impact: [
      "~92% accuracy on a cycle-level split — optimistic, and stated here with the protocol because the protocol is the reason it is high",
      "ICBHI 2017 has 126 patients, so a cycle-level split places the same patient in train and test, and augmentation was applied before the split so augmented copies of one clip land on both sides",
      "A patient-level split is the correct protocol for this dataset and would score lower — for scale, on the official patient-disjoint split Nguyen & Pernkopf report an ICBHI score of 58.29% on the four-class sound-event task",
      "That is a different and harder task than six-class disease classification, so 92% isn't absurd — but the split, not the architecture, is what makes it high",
    ],
    techStack: [
      "Python",
      "PyTorch",
      "EfficientNet-B0",
      "Attention",
      "Librosa",
      "Mel Spectrograms",
      "ICBHI 2017",
    ],
    categories: ["research", "ai"],
    featured: false,
    badge: "Research",
  },
  {
    id: "vehicle-collision-avoidance",
    title: "Autonomous Vehicle Collision Avoidance",
    subtitle: "Reinforcement Learning in a SUMO Traffic Simulation",
    description:
      "A collision-avoidance policy for autonomous vehicles, trained with reinforcement learning inside a SUMO traffic simulation environment.",
    problem:
      "Collision-avoidance behaviour can't be learned safely on real roads, and hand-written rules struggle with the long tail of traffic situations. Training needs an environment that generates those situations repeatedly and cheaply.",
    solution:
      "Carried out as a Research Assistant at Nirma University under Prof. Anuja Nair. Built the traffic simulation environment in SUMO to generate the interaction scenarios, then trained a reinforcement-learning policy against it to produce the avoidance behaviour.",
    impact: [
      "Traffic simulation environment built in SUMO to generate collision scenarios repeatably",
      "Collision-avoidance policy learned through reinforcement learning rather than hand-written rules",
      "No benchmark figures are published here — the evaluation was in-simulation and I don't have a protocol I'd stand behind",
    ],
    techStack: [
      "Python",
      "SUMO",
      "Reinforcement Learning",
      "Traffic Simulation",
    ],
    categories: ["research", "ai"],
    featured: false,
    badge: "Research",
  },
];

export const projectCategories = [
  { id: "all", label: "All Projects" },
  { id: "backend", label: "Backend" },
  { id: "cloud", label: "Cloud & DevOps" },
  { id: "ai", label: "AI / ML" },
  { id: "fullstack", label: "Full Stack" },
  { id: "research", label: "Research" },
];

export interface SkillCategory {
  title: string;
  icon: string;
  skills: string[];
}

export const skills: SkillCategory[] = [
  {
    title: "Languages",
    icon: "code",
    skills: ["Python", "TypeScript", "Java", "C#", "SQL", "Bash"],
  },
  {
    title: "Backend & APIs",
    icon: "layers",
    skills: [
      "Django",
      "FastAPI",
      "Spring Boot",
      "ASP.NET Core",
      "Celery",
      "Pydantic",
      "Entity Framework",
    ],
  },
  {
    title: "Frontend",
    icon: "monitor",
    skills: ["Next.js", "React", "Tailwind CSS", "Framer Motion"],
  },
  {
    title: "Cloud & Infrastructure",
    icon: "cloud",
    skills: [
      "AWS (EC2, S3, RDS, Lambda, ECS Fargate)",
      "Docker",
      "Terraform",
      "RabbitMQ",
      "Packer",
    ],
  },
  {
    title: "Databases & Caching",
    icon: "database",
    skills: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "DynamoDB"],
  },
  {
    title: "Observability & Testing",
    icon: "shield",
    skills: [
      "Prometheus",
      "Grafana",
      "OpenTelemetry",
      "CloudWatch",
      "PyTest",
      "xUnit",
    ],
  },
  {
    title: "AI & ML",
    icon: "brain",
    skills: [
      "PyTorch",
      "TensorFlow",
      "BERT / Transformers",
      "Hugging Face",
      "OpenCV",
      "NLP",
    ],
  },
  {
    title: "Tools",
    icon: "wrench",
    skills: [
      "Cursor",
      "Claude Code",
      "Git",
      "GitHub Actions",
      "Azure DevOps",
      "Postman",
    ],
  },
];

export interface ExperienceRole {
  role: string;
  period: string;
  // Explicit duration so a reader never has to do date arithmetic.
  duration: string;
  achievements: string[];
  technologies: string[];
  // Cross-links to related work on this site, the way the blog posts link
  // to each other.
  links?: { label: string; href: string }[];
}

export interface Experience {
  company: string;
  location: string;
  // Country shown separately so the India -> United States progression is
  // legible at a glance rather than inferred from city names.
  region: string;
  // Optional company-level note — e.g. that two separate stints happened.
  note?: string;
  roles: ExperienceRole[];
}

// Reverse-chronological. The progression (research -> industry in India ->
// US co-op) is stated in the section header rather than by reordering,
// because recruiters scan most-recent-first.
export const experiences: Experience[] = [
  {
    company: "Crewasis",
    location: "New York, NY",
    region: "United States",
    roles: [
      {
        role: "Software Engineer Co-op",
        period: "Jan 2026 — May 2026",
        duration: "5 months",
        achievements: [
          "Shipped backend features in Django on a weekly release cadence, holding test coverage above 90% on the modules I wrote",
          "Containerized the services with Docker and moved builds and deploys into GitHub Actions, replacing a manual release process",
          "Cut p95 latency ~35% (measured in Django Debug Toolbar) and query volume ~30% (measured with pg_stat_statements) through PostgreSQL query-plan optimization and a Redis cache layer",
          "Provisioned the AWS footprint the application runs on — EC2, RDS, S3 and Lambda",
        ],
        technologies: [
          "Python",
          "Django",
          "AWS",
          "Docker",
          "PostgreSQL",
          "Redis",
          "GitHub Actions",
        ],
      },
    ],
  },
  {
    company: "Tatvasoft",
    location: "Ahmedabad, India",
    region: "India",
    note: "Two separate internships — invited back for a second, longer stint the following year.",
    roles: [
      {
        role: "Software Developer Intern",
        period: "Jan 2024 — May 2024",
        duration: "5 months",
        achievements: [
          "Built RESTful API endpoints in C#/ASP.NET Core with Entity Framework against an existing PostgreSQL schema, load-tested to a 100+ concurrent-user target at p95 under 500ms",
          "Cut query time ~30% on the slowest endpoints through PostgreSQL indexing and query-plan analysis",
          "Set up CI/CD in Azure DevOps, with xUnit integration tests running on every pipeline execution",
        ],
        technologies: [
          "C#",
          "ASP.NET Core",
          "PostgreSQL",
          "Azure DevOps",
          "Entity Framework",
          "xUnit",
        ],
      },
      {
        role: "Software Developer Intern",
        period: "Jun 2023 — Aug 2023",
        duration: "3 months",
        achievements: [
          "Built REST API endpoints for an MVC application",
          "Implemented business-logic layers against the existing data-access code",
        ],
        technologies: ["C#", "ASP.NET MVC", "REST APIs"],
      },
    ],
  },
  {
    company: "Nirma University",
    location: "Ahmedabad, India",
    region: "India",
    note: "Research assistant under Prof. Anuja Nair, across two projects.",
    roles: [
      {
        role: "Research Assistant",
        period: "Mar 2023 — Dec 2023",
        duration: "9 months",
        achievements: [
          "Autonomous vehicle collision avoidance: built the traffic simulation environment in SUMO and trained a reinforcement-learning policy for the avoidance behaviour",
          "Lung sound disease detection: six-class classification over the ICBHI 2017 respiratory sound dataset — Butterworth bandpass filtering at 250–2000 Hz, augmentation by time stretching, pitch shifting and audio shifting, mel-spectrogram features, and EfficientNet-B0 with an added attention mechanism",
          "Reached ~92% accuracy on a cycle-level split, which I'd now call optimistic: ICBHI has 126 patients, so splitting at cycle level puts the same patient on both sides, and augmented copies of one clip land in train and test together. A patient-level split is the correct protocol for this dataset and would score lower",
        ],
        technologies: [
          "Python",
          "PyTorch",
          "EfficientNet",
          "SUMO",
          "Reinforcement Learning",
          "Librosa",
        ],
        links: [
          { label: "Lung Sound Detection", href: "/projects/lung-sound-detection" },
          {
            label: "Collision Avoidance",
            href: "/projects/vehicle-collision-avoidance",
          },
        ],
      },
    ],
  },
];

export const education = [
  {
    school: "Northeastern University",
    degree: "Master of Science in Computer Software Engineering",
    location: "Boston, MA",
    period: "Sept 2024 — Dec 2026",
    gpa: "3.9",
    coursework: [
      "Object-Oriented Design",
      "Data Structures & Algorithms",
      "Cloud Computing",
      "High-Performance Parallel Computing",
      "Data Science Engineering",
    ],
  },
  {
    school: "Nirma University",
    degree: "Bachelor of Technology in Computer Science & Engineering",
    location: "Ahmedabad, India",
    period: "Oct 2020 — May 2024",
    coursework: [
      "Database Management Systems",
      "Operating Systems",
      "Computer Networks",
      "Discrete Mathematics",
    ],
  },
];
