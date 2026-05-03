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
    "MS in Software Engineering @ Northeastern (3.9 GPA). Building production APIs, cloud infrastructure, and CI/CD pipelines. Currently shipping backend systems at Crewasis.",
  stats: [
    { value: "3.9", label: "MS GPA — Northeastern" },
    { value: "2", label: "Backend Internships" },
    { value: "Aug '26", label: "Available Full-Time" },
  ],
};

export const aboutContent = {
  description:
    "I'm a grad student at Northeastern University finishing my MS in Software Engineering (3.9 GPA). Currently building production backend systems at Crewasis — writing Django APIs, optimizing PostgreSQL queries, provisioning AWS infrastructure, and shipping weekly. Previously built REST APIs in C#/ASP.NET Core at Tatvasoft. I focus on backend services, cloud infrastructure, and the CI/CD that ties them together.",
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
    id: "cloud-native-app",
    title: "Cloud Infrastructure Platform",
    subtitle: "Full AWS Stack — Terraform IaC, Serverless, CI/CD",
    description:
      "Production-grade cloud-native application spanning 3 repositories: a FastAPI web service with user/product management and S3 image storage, Terraform IaC for full AWS infrastructure, and serverless Lambda functions for event-driven email verification.",
    problem:
      "Needed a highly available web application with automated infrastructure provisioning, event-driven serverless workflows, and zero-downtime CI/CD deployments.",
    solution:
      "Built a FastAPI REST API with PostgreSQL (RDS) and S3 image storage, deployed on custom Packer AMIs. Provisioned the entire AWS stack with Terraform — VPC across 3 AZs, Auto Scaling Groups, ALB with SSL/TLS, RDS in private subnets, and IAM role-based security. Implemented serverless email verification with Lambda triggered by SNS, storing tokens in DynamoDB and sending via SendGrid.",
    impact: [
      "Multi-AZ VPC with Auto Scaling, ALB, and private-subnet RDS",
      "Terraform IaC managing all infrastructure across 3 repos",
      "Zero-downtime CI/CD: PR validation, AMI build, rolling deploy",
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
    subtitle: "Spring Boot Backend — 30+ APIs, JWT/RBAC, Redis Caching",
    description:
      "Backend-heavy vehicle rental and ride-booking platform built with Spring Boot microservices, 30+ REST APIs, JWT/RBAC authentication, Redis caching, and a Next.js frontend.",
    problem:
      "Building a ride-booking system that handles concurrent transactions with secure role-based access, payment workflows, and low-latency API responses.",
    solution:
      "Built a microservices backend with Java Spring Boot: 30+ REST APIs secured via JWT/RBAC, Redis caching for session and query data, PostgreSQL with connection pooling and indexing for sub-200ms responses, and transactional consistency for concurrent ride bookings.",
    impact: [
      "Sub-200ms API responses via Redis caching and query indexing",
      "30+ REST APIs with JWT authentication and role-based access control",
      "Concurrent ride-booking with transactional consistency",
      "Separate microservices for auth, bookings, payments, and notifications",
    ],
    techStack: [
      "Java",
      "Spring Boot",
      "PostgreSQL",
      "Redis",
      "JWT",
      "Next.js",
    ],
    categories: ["backend"],
    github: "https://github.com/malav-250/transportation-platform",
    featured: true,
  },

  // ── OTHER PROJECTS ───────────────────────────────────────────
  {
    id: "healthcare-platform",
    title: "Healthcare Management Platform",
    subtitle: "ASP.NET MVC — Repository Pattern, PostgreSQL",
    description:
      "Full-stack healthcare platform with virtual consultations, appointment scheduling, and patient data management. Built with ASP.NET MVC and PostgreSQL using repository pattern for clean data access.",
    problem:
      "Healthcare providers needed a reliable platform for virtual consultations with real-time patient data access and automated appointment workflows.",
    solution:
      "Built the backend with ASP.NET MVC and PostgreSQL. Used repository pattern architecture for clean separation of data access, implemented appointment scheduling with automated patient notifications, and optimized query performance for concurrent users.",
    impact: [
      "Repository pattern architecture for maintainable data access layer",
      "PostgreSQL query optimization for 150+ concurrent users",
      "Automated appointment scheduling and patient notification system",
      "Unit testing with 20% reduction in production bugs",
    ],
    techStack: [
      "C#",
      "ASP.NET MVC",
      "PostgreSQL",
      "JavaScript",
      "Repository Pattern",
    ],
    categories: ["backend"],
    featured: false,
  },
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
    github:
      "https://github.com/malav-250/Real-Time-Parallel-Shoplifting-Detection-using-Multimodal-AI",
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
    id: "doc-compliance-tool",
    title: "AI Document Compliance Tool",
    subtitle: "MINeD 2025 Hackathon — 3rd Place ($200)",
    description:
      "AI-powered tool that automates research paper compliance checks using OCR and image processing, reducing rejection rates for academic submissions.",
    problem:
      "Research paper submissions frequently get rejected due to formatting and compliance issues, wasting researchers' time and delaying publication.",
    solution:
      "Engineered a Python-based compliance assessment tool using Streamlit for the UI, OpenCV for advanced image processing, and PyTesseract for OCR to automatically scan and validate document formatting against submission guidelines.",
    impact: [
      "40% reduction in research paper rejection rates",
      "40% boost in document clarity and formatting compliance",
      "Won 3rd Place at MINeD 2025 Hackathon ($200 prize)",
      "Streamlined research workflows saving significant manual effort",
    ],
    techStack: [
      "Python",
      "Streamlit",
      "OpenCV",
      "PyTesseract",
      "OCR",
      "Image Processing",
    ],
    categories: ["ai", "fullstack"],
    featured: false,
    badge: "Hackathon Winner",
  },

  // ── RESEARCH ────────────────────────────────────────────────────
  {
    id: "lung-sound-detection",
    title: "Lung Sound Disease Detection",
    subtitle: "Deep Learning Research with EfficientNet + Attention",
    description:
      "Researched and implemented a deep learning system using EfficientNet with attention mechanisms to automatically diagnose respiratory diseases from lung sound audio recordings.",
    problem:
      "Lung sounds carry subtle variations that even experienced doctors can miss, leading to delayed or inaccurate diagnoses of respiratory conditions.",
    solution:
      "Researched and built an EfficientNet-B0 model enhanced with attention mechanisms, trained on the ICBHI 2017 dataset. Implemented bandpass Butterworth filtering for noise removal, audio data augmentation, and mel spectrogram conversion as preprocessing pipeline for the deep learning model.",
    impact: [
      "Achieved 99.82% validation accuracy with EfficientNet-B0 + attention",
      "Built end-to-end audio preprocessing and classification pipeline",
      "99.82% precision, recall, and F1-score across disease classes",
      "Implemented state-of-the-art attention mechanisms for audio analysis",
    ],
    techStack: [
      "Python",
      "TensorFlow",
      "EfficientNet",
      "Attention Mechanisms",
      "Mel Spectrograms",
      "ICBHI Dataset",
    ],
    categories: ["ai", "research"],
    featured: false,
    badge: "Research",
  },
  {
    id: "v2x-collision-avoidance",
    title: "Vehicle Collision Avoidance System",
    subtitle: "Reinforcement Learning + V2X Communication",
    description:
      "Research on intelligent collision avoidance using Vehicle-to-Everything (V2X) communication and reinforcement learning for autonomous decision-making.",
    problem:
      "Traditional collision avoidance systems rely on limited sensor data. V2X communication can expand awareness but requires intelligent decision-making algorithms.",
    solution:
      "Built a collision avoidance framework using V2X communication protocols with reinforcement learning algorithms for optimized real-time decision-making. Tested and validated in SUMO traffic simulator for realistic traffic scenarios.",
    impact: [
      "RL-optimized decision-making for real-time collision avoidance",
      "Tested in SUMO simulator with real-world traffic patterns",
      "V2X communication for expanded vehicle situational awareness",
      "Framework applicable to autonomous driving research",
    ],
    techStack: [
      "Python",
      "Reinforcement Learning",
      "V2X",
      "SUMO Simulator",
      "Deep Learning",
    ],
    categories: ["ai", "research"],
    featured: false,
    badge: "Research",
  },

  // ── ML & AI ─────────────────────────────────────────────────────
  {
    id: "quora-duplicate-detection",
    title: "Quora Duplicate Question Detection",
    subtitle: "BERT-Powered NLP Classification",
    description:
      "Deep learning model using BERT to identify semantically duplicate questions on Quora, outperforming traditional ML approaches.",
    problem:
      "Quora's platform suffers from duplicate questions that fragment knowledge and reduce answer quality for users searching for information.",
    solution:
      "Built a deep learning classification model leveraging BERT (Bidirectional Encoder Representations from Transformers) for semantic similarity detection between question pairs, with fine-tuning on the Quora Question Pairs dataset.",
    impact: [
      "89.28% validation accuracy on duplicate detection",
      "Outperformed traditional ML models by 10%",
      "Effective semantic similarity using BERT embeddings",
      "Scalable inference pipeline for real-time classification",
    ],
    techStack: [
      "Python",
      "BERT",
      "Transformers",
      "PyTorch",
      "NLP",
      "Hugging Face",
    ],
    categories: ["ai"],
    featured: false,
  },
  {
    id: "deepgram-voice-agent",
    title: "AI Voice Agent",
    subtitle: "Real-Time Conversational AI with Deepgram + Twilio",
    description:
      "AI-powered voice agent integrating speech-to-text, text-to-speech, and LLM capabilities for real-time, low-latency phone conversations.",
    problem:
      "Building real-time voice AI for customer service requires seamless integration of STT, TTS, and LLM with minimal latency for natural conversations.",
    solution:
      "Built a voice agent using Deepgram Voice Agent API and Twilio, combining speech-to-text, text-to-speech, and LLM inference into a unified pipeline for real-time phone conversations with advanced call features.",
    impact: [
      "Real-time, low-latency voice conversations via Twilio",
      "Integrated STT + TTS + LLM in a unified pipeline",
      "Applicable to customer service, healthcare, and more",
      "Advanced call features for production use cases",
    ],
    techStack: [
      "Python",
      "Deepgram API",
      "Twilio",
      "LLM",
      "Speech-to-Text",
      "Text-to-Speech",
    ],
    categories: ["ai", "backend"],
    github: "https://github.com/malav-250/deepgram-voice-agent",
    featured: false,
  },
  {
    id: "finance-ai-agent",
    title: "Finance AI Agent",
    subtitle: "AI-Powered Stock Analysis & Market Insights",
    description:
      "Autonomous AI agent that provides real-time stock data analysis and market insights using LLM-powered reasoning.",
    problem:
      "Retail investors need quick, intelligent analysis of stock data and market trends without manually sifting through complex financial data.",
    solution:
      "Built an AI-powered financial analysis agent that fetches real-time stock data and provides intelligent market insights using LLM reasoning for informed investment analysis.",
    impact: [
      "Real-time stock data fetching and analysis",
      "LLM-powered reasoning for market insights",
      "Autonomous agent architecture for financial tasks",
      "Clean Python implementation for extensibility",
    ],
    techStack: [
      "Python",
      "LLM",
      "Financial APIs",
      "AI Agents",
    ],
    categories: ["ai"],
    github: "https://github.com/malav-250/finance-ai-agent",
    featured: false,
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
  { id: "research", label: "Research" },
];

