export interface CareerTrackInfo {
  id: "SOFTWARE_ENGINEER" | "WEB_DEVELOPER" | "DATA_ANALYST";
  title: string;
  tagline: string;
  description: string;
  coreSkills: string[];
  supportedLanguages: string[];
  typicalRoles: string[];
  dayInTheLife: string;
  whyChooseThis: string;
  badgeColor: string;
}

export const CAREER_TRACKS: Record<CareerTrackInfo["id"], CareerTrackInfo> = {
  SOFTWARE_ENGINEER: {
    id: "SOFTWARE_ENGINEER",
    title: "Software Engineer",
    tagline: "Build scalable backends, robust systems, and algorithmic solutions",
    description:
      "Focuses on core programming principles, Data Structures and Algorithms (DSA), object-oriented design, debugging, memory efficiency, and building reliable software systems.",
    coreSkills: [
      "Data Structures & Algorithms",
      "Object-Oriented Programming (OOP)",
      "System Design & Scalability",
      "Automated Unit Testing & Debugging",
      "Complexity Analysis (Big-O)",
    ],
    supportedLanguages: ["Java", "Python", "C++"],
    typicalRoles: [
      "Backend Engineer",
      "Systems Software Engineer",
      "Core Application Developer",
      "Platform Engineer",
    ],
    dayInTheLife:
      "Writing modular service logic, optimizing database transactions, designing API contracts, implementing algorithms to handle scale, and profiling code performance.",
    whyChooseThis:
      "Ideal if you love logic puzzles, algorithm design, high performance, and understanding how computing systems operate under the hood.",
    badgeColor: "emerald",
  },
  WEB_DEVELOPER: {
    id: "WEB_DEVELOPER",
    title: "Web Developer",
    tagline: "Craft modern, responsive, and accessible interactive web applications",
    description:
      "Focuses on frontend and full-stack web technologies, semantic HTML5, modern CSS3 layouts, JavaScript/TypeScript, client-server architectures, and responsive user experiences.",
    coreSkills: [
      "Semantic HTML5 & Accessibility (a11y)",
      "Modern CSS (Flexbox, Grid, Responsive Design)",
      "Modern JavaScript (ES6+) & TypeScript",
      "Component Architecture & State Management",
      "RESTful API Integration & Client Caching",
    ],
    supportedLanguages: ["JavaScript", "HTML/CSS"],
    typicalRoles: [
      "Frontend Developer",
      "Full-Stack Web Developer",
      "UI Engineer",
      "Web Applications Engineer",
    ],
    dayInTheLife:
      "Building reactive UI components, integrating REST/GraphQL APIs, debugging browser rendering states, ensuring smooth animations, and optimizing Core Web Vitals.",
    whyChooseThis:
      "Ideal if you enjoy visual feedback, creating products users interact with directly, and combining technical engineering with intuitive design.",
    badgeColor: "cyan",
  },
  DATA_ANALYST: {
    id: "DATA_ANALYST",
    title: "Data Analyst",
    tagline: "Transform raw data into meaningful business metrics and predictive insights",
    description:
      "Focuses on querying relational databases with SQL, data cleaning, statistical modeling with Python, business intelligence metrics, and clear data communication.",
    coreSkills: [
      "Relational Database Querying (Advanced SQL)",
      "Data Wrangling & Cleaning with Python",
      "Statistical Analysis & Hypothesis Testing",
      "KPI & Business Metrics Modeling",
      "Data Aggregation & Visual Presentation",
    ],
    supportedLanguages: ["SQL", "Python"],
    typicalRoles: [
      "Business Intelligence Analyst",
      "Data Analyst",
      "Operations Analyst",
      "Analytics Engineer",
    ],
    dayInTheLife:
      "Writing multi-table SQL joins, cleaning messy datasets, building aggregations, analyzing user behavior funnels, and communicating findings to decision-makers.",
    whyChooseThis:
      "Ideal if you love uncovering patterns in numbers, solving real business problems with empirical evidence, and translating messy data into clear decisions.",
    badgeColor: "amber",
  },
};

