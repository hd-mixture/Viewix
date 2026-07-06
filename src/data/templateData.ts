import type { Template } from "@/store/useWorkspaceStore"

export const templateData: Template[] = [
  {
    id: "t1",
    title: "Modern Invoice",
    category: "Invoices",
    thumbnail: "/templates/modern_invoice.png",
    description: "Clean, professional invoice for freelancers and agencies.",
    annotations: [
      { type: "text", text: "ABC CORPORATION", x: 50, y: 50, fontSize: 24, fontWeight: "bold", color: "#1e293b" },
      { type: "text", text: "INVOICE #2045", x: 400, y: 50, fontSize: 16, fontWeight: "bold", color: "#64748b" },
      { type: "text", text: "Billed To:\nJohn Doe\n123 Business Rd.\nTech City, TX", x: 50, y: 100, fontSize: 12, color: "#475569" },
      { type: "text", text: "Date: July 15, 2026\nDue Date: Aug 15, 2026", x: 400, y: 100, fontSize: 12, color: "#475569" },
      { type: "line", x: 50, y: 170, width: 495, height: 2, color: "#cbd5e1" }, // x2/y2 usually handled by width/height in our engine or points
      { type: "rectangle", x: 50, y: 190, width: 495, height: 30, fillColor: "#f1f5f9", strokeWidth: 0 },
      { type: "text", text: "Description", x: 60, y: 198, fontSize: 11, fontWeight: "bold", color: "#334155" },
      { type: "text", text: "Qty", x: 350, y: 198, fontSize: 11, fontWeight: "bold", color: "#334155" },
      { type: "text", text: "Price", x: 400, y: 198, fontSize: 11, fontWeight: "bold", color: "#334155" },
      { type: "text", text: "Total", x: 480, y: 198, fontSize: 11, fontWeight: "bold", color: "#334155" },
      { type: "text", text: "Website Redesign", x: 60, y: 240, fontSize: 11, color: "#475569" },
      { type: "text", text: "1", x: 355, y: 240, fontSize: 11, color: "#475569" },
      { type: "text", text: "$4,500", x: 400, y: 240, fontSize: 11, color: "#475569" },
      { type: "text", text: "$4,500", x: 480, y: 240, fontSize: 11, color: "#475569" },
      { type: "text", text: "SEO Optimization", x: 60, y: 270, fontSize: 11, color: "#475569" },
      { type: "text", text: "1", x: 355, y: 270, fontSize: 11, color: "#475569" },
      { type: "text", text: "$1,200", x: 400, y: 270, fontSize: 11, color: "#475569" },
      { type: "text", text: "$1,200", x: 480, y: 270, fontSize: 11, color: "#475569" },
      { type: "line", x: 350, y: 320, width: 195, height: 2, color: "#cbd5e1" },
      { type: "text", text: "Subtotal:", x: 350, y: 340, fontSize: 12, fontWeight: "bold", color: "#334155" },
      { type: "text", text: "$5,700", x: 480, y: 340, fontSize: 12, color: "#475569" },
      { type: "text", text: "Tax (10%):", x: 350, y: 360, fontSize: 12, fontWeight: "bold", color: "#334155" },
      { type: "text", text: "$570", x: 480, y: 360, fontSize: 12, color: "#475569" },
      { type: "text", text: "Total Due:", x: 350, y: 390, fontSize: 16, fontWeight: "bold", color: "#0f172a" },
      { type: "text", text: "$6,270", x: 470, y: 390, fontSize: 16, fontWeight: "bold", color: "#2563eb" },
      { type: "text", text: "Thank you for your business!", x: 50, y: 450, fontSize: 12, fontStyle: "italic", color: "#64748b" }
    ]
  },
  {
    id: "t2",
    title: "Creative Resume",
    category: "Resume",
    thumbnail: "/templates/creative_resume.png",
    description: "Stand out with this modern resume design.",
    annotations: [
      { type: "text", text: "ALEXANDER SMITH", x: 50, y: 60, fontSize: 32, fontWeight: "bold", color: "#0f172a" },
      { type: "text", text: "Senior Software Engineer", x: 50, y: 100, fontSize: 16, color: "#3b82f6" },
      { type: "text", text: "alex@example.com  |  +1 234 567 890  |  github.com/alexsmith", x: 50, y: 130, fontSize: 11, color: "#64748b" },
      { type: "line", x: 50, y: 160, width: 495, height: 2, color: "#e2e8f0" },
      
      { type: "text", text: "EXPERIENCE", x: 50, y: 190, fontSize: 14, fontWeight: "bold", color: "#0f172a" },
      { type: "text", text: "Tech Innovations Inc. - Lead Developer", x: 50, y: 220, fontSize: 12, fontWeight: "bold", color: "#334155" },
      { type: "text", text: "2022 - Present", x: 450, y: 220, fontSize: 11, color: "#64748b" },
      { type: "text", text: "• Led a team of 5 engineers to migrate legacy systems to React & Node.js.\n• Improved application performance by 40%.\n• Architected cloud infrastructure on AWS.", x: 50, y: 245, fontSize: 11, color: "#475569" },
      
      { type: "text", text: "Global Solutions - Frontend Developer", x: 50, y: 310, fontSize: 12, fontWeight: "bold", color: "#334155" },
      { type: "text", text: "2019 - 2022", x: 450, y: 310, fontSize: 11, color: "#64748b" },
      { type: "text", text: "• Built responsive UI components using Vue.js.\n• Integrated REST APIs and optimized state management.", x: 50, y: 335, fontSize: 11, color: "#475569" },
      
      { type: "text", text: "EDUCATION", x: 50, y: 400, fontSize: 14, fontWeight: "bold", color: "#0f172a" },
      { type: "text", text: "University of Technology - B.S. Computer Science", x: 50, y: 430, fontSize: 12, fontWeight: "bold", color: "#334155" },
      { type: "text", text: "2015 - 2019", x: 450, y: 430, fontSize: 11, color: "#64748b" },
      
      { type: "text", text: "SKILLS", x: 50, y: 490, fontSize: 14, fontWeight: "bold", color: "#0f172a" },
      { type: "rectangle", x: 50, y: 520, width: 80, height: 24, fillColor: "#eff6ff", color: "#3b82f6", cornerRadius: 12 },
      { type: "text", text: "React", x: 72, y: 525, fontSize: 11, color: "#1d4ed8", fontWeight: "bold" },
      { type: "rectangle", x: 140, y: 520, width: 80, height: 24, fillColor: "#eff6ff", color: "#3b82f6", cornerRadius: 12 },
      { type: "text", text: "Node.js", x: 156, y: 525, fontSize: 11, color: "#1d4ed8", fontWeight: "bold" },
      { type: "rectangle", x: 230, y: 520, width: 100, height: 24, fillColor: "#eff6ff", color: "#3b82f6", cornerRadius: 12 },
      { type: "text", text: "TypeScript", x: 246, y: 525, fontSize: 11, color: "#1d4ed8", fontWeight: "bold" },
    ]
  },
  {
    id: "t3",
    title: "Monthly Planner",
    category: "Productivity",
    isPro: true,
    thumbnail: "/templates/monthly_planner.png",
    description: "Organize your month efficiently.",
    annotations: [
      { type: "text", text: "JULY 2026", x: 240, y: 40, fontSize: 24, fontWeight: "bold", color: "#0f172a" },
      { type: "rectangle", x: 40, y: 90, width: 510, height: 350, color: "#cbd5e1", fillColor: "transparent", strokeWidth: 1 },
      // Grid lines
      { type: "line", x: 40, y: 140, width: 510, height: 1, color: "#e2e8f0" },
      { type: "line", x: 40, y: 190, width: 510, height: 1, color: "#e2e8f0" },
      { type: "line", x: 40, y: 240, width: 510, height: 1, color: "#e2e8f0" },
      { type: "line", x: 40, y: 290, width: 510, height: 1, color: "#e2e8f0" },
      { type: "line", x: 40, y: 340, width: 510, height: 1, color: "#e2e8f0" },
      // Verticals
      { type: "line", x: 113, y: 90, width: 1, height: 350, color: "#e2e8f0" },
      { type: "line", x: 186, y: 90, width: 1, height: 350, color: "#e2e8f0" },
      { type: "line", x: 259, y: 90, width: 1, height: 350, color: "#e2e8f0" },
      { type: "line", x: 332, y: 90, width: 1, height: 350, color: "#e2e8f0" },
      { type: "line", x: 405, y: 90, width: 1, height: 350, color: "#e2e8f0" },
      { type: "line", x: 478, y: 90, width: 1, height: 350, color: "#e2e8f0" },
      
      { type: "text", text: "MON", x: 60, y: 105, fontSize: 10, fontWeight: "bold", color: "#64748b" },
      { type: "text", text: "TUE", x: 135, y: 105, fontSize: 10, fontWeight: "bold", color: "#64748b" },
      { type: "text", text: "WED", x: 205, y: 105, fontSize: 10, fontWeight: "bold", color: "#64748b" },
      { type: "text", text: "THU", x: 280, y: 105, fontSize: 10, fontWeight: "bold", color: "#64748b" },
      { type: "text", text: "FRI", x: 355, y: 105, fontSize: 10, fontWeight: "bold", color: "#64748b" },
      { type: "text", text: "SAT", x: 430, y: 105, fontSize: 10, fontWeight: "bold", color: "#64748b" },
      { type: "text", text: "SUN", x: 500, y: 105, fontSize: 10, fontWeight: "bold", color: "#64748b" },
      
      { type: "text", text: "MONTHLY GOALS", x: 40, y: 470, fontSize: 14, fontWeight: "bold", color: "#0f172a" },
      { type: "rectangle", x: 40, y: 500, width: 240, height: 120, color: "#cbd5e1", fillColor: "#f8fafc", cornerRadius: 8 },
      { type: "text", text: "1. \n2. \n3. \n4.", x: 55, y: 520, fontSize: 12, color: "#475569" },

      { type: "text", text: "NOTES", x: 310, y: 470, fontSize: 14, fontWeight: "bold", color: "#0f172a" },
      { type: "rectangle", x: 310, y: 500, width: 240, height: 120, color: "#cbd5e1", fillColor: "#f8fafc", cornerRadius: 8 },
    ]
  },
  {
    id: "t4",
    title: "Project Proposal",
    category: "Business",
    isPro: true,
    thumbnail: "/templates/project_proposal.png",
    description: "Win more clients with this comprehensive proposal.",
    annotations: [
      { type: "rectangle", x: 0, y: 0, width: 600, height: 120, fillColor: "#1e293b", color: "transparent" },
      { type: "text", text: "PROJECT PROPOSAL", x: 50, y: 50, fontSize: 32, fontWeight: "bold", color: "#ffffff" },
      { type: "text", text: "Prepared for: Acme Corp", x: 50, y: 90, fontSize: 14, color: "#94a3b8" },
      
      { type: "text", text: "1. Executive Summary", x: 50, y: 160, fontSize: 18, fontWeight: "bold", color: "#0f172a" },
      { type: "text", text: "This proposal outlines our approach to delivering a scalable web solution for your enterprise needs. We focus on modern architecture, security, and exceptional user experience.", x: 50, y: 195, fontSize: 12, color: "#475569" },
      
      { type: "text", text: "2. Scope of Work", x: 50, y: 260, fontSize: 18, fontWeight: "bold", color: "#0f172a" },
      { type: "text", text: "• Phase 1: Discovery & Design\n• Phase 2: Frontend & Backend Development\n• Phase 3: QA & Testing\n• Phase 4: Deployment & Training", x: 50, y: 295, fontSize: 12, color: "#475569" },

      { type: "text", text: "3. Timeline & Milestones", x: 50, y: 400, fontSize: 18, fontWeight: "bold", color: "#0f172a" },
      { type: "rectangle", x: 50, y: 435, width: 495, height: 80, color: "#cbd5e1", fillColor: "transparent" },
      { type: "text", text: "Week 1-2: Design Phase\nWeek 3-6: Development Phase\nWeek 7-8: Testing & Launch", x: 70, y: 455, fontSize: 12, color: "#475569" },
    ]
  },
  {
    id: "t5",
    title: "Meeting Minutes",
    category: "Reports",
    thumbnail: "/templates/meeting_minutes.png",
    description: "Simple template for tracking meeting notes and action items.",
    annotations: [
      { type: "text", text: "MEETING MINUTES", x: 50, y: 50, fontSize: 24, fontWeight: "bold", color: "#0f172a" },
      { type: "line", x: 50, y: 85, width: 495, height: 2, color: "#3b82f6" },
      
      { type: "text", text: "Date: July 15, 2026", x: 50, y: 110, fontSize: 12, fontWeight: "bold", color: "#334155" },
      { type: "text", text: "Time: 10:00 AM - 11:30 AM", x: 300, y: 110, fontSize: 12, fontWeight: "bold", color: "#334155" },
      
      { type: "text", text: "ATTENDEES", x: 50, y: 160, fontSize: 14, fontWeight: "bold", color: "#0f172a" },
      { type: "rectangle", x: 50, y: 185, width: 495, height: 60, color: "#cbd5e1", fillColor: "#f8fafc" },
      { type: "text", text: "John Doe, Jane Smith, Robert Johnson, Emily Davis", x: 65, y: 205, fontSize: 11, color: "#475569" },

      { type: "text", text: "AGENDA TOPICS", x: 50, y: 275, fontSize: 14, fontWeight: "bold", color: "#0f172a" },
      { type: "text", text: "1. Q3 Marketing Strategy Review\n2. Budget Allocation for New Tools\n3. Engineering Team Expansion", x: 50, y: 305, fontSize: 12, color: "#475569" },

      { type: "text", text: "ACTION ITEMS", x: 50, y: 395, fontSize: 14, fontWeight: "bold", color: "#0f172a" },
      { type: "rectangle", x: 50, y: 420, width: 495, height: 100, color: "#cbd5e1", fillColor: "transparent" },
      { type: "text", text: "[ ] Finalize budget report (Assignee: John)\n[ ] Schedule interviews for Senior Dev (Assignee: Emily)\n[ ] Renew software licenses (Assignee: Jane)", x: 65, y: 440, fontSize: 12, color: "#475569" },
    ]
  },
  {
    id: "t6",
    title: "Workout Tracker",
    category: "Personal",
    thumbnail: "/templates/workout_tracker.png",
    description: "Track your fitness progress daily.",
    annotations: [
      { type: "text", text: "WORKOUT LOG", x: 50, y: 50, fontSize: 28, fontWeight: "bold", color: "#ea580c" },
      { type: "text", text: "Date: ____/____/20__", x: 400, y: 60, fontSize: 12, color: "#475569" },
      { type: "text", text: "Muscle Group: ____________________", x: 50, y: 95, fontSize: 12, color: "#475569" },
      
      { type: "rectangle", x: 50, y: 140, width: 495, height: 30, fillColor: "#ffedd5", color: "#ea580c" },
      { type: "text", text: "EXERCISE", x: 65, y: 148, fontSize: 11, fontWeight: "bold", color: "#9a3412" },
      { type: "text", text: "SETS", x: 300, y: 148, fontSize: 11, fontWeight: "bold", color: "#9a3412" },
      { type: "text", text: "REPS", x: 370, y: 148, fontSize: 11, fontWeight: "bold", color: "#9a3412" },
      { type: "text", text: "WEIGHT", x: 450, y: 148, fontSize: 11, fontWeight: "bold", color: "#9a3412" },

      { type: "line", x: 50, y: 200, width: 495, height: 1, color: "#cbd5e1" },
      { type: "line", x: 50, y: 240, width: 495, height: 1, color: "#cbd5e1" },
      { type: "line", x: 50, y: 280, width: 495, height: 1, color: "#cbd5e1" },
      { type: "line", x: 50, y: 320, width: 495, height: 1, color: "#cbd5e1" },
      { type: "line", x: 50, y: 360, width: 495, height: 1, color: "#cbd5e1" },
      { type: "line", x: 50, y: 400, width: 495, height: 1, color: "#cbd5e1" },
      
      { type: "text", text: "NOTES:", x: 50, y: 450, fontSize: 14, fontWeight: "bold", color: "#ea580c" },
      { type: "rectangle", x: 50, y: 475, width: 495, height: 100, color: "#cbd5e1", fillColor: "#f8fafc" },
    ]
  },
  {
    id: "t7",
    title: "Course Certificate",
    category: "Certificates",
    thumbnail: "/templates/course_certificate.png",
    description: "A formal certificate template for graduates.",
    orientation: "landscape",
    annotations: [
      { type: "rectangle", x: 20, y: 20, width: 801, height: 555, color: "#eab308", strokeWidth: 8, fillColor: "#fffbeb" },
      { type: "rectangle", x: 30, y: 30, width: 781, height: 535, color: "#ca8a04", strokeWidth: 2, fillColor: "transparent" },
      
      { type: "text", text: "CERTIFICATE", x: 270, y: 100, fontSize: 42, fontWeight: "bold", color: "#854d0e" },
      { type: "text", text: "OF ACHIEVEMENT", x: 310, y: 155, fontSize: 20, color: "#a16207" },
      
      { type: "text", text: "THIS IS PROUDLY PRESENTED TO", x: 310, y: 230, fontSize: 12, fontWeight: "bold", color: "#713f12" },
      
      { type: "text", text: "John Doe", x: 330, y: 280, fontSize: 36, fontStyle: "italic", color: "#1e293b" },
      { type: "line", x: 270, y: 320, width: 295, height: 2, color: "#cbd5e1" },
      
      { type: "text", text: "For successfully completing the Advanced React Architecture\nmasterclass with outstanding performance and dedication.", x: 230, y: 360, fontSize: 14, textAlign: "center", color: "#475569" },

      { type: "line", x: 180, y: 480, width: 150, height: 2, color: "#1e293b" },
      { type: "text", text: "DATE", x: 235, y: 495, fontSize: 10, fontWeight: "bold", color: "#713f12" },

      { type: "line", x: 500, y: 480, width: 150, height: 2, color: "#1e293b" },
      { type: "text", text: "SIGNATURE", x: 540, y: 495, fontSize: 10, fontWeight: "bold", color: "#713f12" },
      
      { type: "cloud", cloudShape: "circle", x: 380, y: 440, width: 80, height: 80, color: "#ca8a04", strokeWidth: 1, density: 10 },
      { type: "text", text: "OFFICIAL\nSEAL", x: 380, y: 466, width: 80, fontSize: 10, fontWeight: "bold", color: "#ca8a04", textAlign: "center" }
    ]
  },
  {
    id: "t8",
    title: "Cover Letter",
    category: "Letters",
    thumbnail: "/templates/cover_letter.png",
    description: "Minimalistic and professional cover letter.",
    annotations: [
      { type: "text", text: "JOHN SMITH", x: 50, y: 50, fontSize: 24, fontWeight: "bold", color: "#0f172a" },
      { type: "text", text: "john.smith@example.com | (555) 123-4567 | 123 Main St, City, State", x: 50, y: 85, fontSize: 10, color: "#64748b" },
      { type: "line", x: 50, y: 110, width: 495, height: 1, color: "#cbd5e1" },
      
      { type: "text", text: "July 15, 2026", x: 50, y: 150, fontSize: 12, color: "#0f172a" },
      
      { type: "text", text: "Hiring Manager\nTech Innovations Inc.\n456 Business Blvd.\nMetropolis, NY 10001", x: 50, y: 190, fontSize: 12, color: "#334155" },

      { type: "text", text: "Dear Hiring Manager,", x: 50, y: 270, fontSize: 12, color: "#0f172a" },
      
      { type: "text", text: "I am writing to express my strong interest in the Senior Frontend Developer\nposition at Tech Innovations Inc. With over 5 years of experience building\nscalable web applications using React and TypeScript, I am confident in my\nability to contribute effectively to your engineering team.", x: 50, y: 310, fontSize: 12, color: "#334155" },
      
      { type: "text", text: "In my previous role at Global Solutions, I led a team that successfully migrated\nour core product to a modern tech stack, resulting in a 40% performance increase.\nI am particularly drawn to your company's commitment to cutting-edge technology\nand user-centric design.", x: 50, y: 380, fontSize: 12, color: "#334155" },

      { type: "text", text: "Thank you for considering my application. I look forward to the possibility of\ndiscussing how my skills and experiences align with your team's goals.", x: 50, y: 460, fontSize: 12, color: "#334155" },

      { type: "text", text: "Sincerely,", x: 50, y: 520, fontSize: 12, color: "#0f172a" },
      { type: "text", text: "John Smith", x: 50, y: 560, fontSize: 12, fontStyle: "italic", color: "#3b82f6" },
    ]
  }
]
