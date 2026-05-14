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
    "MS in Software Engineering @ Northeastern (3.9 GPA), graduating Dec 2026. Building production APIs, cloud infrastructure, and CI/CD pipelines. Currently shipping backend systems at Crewasis.",
  stats: [
    { value: "3.9", label: "MS GPA — Northeastern" },
    { value: "Dec '26", label: "Graduating" },
    { value: "Jan '27", label: "Available Full-Time" },
  ],
};

export const aboutContent = {
  description:
    "I'm a Master's student at Northeastern University finishing my MS in Software Engineering (3.9 GPA), graduating December 2026. Currently building production backend systems at Crewasis — writing Django APIs, optimizing PostgreSQL queries, provisioning AWS infrastructure, and shipping weekly. Previously built REST APIs in C#/ASP.NET Core at Tatvasoft. I focus on backend services, cloud infrastructure, and the CI/CD that ties them together.",
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
      "Built a FastAPI service backed by Celery workers and RabbitMQ with exponential-backoff retries and dead-letter routing for zero message loss. Added per-client sliding-window rate limiting, Redis-backed circuit breakers, and idempotency-key deduplication. Provisioned Prometheus + Grafana dashboards and structured JSON logging with correlation-ID tracing. Containerized 8 services via Docker Compose and codified AWS deployment (ECS Fargate, RDS, ElastiCache) with Terraform.",
    impact: [
      "Zero message loss across 10K+ queued jobs via dead-letter routing",
      "100% duplicate elimination with idempotency-key deduplication",
      "Sub-50ms API response latency under concurrent load",
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
];

export const projectCategories = [
  { id: "all", label: "All Projects" },
  { id: "backend", label: "Backend" },
  { id: "cloud", label: "Cloud & DevOps" },
  { id: "ai", label: "AI / ML" },
  { id: "fullstack", label: "Full Stack" },
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

export interface Experience {
  company: string;
  role: string;
  location: string;
  period: string;
  current: boolean;
  achievements: string[];
  technologies: string[];
}

export const experiences: Experience[] = [
  {
    company: "Crewasis",
    role: "Software Engineer Co-op",
    location: "New York, USA",
    period: "Jan 2026 — Present",
    current: true,
    achievements: [
      "Built and shipped 6 backend features in Django with 90%+ test coverage across weekly releases",
      "Cut deployment time 40% by containerizing services with Docker and automating CI/CD via GitHub Actions",
      "Reduced API latency 35% and database load 30% through PostgreSQL query optimization and Redis caching",
      "Provisioned AWS infrastructure (EC2, RDS, S3, Lambda) serving 5K+ monthly active users",
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
  {
    company: "Tatvasoft",
    role: "Software Developer Intern",
    location: "Ahmedabad, India",
    period: "Jan — May 2024",
    current: false,
    achievements: [
      "Built RESTful APIs in C#/ASP.NET Core with Entity Framework, serving 100+ concurrent users at sub-500ms latency",
      "Improved database query performance 30% through PostgreSQL indexing and query plan optimization",
      "Set up CI/CD pipelines in Azure DevOps with xUnit integration tests, reducing production defects by 20%",
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
