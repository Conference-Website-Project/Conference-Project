export interface Track {
  id: string;
  name: string;
  code: string;
  description: string;
}

export interface ImportantDate {
  title: string;
  date: string;
  isPassed?: boolean;
  highlight?: boolean;
}

export interface KeynoteSpeaker {
  id: string;
  name: string;
  title: string;
  affiliation: string;
  bio: string;
  topic: string;
}

export interface CommitteeMember {
  name: string;
  role: string;
  affiliation: string;
  category: 'patron' | 'chair' | 'organizing' | 'technical';
}

export interface ConferenceConfig {
  id: string;
  name: string;
  shortName: string;
  year: number;
  theme: string;
  institution: string;
  location: {
    venue: string;
    city: string;
    state: string;
    country: string;
  };
  dates: {
    startDate: string;
    endDate: string;
    formatted: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
  };
  tracks: Track[];
  importantDates: ImportantDate[];
  speakers: KeynoteSpeaker[];
  committee: CommitteeMember[];
  fees: {
    category: string;
    indianAmount: string;
    foreignAmount: string;
  }[];
}

export const defaultConferenceConfig: ConferenceConfig = {
  id: "conf-2027-001",
  name: "International Conference on Advanced Research in Engineering and Technology",
  shortName: "ICARET 2027",
  year: 2027,
  theme: "Empowering Next-Generation Sustainable Systems and Artificial Intelligence",
  institution: "College of Engineering & Technology",
  location: {
    venue: "Main Auditorium & Conference Complex",
    city: "New Delhi",
    state: "Delhi",
    country: "India",
  },
  dates: {
    startDate: "2027-04-15",
    endDate: "2027-04-17",
    formatted: "April 15–17, 2027",
  },
  contact: {
    email: "icaret2027@college.edu",
    phone: "+91 11 2345 6789",
    address: "Campus Block 4, College Campus, University Road, New Delhi 110001, India",
  },
  socialLinks: {
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
  },
  tracks: [
    {
      id: "track-1",
      code: "TRK-01",
      name: "Artificial Intelligence, Data Science & Machine Learning",
      description: "Neural networks, deep learning, natural language processing, computer vision, trustworthy AI, and intelligent data-driven applications.",
    },
    {
      id: "track-2",
      code: "TRK-02",
      name: "Sustainable Systems & Clean Energy",
      description: "Renewable energy systems, smart cities, eco-friendly materials, energy optimization, and carbon-neutral technologies.",
    },
    {
      id: "track-3",
      code: "TRK-03",
      name: "Cyber Security, Networks & Privacy",
      description: "Cybersecurity, network security, privacy-preserving systems, secure computing, threat detection, and digital trust.",
    },
    {
      id: "track-4",
      code: "TRK-04",
      name: "Intelligent Computing, IoT & Emerging Technologies",
      description: "Internet of Things, edge computing, cloud computing, intelligent embedded systems, distributed computing, and emerging technologies.",
    },
  ],
  importantDates: [
    { title: "Full Paper Submission Deadline", date: "December 15, 2026", highlight: true },
    { title: "Notification of Acceptance", date: "February 10, 2027" },
    { title: "Camera-Ready Paper Submission", date: "March 01, 2027" },
    { title: "Early Bird Registration Deadline", date: "March 15, 2027", highlight: true },
    { title: "Main Conference Dates", date: "April 15–17, 2027", highlight: true },
  ],
  speakers: [
    {
      id: "spk-1",
      name: "Prof. Eleanor Vance",
      title: "Professor of Computer Science & AI Ethics",
      affiliation: "Institute for Advanced Studies, UK",
      bio: "Leading researcher in ethical AI systems and trustworthy machine learning models.",
      topic: "Responsible AI Architecture in Next-Generation Systems",
    },
    {
      id: "spk-2",
      name: "Dr. Rajesh K. Sharma",
      title: "Senior Principal Scientist",
      affiliation: "National Renewable Energy Laboratory",
      bio: "Pioneer in smart grid integration and sustainable microgrid energy distribution.",
      topic: "Decentralized Smart Grids: Path to Net-Zero Cities",
    },
    {
      id: "spk-3",
      name: "Dr. Sophia Chen",
      title: "Director of Quantum Computing Research",
      affiliation: "Tech Research Alliance, Singapore",
      bio: "Pioneer in post-quantum cryptography and cloud infrastructure resilience.",
      topic: "Securing Distributed Systems in the Quantum Era",
    },
  ],
  committee: [
    { name: "Dr. A. K. Sundaram", role: "Chief Patron", affiliation: "Principal, College of Engineering", category: "patron" },
    { name: "Prof. Meera Deshmukh", role: "General Conference Chair", affiliation: "Head of Computer Science", category: "chair" },
    { name: "Dr. Robert Miller", role: "Technical Program Chair", affiliation: "Dept. of Electrical Engineering", category: "chair" },
    { name: "Dr. S. Ramanathan", role: "Organizing Secretary", affiliation: "Dept. of Information Technology", category: "organizing" },
    { name: "Dr. Anita Roy", role: "Publication Chair", affiliation: "Dept. of Electronics & Comm.", category: "organizing" },
  ],
  fees: [
    { category: "Full-time Student / Scholar", indianAmount: "₹ 4,500", foreignAmount: "$ 150 USD" },
    { category: "Academic Delegate / Faculty", indianAmount: "₹ 6,500", foreignAmount: "$ 250 USD" },
    { category: "Industry Delegate", indianAmount: "₹ 8,500", foreignAmount: "$ 350 USD" },
    { category: "Attendee Only (Non-Author)", indianAmount: "₹ 2,500", foreignAmount: "$ 100 USD" },
  ],
};