export interface QuestionnaireQuestion {
  id: string;
  prompt: string;
  category: string;
  options: {
    id: string;
    text: string;
    weights: {
      SOFTWARE_ENGINEER: number;
      WEB_DEVELOPER: number;
      DATA_ANALYST: number;
    };
    explanation: string;
  }[];
}

export const CAREER_QUESTIONNAIRE: QuestionnaireQuestion[] = [
  {
    id: "preferred_activity",
    category: "Daily Interest",
    prompt: "Which kind of technical work excites you the most day-to-day?",
    options: [
      {
        id: "opt_eng",
        text: "Designing efficient algorithms, optimizing code speed, and building backend services.",
        weights: { SOFTWARE_ENGINEER: 10, WEB_DEVELOPER: 2, DATA_ANALYST: 3 },
        explanation: "Shows a strong inclination towards computer science fundamentals and systems logic.",
      },
      {
        id: "opt_web",
        text: "Building interactive web user interfaces that people see, touch, and use immediately.",
        weights: { SOFTWARE_ENGINEER: 2, WEB_DEVELOPER: 10, DATA_ANALYST: 1 },
        explanation: "Reflects a passion for user interaction, visual design, and the web ecosystem.",
      },
      {
        id: "opt_data",
        text: "Querying large databases, finding statistical trends, and answering business questions.",
        weights: { SOFTWARE_ENGINEER: 2, WEB_DEVELOPER: 1, DATA_ANALYST: 10 },
        explanation: "Demonstrates enthusiasm for data exploration, business intelligence, and empirical insights.",
      },
    ],
  },
  {
    id: "problem_solving_style",
    category: "Problem Solving",
    prompt: "When solving a problem, what gives you the greatest satisfaction?",
    options: [
      {
        id: "opt_eng_prob",
        text: "Solving a tricky edge case in an algorithm and reducing its time complexity.",
        weights: { SOFTWARE_ENGINEER: 10, WEB_DEVELOPER: 3, DATA_ANALYST: 4 },
        explanation: "Points to strong analytical algorithmic thinking and appreciation for computational efficiency.",
      },
      {
        id: "opt_web_prob",
        text: "Fixing a difficult layout bug and making an interface look flawless on all screen sizes.",
        weights: { SOFTWARE_ENGINEER: 2, WEB_DEVELOPER: 10, DATA_ANALYST: 1 },
        explanation: "Shows attention to user experience, visual fidelity, and browser rendering behavior.",
      },
      {
        id: "opt_data_prob",
        text: "Discovering why a company metric dropped and presenting data that solves the mystery.",
        weights: { SOFTWARE_ENGINEER: 3, WEB_DEVELOPER: 2, DATA_ANALYST: 10 },
        explanation: "Highlights interest in root-cause investigation and quantitative decision-making.",
      },
    ],
  },
  {
    id: "tech_interest",
    category: "Technical Focus",
    prompt: "Which set of technologies would you enjoy mastering first?",
    options: [
      {
        id: "opt_eng_tech",
        text: "Java / C++, Object-Oriented Design, Data Structures, and API architectures.",
        weights: { SOFTWARE_ENGINEER: 10, WEB_DEVELOPER: 3, DATA_ANALYST: 2 },
        explanation: "Directly aligns with software engineering foundation and enterprise system development.",
      },
      {
        id: "opt_web_tech",
        text: "HTML5, CSS3, JavaScript / TypeScript, modern web APIs, and responsive design.",
        weights: { SOFTWARE_ENGINEER: 2, WEB_DEVELOPER: 10, DATA_ANALYST: 2 },
        explanation: "Directly matches modern frontend and full-stack web engineering standards.",
      },
      {
        id: "opt_data_tech",
        text: "SQL queries, Python (Pandas/NumPy), database schemas, and statistical tools.",
        weights: { SOFTWARE_ENGINEER: 3, WEB_DEVELOPER: 1, DATA_ANALYST: 10 },
        explanation: "Directly aligns with the core toolkit of modern data analytics.",
      },
    ],
  },
  {
    id: "project_pride",
    category: "Project Pride",
    prompt: "If you could showcase one completed portfolio project to an employer, which would it be?",
    options: [
      {
        id: "opt_eng_proj",
        text: "A high-performance file compression tool or multithreaded backend microservice.",
        weights: { SOFTWARE_ENGINEER: 10, WEB_DEVELOPER: 2, DATA_ANALYST: 2 },
        explanation: "Demonstrates engineering rigor, backend reliability, and low-level understanding.",
      },
      {
        id: "opt_web_proj",
        text: "A responsive, accessible web app with seamless animations and real-time state sync.",
        weights: { SOFTWARE_ENGINEER: 2, WEB_DEVELOPER: 10, DATA_ANALYST: 1 },
        explanation: "Demonstrates full-stack web craftsmanship and consumer-facing product instincts.",
      },
      {
        id: "opt_data_proj",
        text: "A comprehensive market analysis report answering real questions with SQL and visual charts.",
        weights: { SOFTWARE_ENGINEER: 2, WEB_DEVELOPER: 2, DATA_ANALYST: 10 },
        explanation: "Demonstrates ability to extract actionable business value from messy tables.",
      },
    ],
  },
  {
    id: "learning_goal",
    category: "Career Aspirations",
    prompt: "Where do you envision your career heading over the next 2-3 years?",
    options: [
      {
        id: "opt_eng_goal",
        text: "Engineering scalable backend architectures, distributed services, and high-load systems.",
        weights: { SOFTWARE_ENGINEER: 10, WEB_DEVELOPER: 3, DATA_ANALYST: 2 },
        explanation: "Positions you well for Software Engineer / Backend Engineer career paths.",
      },
      {
        id: "opt_web_goal",
        text: "Leading frontend initiatives, building progressive web apps, and shaping user experiences.",
        weights: { SOFTWARE_ENGINEER: 3, WEB_DEVELOPER: 10, DATA_ANALYST: 1 },
        explanation: "Positions you for Web Developer / Frontend Specialist / Full-Stack Engineer roles.",
      },
      {
        id: "opt_data_goal",
        text: "Working alongside product managers and executives to inform strategic company directions with data.",
        weights: { SOFTWARE_ENGINEER: 2, WEB_DEVELOPER: 2, DATA_ANALYST: 10 },
        explanation: "Positions you for Data Analyst / Business Intelligence / Analytics Engineer roles.",
      },
    ],
  },
  {
    id: "curiosity_trigger",
    category: "Curiosity",
    prompt: "When you hear about a popular application (like YouTube or Spotify), what question pops up first?",
    options: [
      {
        id: "opt_eng_cur",
        text: "'How do they process billions of concurrent video streaming requests without crashing?'",
        weights: { SOFTWARE_ENGINEER: 10, WEB_DEVELOPER: 3, DATA_ANALYST: 3 },
        explanation: "Curiosity about scalability, systems resilience, and distributed computing.",
      },
      {
        id: "opt_web_cur",
        text: "'How did they design the smooth transitions, player controls, and instant page routing?'",
        weights: { SOFTWARE_ENGINEER: 2, WEB_DEVELOPER: 10, DATA_ANALYST: 1 },
        explanation: "Curiosity about client-side performance, CSS interactions, and modern web APIs.",
      },
      {
        id: "opt_data_cur",
        text: "'What metrics and algorithms do they track to recommend the next video I want to watch?'",
        weights: { SOFTWARE_ENGINEER: 3, WEB_DEVELOPER: 2, DATA_ANALYST: 10 },
        explanation: "Curiosity about recommendation analytics, user metrics, and data behavioral trends.",
      },
    ],
  },
];

export const SUPPORTED_SKILLS = [
  { id: "java", label: "Java", relevantTracks: ["SOFTWARE_ENGINEER"] },
  { id: "python", label: "Python", relevantTracks: ["SOFTWARE_ENGINEER", "DATA_ANALYST"] },
  { id: "javascript", label: "JavaScript", relevantTracks: ["WEB_DEVELOPER"] },
  { id: "sql", label: "SQL", relevantTracks: ["DATA_ANALYST", "SOFTWARE_ENGINEER"] },
  { id: "cpp", label: "C++", relevantTracks: ["SOFTWARE_ENGINEER"] },
  { id: "html_css", label: "HTML & CSS", relevantTracks: ["WEB_DEVELOPER"] },
] as const;