export interface SkillCategory {
  title: string;
  icon: string;
  skills: string[];
}

export const skills: SkillCategory[] = [
  {
    title: "Primary Languages",
    icon: "code",
    skills: ["Python", "Java", "C#", "SQL", "JavaScript", "Bash"],
  },
  {
    title: "Backend Frameworks",
    icon: "layers",
    skills: [
      "Django",
      "Spring Boot",
      "ASP.NET Core",
      "FastAPI",
      "Celery",
      "Next.js",
      "Entity Framework",
    ],
  },
  {
    title: "Cloud & Infrastructure",
    icon: "cloud",
    skills: [
      "AWS (EC2, S3, RDS, Lambda, ECS Fargate)",
      "Docker",
      "Terraform",
      "RabbitMQ",
      "GitHub Actions",
      "Azure DevOps",
      "Packer",
    ],
  },
  {
    title: "Databases & Caching",
    icon: "database",
    skills: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "DynamoDB"],
  },
  {
    title: "Testing & Observability",
    icon: "shield",
    skills: [
      "PyTest",
      "xUnit",
      "Prometheus",
      "Grafana",
      "CloudWatch",
      "Structured Logging",
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
      "Distributed Training (DDP)",
      "NLP",
      "Streamlit",
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
    role: "Software Engineer Intern",
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
    period: "Sept 2024 — May 2026",
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
