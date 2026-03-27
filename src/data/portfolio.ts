export const personalInfo = {
  name: "Malav Gajera",
  title: "Software Engineer",
  email: "gajera.ma@northeastern.edu",
  phone: "+1 857-605-9334",
  github: "https://github.com/malav-250",
  linkedin: "https://www.linkedin.com/in/malav-gajera-884003202/",
  resumeUrl: "/resume.pdf",
  location: "Boston, MA",
};

export const heroContent = {
  headline: "Building Scalable Systems &",
  headlineAccent: "Intelligent Applications",
  subheadline:
    "Software Engineer crafting high-performance backends, cloud-native architectures, and ML pipelines — from concept to production. Deep learning researcher and hackathon winner.",
  stats: [
    { value: "3.9", label: "GPA at Northeastern" },
    { value: "110+", label: "APIs Shipped" },
    { value: "99.9%", label: "Uptime Achieved" },
    { value: "13+", label: "Projects Built" },
  ],
};

export const aboutContent = {
  description:
    "I'm a grad student at Northeastern University pursuing MS in Computer Software Engineering, currently building production systems at Crewasis. I specialize in designing backend architectures that scale, deploying cloud-native infrastructure that stays up, and building ML pipelines that deliver real results. Deep learning researcher and MINeD Hackathon award winner.",
  highlights: [
    {
      title: "Backend & Systems",
      description:
        "Designing microservices and REST APIs with Django, Spring Boot, and .NET — optimized for throughput, security, and reliability at scale.",
      icon: "server",
    },
    {
      title: "Cloud & DevOps",
      description:
        "Architecting on AWS with Terraform IaC, Docker containers, and CI/CD pipelines — achieving zero-downtime deployments and 99.9% uptime.",
      icon: "cloud",
    },
    {
      title: "AI / ML & Research",
      description:
        "Deep learning researcher with hands-on experience. Building distributed training pipelines, NLP systems, and AI-powered tools with real-world impact.",
      icon: "brain",
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
  // ── FEATURED PROJECTS ──────────────────────────────────────────
  {
    id: "cloud-native-app",
    title: "Cloud-Native Web Application",
    subtitle: "Full AWS Stack — 417 Commits, 3 Repos, 99.9% Uptime",
    description:
      "Production-grade cloud-native application spanning 3 repositories: a FastAPI web service with user/product management and S3 image storage, Terraform IaC for full AWS infrastructure, and serverless Lambda functions for event-driven email verification.",
    problem:
      "Needed a highly available, fault-tolerant web application with automated infrastructure provisioning, event-driven serverless workflows, and zero-downtime CI/CD deployments across multiple AWS accounts.",
    solution:
      "Built a FastAPI REST API with PostgreSQL (RDS) and S3 image storage, deployed on custom Packer AMIs. Provisioned the entire AWS infrastructure with Terraform — VPC across 3 AZs, Auto Scaling Groups (1-3 instances), ALB with SSL/TLS, RDS in private subnets, and IAM role-based security. Implemented serverless email verification with Lambda triggered by SNS, storing tokens in DynamoDB and sending via SendGrid.",
    impact: [
      "99.9% uptime with Auto Scaling (1-3 instances) and ALB",
      "417 commits across 3 production repos (webapp, infra, serverless)",
      "Zero-downtime CI/CD: PR validation + AMI build + auto-deploy",
      "Multi-AZ VPC with private subnets, IAM roles, and least-privilege security",
    ],
    techStack: [
      "AWS",
      "Terraform",
      "FastAPI",
      "Packer",
      "GitHub Actions",
      "Lambda",
      "SNS/SQS",
      "DynamoDB",
      "RDS PostgreSQL",
      "S3",
      "CloudWatch",
      "SendGrid",
    ],
    categories: ["cloud", "backend", "devops"],
    github: "https://github.com/malav-250/cloud-webapp",
    featured: true,
  },
  {
    id: "transportation-platform",
    title: "Full-Stack Transportation Platform",
    subtitle: "Microservices with ML-Powered Support & AI Chatbot",
    description:
      "Enterprise-grade vehicle rental and ride-booking platform with Spring Boot microservices, Next.js frontend, 30+ REST APIs, JWT/RBAC authentication, NLP-based support triaging, and an AI-powered chatbot.",
    problem:
      "Building a scalable ride-booking system that handles concurrent transactions with secure authentication while reducing manual support overhead through intelligent automation.",
    solution:
      "Constructed a microservices backend with Java Spring Boot, 30+ REST APIs secured via JWT/RBAC, payment workflows, and Next.js frontend. Built an NLP-based ML pipeline for automated support ticket triaging with sentiment analysis and a neural network-powered chatbot for intelligent user support.",
    impact: [
      "Sub-200ms API response times via connection pooling and indexing",
      "40% reduction in manual support tickets through ML triaging",
      "78% accuracy in chatbot intent classification using Neural Networks",
      "Concurrent ride-booking with transactional consistency",
    ],
    techStack: [
      "Java",
      "Spring Boot",
      "Next.js",
      "PostgreSQL",
      "Python",
      "NLP",
      "JWT",
      "Redis",
    ],
    categories: ["backend", "fullstack", "ai"],
    github: "https://github.com/malav-250/transportation-platform",
    featured: true,
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
      "Pioneered a collision avoidance framework using V2X communication protocols with reinforcement learning algorithms for optimized real-time decision-making. Tested and validated in SUMO traffic simulator for realistic traffic scenarios.",
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

  // ── HACKATHON ──────────────────────────────────────────────────
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

  // ── FULL-STACK PROJECTS ────────────────────────────────────────
  {
    id: "healthcare-platform",
    title: "Healthcare Management Platform",
    subtitle: "Virtual Consultations & Patient Data Sync",
    description:
      "Full-stack healthcare platform enabling virtual consultations, real-time patient data synchronization, and automated appointment scheduling.",
    problem:
      "Healthcare providers needed a reliable platform for virtual consultations with real-time patient data access and automated operational workflows.",
    solution:
      "Designed and developed the platform using ASP.NET MVC with PostgreSQL and JavaScript. Implemented repository pattern architecture for optimized database operations, along with automated appointment scheduling and patient notification systems.",
    impact: [
      "30% faster data retrieval through repository pattern architecture",
      "20% fewer system crashes via unit testing and debugging",
      "Optimized for 150+ concurrent users without degradation",
      "40% increase in operational efficiency through automation",
    ],
    techStack: [
      "C#",
      "ASP.NET MVC",
      "PostgreSQL",
      "JavaScript",
      "Repository Pattern",
    ],
    categories: ["fullstack", "backend"],
    featured: false,
  },

  // ── ML / DATA PROJECTS ─────────────────────────────────────────
  {
    id: "distributed-ml-pipeline",
    title: "Distributed ML Pipeline",
    subtitle: "Multi-GPU Training at Scale",
    description:
      "High-performance distributed training system leveraging PyTorch DDP across multiple GPUs with optimized ETL pipelines.",
    problem:
      "Training large ML models on 32GB+ datasets was bottlenecked by single-GPU processing and inefficient data loading pipelines.",
    solution:
      "Engineered a multi-GPU training pipeline using PyTorch DDP across 3 GPUs with parallelized gradient synchronization. Built ETL pipeline with HDF5 compression and parallel feature extraction. Deployed monitoring with Weights & Biases.",
    impact: [
      "81% model accuracy with 39% reduction in training time",
      "25x faster data retrieval with HDF5 compression",
      "25% improved GPU utilization through batch tuning",
      "Real-time monitoring via Weights & Biases dashboards",
    ],
    techStack: [
      "PyTorch",
      "DDP",
      "HDF5",
      "Python",
      "Weights & Biases",
      "ETL",
    ],
    categories: ["ai", "backend"],
    github: "https://github.com/malav-250/Real-Time-Parallel-Shoplifting-Detection-using-Multimodal-AI",
    featured: false,
  },
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

  // ── GITHUB PROJECTS (AI AGENTS & TOOLS) ────────────────────────
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
      "Creative intersection of AI and music technology",
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
    skills: ["Python", "Java", "C#", "JavaScript (ES6+)", "SQL", "C/C++", "Bash"],
  },
  {
    title: "Backend & Frameworks",
    icon: "layers",
    skills: [
      "Django",
      "Spring Boot",
      "ASP.NET Core",
      "FastAPI",
      "Next.js",
      "RESTful APIs",
      "Microservices",
      "JWT/OAuth2",
    ],
  },
  {
    title: "Cloud & DevOps",
    icon: "cloud",
    skills: [
      "AWS (EC2, S3, RDS, Lambda)",
      "Docker",
      "Terraform",
      "GitHub Actions",
      "Azure DevOps",
      "CI/CD",
      "CloudWatch",
      "IAM/VPC",
    ],
  },
  {
    title: "Databases",
    icon: "database",
    skills: ["PostgreSQL", "MySQL", "MongoDB", "Redis"],
  },
  {
    title: "AI & ML",
    icon: "brain",
    skills: [
      "PyTorch",
      "TensorFlow",
      "BERT / Transformers",
      "Scikit-learn",
      "OpenCV",
      "Pandas",
      "Distributed Training (DDP)",
      "NLP",
      "ETL Pipelines",
    ],
  },
  {
    title: "Engineering Practices",
    icon: "settings",
    skills: [
      "System Design",
      "API Design",
      "TDD",
      "Unit/Integration Testing",
      "Agile/Scrum",
      "Data Visualization",
      "JIRA",
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
      "Shipped 6 production-grade backend features with Django and React, maintaining 90%+ test coverage across weekly deployments",
      "Reduced deployment time by 40% with Docker containerization and GitHub Actions CI/CD pipelines",
      "Improved API latency by 35% and cut database load by 30% through PostgreSQL optimization and Redis caching",
      "Provisioned AWS infrastructure (EC2, RDS, S3, Lambda) supporting 5K+ monthly active users with zero-downtime releases",
    ],
    technologies: ["Python", "Django", "React", "AWS", "Docker", "PostgreSQL", "Redis"],
  },
  {
    company: "Tatvasoft",
    role: "Software Developer Intern",
    location: "Ahmedabad, Gujarat",
    period: "Jan — May 2024",
    current: false,
    achievements: [
      "Developed 110+ RESTful APIs using C#/ASP.NET Core supporting 100+ concurrent users with sub-500ms latency",
      "Improved database performance by 30% through PostgreSQL query optimization and indexing strategies",
      "Configured CI/CD pipelines in Azure DevOps, reducing production defects by 20% with xUnit testing",
      "Practiced Agile/Scrum with sprint planning, code reviews, and test-driven development",
    ],
    technologies: ["C#", "ASP.NET Core", "PostgreSQL", "Azure DevOps", "Entity Framework"],
  },
  {
    company: "Northeastern University",
    role: "Residential Security Officer & Proctor",
    location: "Boston, MA",
    period: "Sept 2024 — Present",
    current: true,
    achievements: [
      "Ensuring campus safety and security operations across residential facilities",
      "Managing access control and emergency response procedures",
    ],
    technologies: [],
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
      "Data Science Engineering",
      "High-Performance Parallel ML & AI",
      "Cloud Computing",
      "Generative AI",
    ],
  },
  {
    school: "Nirma University",
    degree: "Bachelor of Technology in Computer Science & Engineering",
    location: "Ahmedabad, Gujarat",
    period: "Oct 2020 — May 2024",
    coursework: [
      "Database Management Systems",
      "Operating Systems",
      "Computer Networks",
      "Mathematics",
    ],
  },
];
