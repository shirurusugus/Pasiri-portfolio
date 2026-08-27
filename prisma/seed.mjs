import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting full database seed for Pasiri Portfolio & CMS...");

  // 1. Clean existing records safely
  await prisma.artwork.deleteMany();
  await prisma.artworkCategory.deleteMany();
  await prisma.activityBlock.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.projectBlock.deleteMany();
  await prisma.project.deleteMany();
  await prisma.blogBlock.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.blogTag.deleteMany();
  await prisma.blogCategory.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.skillCategory.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.education.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.navigationItem.deleteMany();
  await prisma.homepageSection.deleteMany();
  await prisma.themeSetting.deleteMany();
  await prisma.sEOSetting.deleteMany();
  await prisma.revision.deleteMany();

  // 2. Admin User
  const hashedPassword = await bcrypt.hash("pasiripassword2026", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "pasiri@example.com" },
    update: { passwordHash: hashedPassword, name: "pasiri" },
    create: {
      email: "pasiri@example.com",
      name: "pasiri",
      passwordHash: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log("👤 Admin user seeded: pasiri@example.com");

  // 3. Profile & Bio
  const profile = await prisma.profile.create({
    data: {
      fullName: "PASIRI",
      headline: "UX/UI Designer & Design Technologist",
      bio: "Crafting thoughtful digital interfaces, design systems, and interactive experiences with a deep focus on design thinking, typography, and human cognition.",
      philosophy: "Good design is quiet and respectful. It bridges complexity and human intent through clear visual hierarchy, accessible interactions, and structured process.",
      currentFocus: "Service design methodologies, design tokens architecture, and interactive web tools for education.",
      interests: "Typography, Coffee Brewing, Game Design, HCI Research, Indie Web",
      location: "Bangkok, Thailand",
      availableFor: "Open for UX/UI Design consulting, workshops & design engineering",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
      resumeUrl: "/resume",
      email: "pasiri@example.com",
      githubUrl: "https://github.com/pasiri",
      linkedinUrl: "https://linkedin.com/in/pasiri",
      twitterUrl: "https://twitter.com/pasiri",
    },
  });

  // Education
  await prisma.education.create({
    data: {
      profileId: profile.id,
      institution: "King Mongkut's Institute of Technology Ladkrabang",
      degree: "Bachelor of Science",
      field: "Information Technology (Interactive Multimedia & UX/UI)",
      startDate: new Date("2022-08-01"),
      endDate: new Date("2026-05-31"),
      current: true,
      description: "Focus on Human-Computer Interaction, Design Thinking, Frontend Engineering, and Service Design.",
      location: "Bangkok, Thailand",
      order: 1,
    },
  });

  // 4. Final Public Navigation: Home, Resume, Projects, Activities & Events, Digital Art, Contact
  const navItems = [
    { label: "Home", href: "/", order: 1 },
    { label: "Resume", href: "/resume", order: 2 },
    { label: "Projects", href: "/projects", order: 3 },
    { label: "Activities & Events", href: "/activities", order: 4 },
    { label: "Digital Art", href: "/digital-art", order: 5 },
    { label: "Contact", href: "/contact", order: 6 },
  ];

  for (const item of navItems) {
    await prisma.navigationItem.create({
      data: {
        label: item.label,
        href: item.href,
        order: item.order,
        isEnabled: true,
      },
    });
  }

  // 5. Homepage CMS Sections
  const sections = [
    { sectionKey: "hero", title: "Hero", order: 1, isEnabled: true },
    { sectionKey: "featured_projects", title: "Selected Projects & Case Studies", subtitle: "In-depth UX/UI architecture, product design, and interactive systems", order: 2, isEnabled: true },
    { sectionKey: "featured_activities", title: "Activities, Hackathons & Events", subtitle: "Competitions, design bootcamps, and academic workshops", order: 3, isEnabled: true },
    { sectionKey: "selected_artworks", title: "Digital Art & Visual Studies", subtitle: "Digital paintings, illustrations, and concept art", order: 4, isEnabled: true },
    { sectionKey: "about_focus", title: "Design Process & Philosophy", subtitle: "Core principles and research approach", order: 5, isEnabled: true },
    { sectionKey: "contact_cta", title: "Get in Touch", subtitle: "Let's collaborate on human-centered design", order: 6, isEnabled: true },
  ];

  for (const sec of sections) {
    await prisma.homepageSection.create({ data: sec });
  }

  // 6. Substantial Projects & Case Studies
  const projectsData = [
    {
      title: "Vokabloom — Thai Language Morphology & Learning Platform",
      slug: "vokabloom",
      shortSummary: "Interactive linguistic visualization tool breaking down complex Thai compound words and etymology into intuitive node graphs.",
      year: 2026,
      startDate: new Date("2025-08-01"),
      endDate: new Date("2026-02-15"),
      role: "Lead Product Designer & Frontend Engineer",
      team: "Pasiri (Solo Project / Mini Thesis)",
      organization: "KMITL IT Faculty",
      category: "UX/UI Design",
      tags: "Linguistics, Data Visualization, Education, React Flow, Next.js",
      technologies: "Next.js 15, TypeScript, TailwindCSS, React Flow, SQLite",
      tools: "Figma, FigJam, Procreate, Web Audio API",
      coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80",
      galleryImages: JSON.stringify([
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&auto=format&fit=crop&q=80",
      ]),
      problem: "Thai language learners and linguistics students struggle with root word comprehension because conventional dictionaries present vocabulary linearly rather than showing morphological tree relationships.",
      outcomes: "Observed a 42% increase in root-word recall speed in usability tests with 24 bilingual students; prototype adopted as reference educational software.",
      reflection: "Transforming dense linguistic taxonomy into engaging visual nodes proved that interface design can radically lower cognitive friction in complex knowledge domains.",
      externalUrl: "https://vokabloom.demo.app",
      githubUrl: "https://github.com/pasiri/vokabloom",
      relatedActivitySlug: "mini-thesis-exhibition-2025",
      featured: true,
      status: "PUBLISHED",
      sortOrder: 1,
      rawContent: `<p>Vokabloom is an interactive web platform designed to demystify Thai morphology. By transforming rigid dictionary definitions into interactive word trees, learners can visually dissect prefixes, roots, and tonal modifiers.</p>`,
      timelineSteps: [
        { stepNumber: "01", title: "Linguistic Research & Corpus Analysis", description: "Interviewed 12 Thai language educators and analyzed 2,000+ high-frequency compound words to model root relationships." },
        { stepNumber: "02", title: "Information Architecture & Node UX", description: "Designed an interactive force-directed graph in Figma and tested zoom/pan affordances on both mobile touch and desktop trackpads." },
        { stepNumber: "03", title: "Accessible Typography & Tone Markers", description: "Engineered high-legibility Thai typography pairing Kanit and Sarabun with dynamic color-coded tone mark badges." },
        { stepNumber: "04", title: "Usability Testing & Refinements", description: "Ran task-based usability testing evaluating search speed, morphological dissection accuracy, and learner satisfaction." },
      ],
    },
    {
      title: "SCG Senior Living — Accessible Ambient Companion Interface",
      slug: "scg-senior-living",
      shortSummary: "Multimodal touch and voice interface designed specifically for elderly residents in assisted living facilities to control lighting, climate, and emergency alerts.",
      year: 2025,
      startDate: new Date("2025-05-01"),
      endDate: new Date("2025-08-30"),
      role: "UX Researcher & Interaction Designer",
      team: "4-Person Multidisciplinary HCI Team",
      organization: "SCG WEDO Innovation Center",
      category: "Product Design",
      tags: "HCI, Accessibility, WCAG AAA, Smart Home, Silver Tech",
      technologies: "Figma, React Native, Voiceflow, WebSockets",
      tools: "Figma, Miro, Tobii Eye Tracker, Voiceflow",
      coverImage: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1200&auto=format&fit=crop&q=80",
      galleryImages: JSON.stringify([
        "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1000&auto=format&fit=crop&q=80",
      ]),
      problem: "Standard smart home apps rely on small touch targets, complex nested menus, and low contrast icons that cause anxiety and exclusion for elderly users experiencing tremors or visual decline.",
      outcomes: "Achieved 96% task completion rate among test participants aged 65–82 without external staff assistance; received Innovation Excellence recognition from SCG WEDO.",
      reflection: "Designing for senior accessibility (WCAG AAA) is not a compromise on aesthetics—it creates cleaner, more resilient interfaces for all human beings.",
      externalUrl: "https://scg.wedo.th/innovation",
      relatedActivitySlug: "wedo-hci-lab-scg",
      featured: true,
      status: "PUBLISHED",
      sortOrder: 2,
      rawContent: `<p>A comprehensive HCI research and interface design project optimizing home automation for the aging demographic, featuring high-contrast haptics, voice confirmation, and oversized interactive touch zones.</p>`,
      timelineSteps: [
        { stepNumber: "01", title: "Contextual Inquiry in Senior Living Facility", description: "Conducted 14 on-site observational interviews observing residents interacting with thermostats and light switches." },
        { stepNumber: "02", title: "Physical & Cognitive Persona Modeling", description: "Built personas addressing mild cognitive impairment, macular degeneration, and tactile sensitivity." },
        { stepNumber: "03", title: "High-Contrast UI & Audio Feedback Loop", description: "Crafted 80px minimum touch targets, 7:1 contrast ratios, and gentle resonant auditory cues for action confirmations." },
        { stepNumber: "04", title: "On-site Field Pilot Trial", description: "Deployed tablet kiosks in 6 senior suites for a 2-week longitudinal usability pilot." },
      ],
    },
    {
      title: "AuraFlow — Next-Gen Design System & Fluid Token Engine",
      slug: "auraflow-design-system",
      shortSummary: "A scalable design system architecture uniting Figma Design Tokens with CSS custom properties and React components.",
      year: 2026,
      startDate: new Date("2025-11-01"),
      endDate: new Date("2026-01-20"),
      role: "Design Systems Lead & Design Technologist",
      team: "Pasiri (Open Source)",
      organization: "Personal Craft / Open Source",
      category: "Design Systems",
      tags: "Design Tokens, Figma Variables, Component Library, Accessibility",
      technologies: "TypeScript, React, TailwindCSS, Radix UI, Storybook",
      tools: "Figma Variables, Style Dictionary, GitHub Actions",
      coverImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80",
      problem: "Designers and developers often suffer from style drift between Figma components and production CSS due to manual hex code copy-pasting.",
      outcomes: "Unified 140+ components, 60+ token aliases, and automated CI token deployment to npm.",
      reflection: "Design systems are living contracts of trust between design and engineering.",
      githubUrl: "https://github.com/pasiri/auraflow-system",
      featured: true,
      status: "PUBLISHED",
      sortOrder: 3,
      rawContent: `<p>A cross-platform token engine translating semantic intent directly from Figma variable collections into CSS variables and accessible React component primitives.</p>`,
      timelineSteps: [
        { stepNumber: "01", title: "Token Hierarchy Architecture", description: "Structured tokens across Global, Semantic, and Component tiers." },
        { stepNumber: "02", title: "Figma Variable Collections Sync", description: "Set up Style Dictionary pipeline transforming JSON tokens to CSS/Tailwind variables automatically." },
        { stepNumber: "03", title: "Accessible Component Primitives", description: "Built 24 core components tested with NVDA screen reader and keyboard focus traps." },
      ],
    },
    {
      title: "FinTransit — Bangkok Smart Mobility & Micro-Payment App",
      slug: "fintransit-app",
      shortSummary: "Seamless transit companion combining BTS, MRT, and Chao Phraya river express boat schedules with one-tap QR ticketing.",
      year: 2025,
      startDate: new Date("2025-03-01"),
      endDate: new Date("2025-06-15"),
      role: "UX/UI Designer",
      team: "3-Person Student Hackathon Team",
      organization: "Bangkok Design-athon",
      category: "Mobile",
      tags: "Transit UX, Micro-Payments, Mobile UI, Bangkok Commute",
      technologies: "React Native, Node.js, OpenStreetMap API",
      tools: "Figma, FigJam, Principle for Mac",
      coverImage: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&auto=format&fit=crop&q=80",
      problem: "Bangkok commuters must juggle multiple fragmented transit apps and ticket systems, resulting in long queue bottlenecks during rush hour.",
      outcomes: "Won 1st Runner Up at the Bangkok Smart Mobility Design-athon 2025.",
      reflection: "Designing for high-stress commuting environments requires extreme UI clarity and zero-latency transaction confirmation.",
      relatedActivitySlug: "ui-design-athon",
      featured: false,
      status: "PUBLISHED",
      sortOrder: 4,
      rawContent: `<p>Mobile UX/UI concept tackling Bangkok's multimodal transit fragmentation through unified route planning and instant PromptPay micro-ticketing.</p>`,
      timelineSteps: [
        { stepNumber: "01", title: "Commuter Journey Mapping", description: "Mapped pain points across 4 multi-leg commuter journeys in central Bangkok." },
        { stepNumber: "02", title: "Route Optimization UX", description: "Designed quick-glance route cards with real-time transfer countdowns." },
        { stepNumber: "03", title: "One-Tap NFC/QR Pass", description: "Integrated frictionless digital ticket display with lock-screen widget access." },
      ],
    },
  ];

  for (const proj of projectsData) {
    const { timelineSteps, ...projectFields } = proj;
    const created = await prisma.project.create({ data: projectFields });

    if (timelineSteps && timelineSteps.length > 0) {
      await prisma.projectBlock.create({
        data: {
          projectId: created.id,
          type: "process_timeline",
          order: 1,
          data: JSON.stringify({
            title: "Design Process & Execution",
            subtitle: "Methodological phases from discovery to validation",
            steps: timelineSteps,
          }),
        },
      });
    }
  }

  console.log(`✅ Seeded ${projectsData.length} substantial Projects.`);

  // 6. Activities & Events (The Core Content System)
  const activitiesData = [
    {
      title: "GLOBAL GAME JAM 2026",
      slug: "global-game-jam-2026",
      shortSummary: "Participated in a 48-hour worldwide game creation sprint exploring adaptive mechanics, playful UI, and accessible audio design.",
      category: "Competition",
      organization: "Global Game Jam Bangkok Node",
      role: "Lead UI/UX & Interaction Designer",
      location: "Bangkok, Thailand",
      eventDate: new Date("2026-01-25"),
      startDate: new Date("2026-01-23"),
      endDate: new Date("2026-01-25"),
      coverImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80",
      featured: true,
      status: "PUBLISHED",
      sortOrder: 1,
      objectives: "Develop an empathetic puzzle game within 48 hours centered around non-verbal communication and accessible UI controls.",
      responsibilities: "Designed interaction wireframes, UI asset pipeline in Figma, high-contrast color palette, and sound feedback architecture.",
      outcomes: "Delivered a playable web-based build tested by 80+ participants, receiving the Community Choice Award for Accessibility.",
      reflection: "Time-constrained sprints reinforce the importance of rapid prototyping and stripping away non-essential UI ornamentation.",
      skillsGained: "Rapid UX Prototyping, Figma, Sound Design, WebGL Integration, Accessibility",
      tags: "Game Jam, 48h Sprint, UI Design, Accessibility",
      rawContent: `<p>Global Game Jam is the world's largest game creation event. In 2026, our team of five engineers, designers, and audio creators converged to design an immersive experience exploring sensory interaction.</p>
<h3>Design Constraints & Architecture</h3>
<p>Given the 48-hour deadline, we established a strict atomic UI token system in Figma before writing code. This allowed modular UI components to be plugged directly into the game canvas without layout regressions.</p>`,
      timelineSteps: [
        {
          stepNumber: "01",
          title: "Theme Reveal & Rapid Ideation",
          description: "Deconstructed the secret theme into emotional anchors and selected the core mechanic of sensory resonance.",
          quote: "Constraints breed clarity when the team aligns on a single core emotion.",
        },
        {
          stepNumber: "02",
          title: "UX Wireframing & Paper Prototyping",
          description: "Mapped player decision trees and tested on-screen tactile feedback with rapid index-card mockups.",
        },
        {
          stepNumber: "03",
          title: "High-Fidelity Assets & Tokenization",
          description: "Produced pixel-aligned vector assets and established accessible high-contrast color tokens.",
        },
        {
          stepNumber: "04",
          title: "Engine Integration & Playtesting",
          description: "Integrated UI overlay into the game loop, conducting 12 iterative playtest sessions with other jam participants.",
        },
        {
          stepNumber: "05",
          title: "Final Build & Showcase Presentation",
          description: "Packaged WebAssembly build, deployed to itch.io, and delivered a 3-minute stage showcase.",
        },
      ],
    },
    {
      title: "SERVICE DESIGN BOOTCAMP 2026",
      slug: "service-design-bootcamp-2026",
      shortSummary: "Intensive 5-day human-centered service blueprinting sprint tackling urban multimodal mobility pain points.",
      category: "Bootcamp",
      organization: "Design Innovation Academy",
      role: "Service Designer & Facilitator",
      location: "Bangkok, Thailand",
      eventDate: new Date("2026-02-14"),
      startDate: new Date("2026-02-10"),
      endDate: new Date("2026-02-14"),
      coverImage: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&auto=format&fit=crop&q=80",
      featured: true,
      status: "PUBLISHED",
      sortOrder: 2,
      objectives: "Analyze fragmented transit handoffs between water taxis, elevated rail, and first-mile/last-mile feeder buses in Bangkok.",
      responsibilities: "Conducted 18 on-site commuter interviews, structured customer journey maps, and synthesized cross-stakeholder service blueprints.",
      outcomes: "Formulated a unified digital signage and progressive web application blueprint presented to transport authority consultants.",
      reflection: "Service design shifts perspective from isolated digital screens to the entire ecosystem of human emotions and physical transitions.",
      skillsGained: "Service Blueprinting, Stakeholder Mapping, Qualitative Research, Journey Mapping",
      tags: "Service Design, Transit UX, Customer Journey, Research",
      rawContent: `<p>Urban commuters in metropolitan Bangkok experience cognitive overload navigating multimodal transit systems with incompatible ticketing schemes and disparate signage standards.</p>`,
      timelineSteps: [
        {
          stepNumber: "01",
          title: "Field Empathy & Shadowing",
          description: "Observed 120+ passenger transfers during peak morning hours at major transit hubs.",
        },
        {
          stepNumber: "02",
          title: "Journey Mapping & Pain Points Synthesis",
          description: "Identified key drop-off points where signage ambiguity caused delays and disorientation.",
        },
        {
          stepNumber: "03",
          title: "Service Blueprint Formulation",
          description: "Aligned frontstage traveler interactions with backstage dispatch and station staff operations.",
        },
        {
          stepNumber: "04",
          title: "Co-Design Workshop",
          description: "Facilitated co-creation sessions with station marshals, accessibility advocates, and daily commuters.",
        },
        {
          stepNumber: "05",
          title: "Executive Synthesis & Blueprint Handover",
          description: "Delivered comprehensive interactive FigJam blueprint and design recommendation dossier.",
        },
      ],
    },
    {
      title: "UI DESIGN-ATHON",
      slug: "ui-design-athon",
      shortSummary: "24-hour design sprint creating a micro-investment interface focused on financial literacy for Gen Z.",
      category: "Competition",
      organization: "FinTech Designers Guild",
      role: "Lead UI Designer",
      location: "Online / Bangkok",
      eventDate: new Date("2025-11-20"),
      coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
      featured: true,
      status: "PUBLISHED",
      sortOrder: 3,
      objectives: "Demystify compound interest and ETF investing through visual micro-interactions and conversational UI.",
      responsibilities: "Designed design tokens, micro-copy, chart visualization interfaces, and interactive Figma prototypes.",
      outcomes: "Won 1st Runner Up for Best Visual Accessibility and Interaction Polish.",
      reflection: "Visualizing financial data requires extreme care in color semantics so that red/green tones don't alienate colorblind users.",
      skillsGained: "Design Systems, Data Visualization, Figma Variables, Micro-interactions",
      tags: "FinTech, UI Design, Designathon, Figma",
      rawContent: `<p>A high-velocity sprint exploring how modular card layouts and interactive slider simulations can build confidence for first-time investors.</p>`,
      timelineSteps: [
        {
          stepNumber: "01",
          title: "Cognitive Load Audit",
          description: "Audited existing brokerage apps to catalogue jargon and anxiety-inducing patterns.",
        },
        {
          stepNumber: "02",
          title: "Interactive Simulation Wireframes",
          description: "Prototyped a tactile slider where users visualize 5-year savings trajectories in real time.",
        },
        {
          stepNumber: "03",
          title: "Design System & Accessible Theming",
          description: "Structured dark and light color systems adhering to WCAG 2.2 AAA contrast standards.",
        },
        {
          stepNumber: "04",
          title: "Micro-Interaction Motion Spec",
          description: "Designed spring physics transitions for card swiping and progress milestones.",
        },
      ],
    },
    {
      title: "MINI THESIS EXHIBITION 2025",
      slug: "mini-thesis-exhibition-2025",
      shortSummary: "Curated showcase exhibiting interactive physical computing and web UI installations for academic evaluation.",
      category: "Exhibition",
      organization: "Faculty of Information Technology, KMITL",
      role: "Exhibition Curator & Exhibitor",
      location: "Bangkok, Thailand",
      eventDate: new Date("2025-10-15"),
      coverImage: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&auto=format&fit=crop&q=80",
      featured: true,
      status: "PUBLISHED",
      sortOrder: 4,
      objectives: "Present research on adaptive multimodal web interfaces to academic peers and industry guests.",
      responsibilities: "Created interactive kiosk station, visual research posters, and live touch-screen interactive demos.",
      outcomes: "Engaged 300+ visitors; received Outstanding Research Presentation commendation.",
      reflection: "Designing for physical exhibition requires designing for 5-second walk-by comprehension and zero-instruction onboarding.",
      skillsGained: "Exhibition Curation, Kiosk UI, Public Speaking, Research Communication",
      tags: "Thesis, Exhibition, KMITL, Research",
      rawContent: `<p>The Mini Thesis Exhibition brought together undergraduate research projects spanning artificial intelligence, UX design, and HCI.</p>`,
      timelineSteps: [
        {
          stepNumber: "01",
          title: "Research Paper Formulation",
          description: "Published study analyzing user performance across spatial UI layouts.",
        },
        {
          stepNumber: "02",
          title: "Interactive Kiosk Development",
          description: "Built dedicated kiosk application with touch gestures and offline resilience.",
        },
        {
          stepNumber: "03",
          title: "Exhibition Booth Architecture",
          description: "Designed spatial signage, visitor flow, and takeaway physical zines.",
        },
      ],
    },
    {
      title: "INVENTORS' DAY 2025",
      slug: "inventors-day-2025",
      shortSummary: "National invention and innovation fair showcasing assistive technology tools and digital accessibility innovations.",
      category: "Exhibition",
      organization: "National Research Council of Thailand (NRCT)",
      role: "Product Presenter & Researcher",
      location: "BITEC Bangna, Bangkok",
      eventDate: new Date("2025-02-04"),
      coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
      featured: false,
      status: "PUBLISHED",
      sortOrder: 5,
      objectives: "Demonstrate educational technology tools designed for neurodivergent and low-vision learners.",
      responsibilities: "Presented live software demonstrations to Ministry of Higher Education evaluators and educators.",
      outcomes: "Awarded National Youth Innovation Bronze Medal in Assistive Technology.",
      reflection: "Seeing real children with dyslexia interact with typography settings proves why customization is an accessibility imperative.",
      skillsGained: "Assistive Tech, Universal Design, Government Presentation, Assistive UI",
      tags: "NRCT, Inventions, Assistive Tech, BITEC",
      rawContent: `<p>Exhibited assistive typography and morphological analysis software at Thailand's premier national innovation fair.</p>`,
      timelineSteps: [
        {
          stepNumber: "01",
          title: "Prototype Refinement",
          description: "Hardened UI for continuous multi-hour public booth operation.",
        },
        {
          stepNumber: "02",
          title: "Judge Evaluation & Defense",
          description: "Defended technical architecture and cognitive ergonomics before evaluation committee.",
        },
        {
          stepNumber: "03",
          title: "Public Interaction Testing",
          description: "Gathered feedback from over 200 educators and special education professionals.",
        },
      ],
    },
    {
      title: "IT FRESHY DAY 2024",
      slug: "it-freshy-day-2024",
      shortSummary: "Coordinated visual branding, stage graphics, and digital check-in web app for 400+ incoming freshman students.",
      category: "Community",
      organization: "KMITL IT Student Council",
      role: "Head of Creative & Media",
      location: "Bangkok, Thailand",
      eventDate: new Date("2024-08-18"),
      coverImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80",
      featured: false,
      status: "PUBLISHED",
      sortOrder: 6,
      objectives: "Create a welcoming, inclusive visual identity and friction-free check-in experience.",
      responsibilities: "Led a design team of 6 students producing badges, motion backdrops, and web check-in.",
      outcomes: "Processed 420 attendee check-ins in under 25 minutes with zero server downtime.",
      reflection: "Leading a creative team taught me how to articulate design intent clearly and mentor junior designers.",
      skillsGained: "Team Leadership, Event Branding, Web QR Check-in, Motion Graphics",
      tags: "Student Council, Event Design, Branding, Leadership",
      rawContent: `<p>Comprehensive brand design and digital operations for the annual freshman orientation event.</p>`,
      timelineSteps: [
        {
          stepNumber: "01",
          title: "Brand Identity Conception",
          description: "Established color harmony, typographic hierarchy, and mascot illustrations.",
        },
        {
          stepNumber: "02",
          title: "Check-in Web Application",
          description: "Built QR scanner web application connected to realtime Google Sheets backend.",
        },
        {
          stepNumber: "03",
          title: "Event Day Orchestration",
          description: "Managed stage motion graphics and live media capture throughout the 8-hour schedule.",
        },
      ],
    },
    {
      title: "TEACHING ASSISTANT — UX/UI 2025",
      slug: "teaching-assistant-ux-ui-2025",
      shortSummary: "Mentored 75+ undergraduate students in Human-Computer Interaction, Design Systems, Figma auto-layout, and usability testing.",
      category: "Teaching",
      organization: "KMITL Faculty of Information Technology",
      role: "Teaching Assistant & Lab Lead",
      location: "Bangkok, Thailand",
      eventDate: new Date("2025-09-01"),
      startDate: new Date("2025-08-01"),
      endDate: new Date("2025-12-20"),
      coverImage: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&auto=format&fit=crop&q=80",
      featured: true,
      status: "PUBLISHED",
      sortOrder: 7,
      objectives: "Elevate student craft in Figma design systems, accessibility standards (WCAG), and usability evaluation.",
      responsibilities: "Authored 8 lab assignments, hosted weekly office hours, and conducted design critique sessions.",
      outcomes: "100% of student groups completed working high-fidelity prototypes; average course rating 4.9/5.0.",
      reflection: "Explaining UX fundamentals to beginners is the ultimate test of one's own mastery.",
      skillsGained: "Curriculum Design, Design Mentorship, Figma Workshop Facilitation, Usability Testing",
      tags: "Teaching, Mentorship, UX Education, Figma Labs",
      rawContent: `<p>Served as primary Teaching Assistant for the core Undergraduate UX/UI Design course, guiding students from empathy research to high-fidelity prototyping.</p>`,
      timelineSteps: [
        {
          stepNumber: "01",
          title: "Curriculum & Lab Design",
          description: "Created hands-on Figma exercises covering auto-layout, component variants, and interactive components.",
        },
        {
          stepNumber: "02",
          title: "Heuristic Evaluation Clinics",
          description: "Taught Nielsen Norman heuristics with real-world website teardowns.",
        },
        {
          stepNumber: "03",
          title: "Final Showcase & Critique",
          description: "Organized guest critique sessions with senior industry design leads.",
        },
      ],
    },
    {
      title: "CONFIG 2025, 2026 WATCH PARTY",
      slug: "config-watch-party",
      shortSummary: "Organized community watch events and discussion salons for Figma's global design conference.",
      category: "Community",
      organization: "Friends of Figma Bangkok",
      role: "Event Organizer & Co-Host",
      location: "Bangkok, Thailand",
      eventDate: new Date("2025-06-28"),
      coverImage: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1200&auto=format&fit=crop&q=80",
      featured: false,
      status: "PUBLISHED",
      sortOrder: 8,
      objectives: "Bring local designers and frontend engineers together to unpack keynote announcements and explore emerging design tooling.",
      responsibilities: "Secured venue sponsorship, managed attendee RSVP ticketing, and facilitated post-keynote breakout discussions.",
      outcomes: "Hosted 90+ attendees across design disciplines, fostering grassroots community connections.",
      reflection: "Design tools evolve rapidly, but shared community discourse keeps our foundational thinking grounded.",
      skillsGained: "Community Management, Event Logistics, Public Moderation, Networking",
      tags: "Figma, Config, Community, Friends of Figma",
      rawContent: `<p>Community gathering celebrating design craft, variable tokens, and AI integration in modern design workflows.</p>`,
      timelineSteps: [
        {
          stepNumber: "01",
          title: "Community Outreach & Venue Prep",
          description: "Coordinated with co-working space sponsor for dual-screen streaming setup.",
        },
        {
          stepNumber: "02",
          title: "Live Keynote Stream & Discussion",
          description: "Hosted live reaction discussion analyzing Figma variables and Code Connect.",
        },
        {
          stepNumber: "03",
          title: "Hands-on Workshop Salon",
          description: "Ran impromptu 45-minute workshop testing newly released Figma features.",
        },
      ],
    },
    {
      title: "WEDO HCI LAB × SCG",
      slug: "wedo-hci-lab-scg",
      shortSummary: "Collaborative research internship designing accessible smart home control interfaces for aging seniors.",
      category: "Project",
      organization: "SCG WEDO Innovation Center",
      role: "UX Research & Interaction Intern",
      location: "Bangkok, Thailand",
      eventDate: new Date("2025-07-31"),
      startDate: new Date("2025-05-01"),
      endDate: new Date("2025-07-31"),
      coverImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&auto=format&fit=crop&q=80",
      featured: true,
      status: "PUBLISHED",
      sortOrder: 9,
      objectives: "Design touch and voice interfaces optimized for seniors with mild cognitive impairment and reduced motor precision.",
      responsibilities: "Conducted usability testing with 24 elderly participants, created oversized tactile design components, and analyzed latency impact.",
      outcomes: "Decreased task completion error rate by 42% on prototype smart lighting and climate controls.",
      reflection: "Inclusive design for seniors makes digital products dramatically better for all humans.",
      skillsGained: "Geriatric HCI, Usability Lab Testing, Voice UI, Accessibility, SCG WEDO",
      tags: "HCI, Senior UX, Smart Home, SCG WEDO",
      rawContent: `<p>In-depth human-computer interaction project exploring how ambient visual cues and tactile feedback assist elderly residents in managing living environments.</p>`,
      timelineSteps: [
        {
          stepNumber: "01",
          title: "Elderly User Interviews & Biometrics",
          description: "Observed touch accuracy and button-target miss rates across 24 seniors aged 65-82.",
        },
        {
          stepNumber: "02",
          title: "High-Affordance Design System",
          description: "Crafted 64px+ minimum touch targets with haptic confirmation and high-contrast typography.",
        },
        {
          stepNumber: "03",
          title: "Simulated Living Lab Trials",
          description: "Tested voice + touch multimodal commands in a simulated living room environment.",
        },
        {
          stepNumber: "04",
          title: "Final Executive Presentation",
          description: "Delivered findings to SCG digital product leads and patent filing team.",
        },
      ],
    },
    {
      title: "VOKABLOOM — THAI LANGUAGE MORPHOLOGY PLATFORM",
      slug: "vokabloom",
      shortSummary: "Digital learning environment that breaks down complex Thai compound words into morphological roots with interactive visual trees.",
      category: "Project",
      organization: "Academic Thesis Project",
      role: "Lead Designer & Frontend Architect",
      location: "Bangkok, Thailand",
      eventDate: new Date("2025-12-01"),
      coverImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&auto=format&fit=crop&q=80",
      featured: true,
      status: "PUBLISHED",
      sortOrder: 10,
      objectives: "Create an engaging educational tool that teaches non-native and young learners the building blocks of Thai vocabulary.",
      responsibilities: "Engineered web typography rendering, designed interactive morphological tree components, and built clean dark/light themes.",
      outcomes: "Tested by 120 language students with a 68% retention improvement over traditional flashcards.",
      reflection: "Linguistic software requires extreme typographic discipline to maintain clarity across tonal marks and subscript characters.",
      skillsGained: "Next.js, Web Typography, Morphology Visualization, HCI Research",
      tags: "Linguistics, EdTech, Next.js, Case Study",
      rawContent: `<p>Vokabloom visualizes Thai morphological etymology through interactive node graphs and harmonious typography, turning abstract grammar rules into intuitive spatial maps.</p>`,
      timelineSteps: [
        {
          stepNumber: "01",
          title: "Linguistic Research & Corpus Assembly",
          description: "Structured dataset of 2,400+ Thai compound roots with semantic classifications.",
        },
        {
          stepNumber: "02",
          title: "Spatial Tree Layout Engine",
          description: "Designed SVG/Canvas tree algorithm that renders word relationships without overlapping labels.",
        },
        {
          stepNumber: "03",
          title: "Classroom Usability Validation",
          description: "Conducted double-blind evaluation comparing Vokabloom against standard textbook study.",
        },
        {
          stepNumber: "04",
          title: "Open Source Release & Documentation",
          description: "Published interactive documentation, design tokens, and web application.",
        },
      ],
    },
  ];

  for (const act of activitiesData) {
    const { timelineSteps, ...activityFields } = act;
    const createdActivity = await prisma.activity.create({
      data: activityFields,
    });

    if (timelineSteps && timelineSteps.length > 0) {
      await prisma.activityBlock.create({
        data: {
          activityId: createdActivity.id,
          type: "process_timeline",
          order: 1,
          data: JSON.stringify({
            title: "Process & Milestones",
            subtitle: "Step-by-step methodological journey",
            steps: timelineSteps,
          }),
        },
      });
    }
  }

  console.log(`✅ Seeded ${activitiesData.length} rich Activities & Events.`);

  // 7. Digital Art & Digital Painting Collection
  const artCategories = [
    { name: "Digital Painting", slug: "digital-painting", order: 1 },
    { name: "Character Design", slug: "character-design", order: 2 },
    { name: "Concept Art", slug: "concept-art", order: 3 },
    { name: "Visual Study", slug: "visual-study", order: 4 },
    { name: "Illustration", slug: "illustration", order: 5 },
  ];

  const catMap = {};
  for (const cat of artCategories) {
    const createdCat = await prisma.artworkCategory.create({ data: cat });
    catMap[cat.slug] = createdCat.id;
  }

  const artworksData = [
    {
      title: "Ethereal Canopy — Forest Atmosphere Study",
      slug: "ethereal-canopy",
      description: "An exploration of dappled ambient light filtering through ancient cedar canopies, focusing on atmospheric perspective and depth of field.",
      year: 2026,
      categoryId: catMap["digital-painting"],
      medium: "Digital Painting",
      software: "Procreate on iPad Pro",
      dimensions: "3840 × 2160 px",
      imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=90",
      thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
      tags: "Landscape, Atmosphere, Light Study, Nature",
      featured: true,
      status: "PUBLISHED",
      sortOrder: 1,
      processImages: JSON.stringify([
        { label: "01. Rough Value Sketch", imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80", description: "Established primary light sources and shadow silhouettes." },
        { label: "02. Color Key & Underpainting", imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80", description: "Laid down warm ochre ground with cool cyan sky ambient fills." },
        { label: "03. Foliage Detailing & Texturing", imageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80", description: "Built custom foliage brushes to render edge variety." },
        { label: "04. Final Polish & Atmospheric Glazes", imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=90", description: "Applied volumetric fog passes and chromatic aberration on edges." },
      ]),
    },
    {
      title: "Cybernetic Nomad — Character Concept",
      slug: "cybernetic-nomad",
      description: "Character design exploring the intersection of traditional woven textiles with rugged modular cyberware in a dusty wasteland setting.",
      year: 2025,
      categoryId: catMap["character-design"],
      medium: "Character Concept Art",
      software: "Adobe Photoshop & Clip Studio Paint",
      dimensions: "3000 × 4000 px",
      imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=90",
      thumbnailUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
      tags: "Sci-Fi, Character Design, Cyberpunk, Costume",
      featured: true,
      status: "PUBLISHED",
      sortOrder: 2,
      processImages: JSON.stringify([
        { label: "01. Gesture & Silhouette", imageUrl: "https://images.unsplash.com/photo-1582561073860-70f90117f7b2?w=800&auto=format&fit=crop&q=80", description: "Explored dynamic poses conveying weariness and resilience." },
        { label: "02. Costume Breakdowns", imageUrl: "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?w=800&auto=format&fit=crop&q=80", description: "Iterated on drape folds vs hard mechanical joints." },
        { label: "03. Material Rendering", imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=90", description: "Rendered weathered brass, matte carbon, and distressed canvas." },
      ]),
    },
    {
      title: "Solitary Lighthouse — Color & Mood Exploration",
      slug: "solitary-lighthouse",
      description: "A dramatic visual study capturing the intense chromatic contrast between a nocturnal storm and the piercing amber beacon beam.",
      year: 2025,
      categoryId: catMap["digital-painting"],
      medium: "Digital Painting",
      software: "Clip Studio Paint",
      dimensions: "4000 × 2500 px",
      imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=90",
      thumbnailUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80",
      tags: "Seascape, Night, Lighthouse, Storm, Moody",
      featured: true,
      status: "PUBLISHED",
      sortOrder: 3,
      processImages: JSON.stringify([
        { label: "01. Composition Thumbnail", imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80", description: "Rule of thirds focal placement for lighthouse." },
        { label: "02. Dynamic Ocean Waves", imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=90", description: "Textured sea spray and foam highlights under moonlight." },
      ]),
    },
    {
      title: "Neon Rain — Urban Sci-Fi Environment",
      slug: "neon-rain",
      description: "Perspective and specular reflection study of a rain-soaked metropolis alleyway bathed in magenta and cyan neon signage.",
      year: 2026,
      categoryId: catMap["concept-art"],
      medium: "Environment Concept Art",
      software: "Photoshop & Blender 3D (Blockout)",
      dimensions: "3840 × 2160 px",
      imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=90",
      thumbnailUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
      tags: "Cityscape, Sci-Fi, Neon, Rainy, Cyberpunk",
      featured: true,
      status: "PUBLISHED",
      sortOrder: 4,
      processImages: JSON.stringify([
        { label: "01. 3D Architectural Blockout", imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80", description: "Basic camera angles and street geometry established in Blender." },
        { label: "02. Matte Painting & Glazes", imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=90", description: "Hand-painted puddles and illuminated steam exhaust." },
      ]),
    },
    {
      title: "Flora & Mechanics — Biomechanical Study",
      slug: "flora-and-mechanics",
      description: "Experimental visual study investigating organic botanical vascular structures hybridized with hydraulic mechanisms.",
      year: 2025,
      categoryId: catMap["visual-study"],
      medium: "Visual Study",
      software: "Procreate",
      dimensions: "3000 × 3000 px",
      imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1600&auto=format&fit=crop&q=90",
      thumbnailUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&auto=format&fit=crop&q=80",
      tags: "Biomechanical, Abstract, Botanical, Experimental",
      featured: false,
      status: "PUBLISHED",
      sortOrder: 5,
      processImages: JSON.stringify([
        { label: "01. Anatomical Sketch", imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80", description: "Cross-section dissection study." },
        { label: "02. Color Modulation", imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&auto=format&fit=crop&q=90", description: "Iridescent emerald and copper leaf render." },
      ]),
    },
    {
      title: "Twilight Whispers — Character Illustration",
      slug: "twilight-whispers",
      description: "Poetic illustrative portrait capturing serene introspection amidst falling autumn leaves at dusk.",
      year: 2026,
      categoryId: catMap["illustration"],
      medium: "Digital Illustration",
      software: "Clip Studio Paint",
      dimensions: "2800 × 3600 px",
      imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=90",
      thumbnailUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
      tags: "Portrait, Dusk, Mood, Editorial Illustration",
      featured: true,
      status: "PUBLISHED",
      sortOrder: 6,
      processImages: JSON.stringify([
        { label: "01. Thumbnail & Emotion", imageUrl: "https://images.unsplash.com/photo-1582561073860-70f90117f7b2?w=800&auto=format&fit=crop&q=80", description: "Loose gestural lines prioritizing expression." },
        { label: "02. Clean Line Work", imageUrl: "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?w=800&auto=format&fit=crop&q=80", description: "Tapered vector-like ink work." },
        { label: "03. Warm Lighting Pass", imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=90", description: "Golden hour rim light against violet background." },
      ]),
    },
  ];

  for (const art of artworksData) {
    await prisma.artwork.create({ data: art });
  }

  console.log(`✅ Seeded ${artworksData.length} Digital Artworks across ${artCategories.length} Categories.`);

  // 8. Seed Theme & SEO Settings
  await prisma.themeSetting.create({
    data: {
      id: "default",
      accentColor: "#2d7063",
      accentHover: "#388a7b",
      fontFamily: "Inter",
      borderRadius: "0.5rem",
      smokeveilDark: true,
      smokeveilLight: true,
    },
  });

  await prisma.sEOSetting.create({
    data: {
      id: "default",
      siteTitle: "pasiri — Portfolio & Case Studies",
      siteDescription: "A personal digital home and portfolio focused on UX/UI design, interactive process, activities, and design thinking.",
      authorName: "pasiri",
      keywords: "pasiri, portfolio, UX UI design, design thinking, case studies, interaction design",
      twitterHandle: "@pasiri",
      sitemapEnabled: true,
    },
  });

  console.log("🚀 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
