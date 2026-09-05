// Sample content for the seed script. Everything here is fictional — the
// people, colleges and vendors do not exist, and the emails are all on
// example.com so they can never reach a real inbox.

export const DEMO_PREFIX = "demo-";

export interface DemoUser {
  key: string;               // becomes descopeId as `demo-<key>`
  name: string;
  email: string;
  role: "organizer" | "participant" | "vendor";
  college?: string;
  status?: "active" | "banned";
}

export const organizers: DemoUser[] = [
  { key: "org-meera",  name: "Meera Raghavan", email: "meera.raghavan@example.com", role: "organizer", college: "Sardar Patel Institute of Technology" },
  { key: "org-arjun",  name: "Arjun Bhatt",    email: "arjun.bhatt@example.com",    role: "organizer", college: "Christ University, Bengaluru" },
];

export const vendors: DemoUser[] = [
  { key: "ven-lensroom",  name: "The Lens Room",      email: "hello@lensroom.example.com",   role: "vendor" },
  { key: "ven-spicebox",  name: "Spicebox Catering",  email: "orders@spicebox.example.com",  role: "vendor" },
  { key: "ven-basspoint", name: "Basspoint Sound & DJ", email: "book@basspoint.example.com", role: "vendor" },
  { key: "ven-marigold",  name: "Marigold Decor Co.", email: "studio@marigold.example.com",  role: "vendor" },
];

export const participants: DemoUser[] = [
  { key: "par-ananya",  name: "Ananya Deshmukh", email: "ananya.d@example.com",   role: "participant", college: "Sardar Patel Institute of Technology" },
  { key: "par-rohan",   name: "Rohan Iyer",      email: "rohan.iyer@example.com", role: "participant", college: "VJTI Mumbai" },
  { key: "par-fatima",  name: "Fatima Sheikh",   email: "fatima.s@example.com",   role: "participant", college: "Christ University, Bengaluru" },
  { key: "par-karthik", name: "Karthik Nair",    email: "karthik.n@example.com",  role: "participant", college: "PSG College of Technology" },
  { key: "par-simran",  name: "Simran Kaur",     email: "simran.k@example.com",   role: "participant", college: "Thapar Institute" },
  { key: "par-devansh", name: "Devansh Mehta",   email: "devansh.m@example.com",  role: "participant", college: "NIT Surathkal" },
  { key: "par-priya",   name: "Priya Balan",     email: "priya.b@example.com",    role: "participant", college: "Anna University" },
  { key: "par-imran",   name: "Imran Qureshi",   email: "imran.q@example.com",    role: "participant", college: "Jamia Millia Islamia" },
  { key: "par-tanvi",   name: "Tanvi Joshi",     email: "tanvi.j@example.com",    role: "participant", college: "Fergusson College" },
  // One suspended account so the admin dashboard has both states to render.
  { key: "par-blocked", name: "Nikhil Varma",    email: "nikhil.v@example.com",   role: "participant", college: "Amity Noida", status: "banned" },
];

// A real event has hundreds of distinct attendees. Without a pool this size
// the same handful of people would appear on one event's list a dozen times
// over, which reads as broken data rather than a busy festival.
const FIRST_NAMES = [
  "Aarav", "Aditi", "Advait", "Aisha", "Akash", "Amara", "Aniket", "Anjali", "Ansh", "Apurva",
  "Arnav", "Avani", "Bhavya", "Chirag", "Darshan", "Dhruv", "Divya", "Esha", "Farhan", "Gaurav",
  "Harini", "Hitesh", "Indira", "Ishaan", "Jaya", "Kabir", "Kavya", "Kiran", "Lakshmi", "Manav",
  "Meghna", "Mihir", "Naina", "Neel", "Nithya", "Omkar", "Pallavi", "Parth", "Pooja", "Rahul",
  "Rakesh", "Riya", "Sahana", "Samir", "Sanya", "Shreya", "Siddharth", "Sneha", "Tarun", "Uma",
  "Varun", "Vidya", "Vikram", "Yash", "Zoya",
];

const LAST_NAMES = [
  "Agarwal", "Banerjee", "Chauhan", "Desai", "Dutta", "Gupta", "Hegde", "Iyer", "Jain", "Kulkarni",
  "Menon", "Nair", "Patel", "Pillai", "Rao", "Reddy", "Sharma", "Shetty", "Singh", "Trivedi",
];

const COLLEGES = [
  "Sardar Patel Institute of Technology", "VJTI Mumbai", "Christ University, Bengaluru",
  "PSG College of Technology", "Thapar Institute", "NIT Surathkal", "Anna University",
  "Jamia Millia Islamia", "Fergusson College", "BITS Pilani", "Manipal Institute of Technology",
  "Delhi Technological University",
];

// Deterministic: the same pool every run, so re-seeding is reproducible.
const generateParticipants = (count: number): DemoUser[] =>
  Array.from({ length: count }, (_, i) => {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length];
    return {
      key: `par-gen-${i}`,
      name: `${first} ${last}`,
      // The index keeps every address unique even when a name repeats.
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`,
      role: "participant" as const,
      college: COLLEGES[i % COLLEGES.length],
    };
  });

// Must be at least as large as the biggest event's registration count, so an
// event can fill every seat with a different person.
export const attendeePool: DemoUser[] = [...participants, ...generateParticipants(420)];

export interface DemoEvent {
  key: string;
  organizerKey: string;
  title: string;
  description: string;
  date: string;              // ISO date
  location: string;
  category: string;
  totalSeats: number;
  price: number;
  disbursed?: boolean;
  // How many attendees to generate, and how many of those have actually paid.
  registrations: number;
  paid: number;
}

// A mix of past (disbursed), imminent and upcoming events, priced from free
// to premium, so every dashboard state has something to show.
export const events: DemoEvent[] = [
  {
    key: "techfest", organizerKey: "org-meera",
    title: "Technovanza 2026 — Main Stage",
    description: "Three days of robotics, hardware hacking and a 24-hour build sprint. Includes lunch and a kit for every registered team.",
    date: "2026-02-14", location: "Mumbai", category: "Technology",
    totalSeats: 400, price: 750, registrations: 138, paid: 131, disbursed: true,
  },
  {
    key: "hackday", organizerKey: "org-meera",
    title: "SPIT HackDay — Open Track",
    description: "An overnight hackathon open to any undergraduate. Bring a team of up to four; mentors from six product companies on site.",
    date: "2026-03-07", location: "Mumbai", category: "Technology",
    totalSeats: 220, price: 300, registrations: 96, paid: 88,
  },
  {
    key: "litfest", organizerKey: "org-arjun",
    title: "Inkwell Literature Festival",
    description: "Poetry slams, a translation workshop and a closing panel on regional publishing.",
    date: "2026-03-21", location: "Bengaluru", category: "Culture",
    totalSeats: 180, price: 250, registrations: 74, paid: 69,
  },
  {
    key: "startup", organizerKey: "org-arjun",
    title: "Founders' Roundtable — Spring Cohort",
    description: "Twelve student founders pitch to a panel of early-stage investors. Audience seats are limited.",
    date: "2026-04-04", location: "Bengaluru", category: "Business",
    totalSeats: 120, price: 1200, registrations: 51, paid: 47,
  },
  {
    key: "musicnight", organizerKey: "org-meera",
    title: "Monsoon Sessions — Live Music Night",
    description: "Four student bands and a headline set. Outdoor amphitheatre, gates at 6pm.",
    date: "2026-04-18", location: "Pune", category: "Music",
    totalSeats: 600, price: 499, registrations: 243, paid: 228,
  },
  {
    key: "career", organizerKey: "org-arjun",
    title: "Campus Career Clinic",
    description: "Free CV reviews and mock interviews with recruiters. Walk-ins welcome, but registered students get a guaranteed slot.",
    date: "2026-05-02", location: "Bengaluru", category: "Career",
    totalSeats: 300, price: 0, registrations: 187, paid: 187,
  },
  {
    key: "designjam", organizerKey: "org-meera",
    title: "Design Jam: Interfaces for Bharat",
    description: "A one-day jam on designing for low-bandwidth, multilingual users. Laptops required.",
    date: "2026-05-16", location: "Mumbai", category: "Design",
    totalSeats: 150, price: 400, registrations: 38, paid: 34,
  },
  {
    key: "sports", organizerKey: "org-arjun",
    title: "Inter-College Football Cup — Group Stage",
    description: "Sixteen colleges, four groups, one weekend. Spectator passes cover all group-stage fixtures.",
    date: "2026-05-30", location: "Bengaluru", category: "Sports",
    totalSeats: 800, price: 150, registrations: 312, paid: 297,
  },
  {
    key: "alumni", organizerKey: "org-meera",
    title: "Alumni Homecoming Dinner",
    description: "Seated dinner for the classes of 2015-2020. Plus-ones welcome at the same rate.",
    date: "2026-06-13", location: "Mumbai", category: "Community",
    totalSeats: 250, price: 1500, registrations: 89, paid: 82,
  },
  {
    key: "workshop", organizerKey: "org-arjun",
    title: "Intro to Embedded Rust — Weekend Workshop",
    description: "Hands-on, hardware provided. No prior Rust needed but you should be comfortable with C.",
    date: "2026-06-27", location: "Bengaluru", category: "Technology",
    totalSeats: 60, price: 0, registrations: 44, paid: 44,
  },
];

export interface DemoService {
  vendorKey: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available?: boolean;
}

export const services: DemoService[] = [
  { vendorKey: "ven-lensroom",  name: "Full-Day Event Photography",  description: "Two photographers, 8 hours, edited gallery delivered within 5 working days.", price: 18000, category: "Photography" },
  { vendorKey: "ven-lensroom",  name: "Highlight Reel (3-4 min)",    description: "Same-day filming plus a cut highlight video with licensed music.",            price: 25000, category: "Photography" },
  { vendorKey: "ven-spicebox",  name: "Buffet Lunch — per 100 pax",  description: "Vegetarian and non-vegetarian counters, staff and service ware included.",   price: 32000, category: "Catering" },
  { vendorKey: "ven-spicebox",  name: "Tea & Snacks Counter",        description: "Continuous service for up to 6 hours. Filter coffee, chai, three snacks.",   price: 9500,  category: "Catering" },
  { vendorKey: "ven-spicebox",  name: "Late-Night Hackathon Refuel", description: "Midnight to 4am service. Only sensible for overnight events.",               price: 14000, category: "Catering", available: false },
  { vendorKey: "ven-basspoint", name: "Line Array PA + Engineer",    description: "Suitable for outdoor crowds up to 1500. Includes setup, soundcheck, teardown.", price: 45000, category: "DJ" },
  { vendorKey: "ven-basspoint", name: "DJ Set — 4 Hours",            description: "Resident DJ, controller and monitors. Requests taken up front.",             price: 16000, category: "DJ" },
  { vendorKey: "ven-marigold",  name: "Stage & Backdrop Styling",    description: "Custom backdrop to your artwork, floral dressing and stage lighting trim.",  price: 27000, category: "Decoration" },
  { vendorKey: "ven-marigold",  name: "Entrance & Foyer Décor",      description: "Welcome arch, signage frames and photo corner.",                             price: 11000, category: "Decoration" },
];

export interface DemoHire {
  eventKey: string;
  vendorKey: string;
  serviceName: string;
  amount: number;
  status: "pending" | "accepted" | "rejected";
  paid?: boolean;
  withdrawn?: boolean;
}

export const hires: DemoHire[] = [
  { eventKey: "techfest",   vendorKey: "ven-lensroom",  serviceName: "Full-Day Event Photography", amount: 18000, status: "accepted", paid: true, withdrawn: true },
  { eventKey: "techfest",   vendorKey: "ven-spicebox",  serviceName: "Buffet Lunch — per 100 pax", amount: 64000, status: "accepted", paid: true, withdrawn: true },
  { eventKey: "musicnight", vendorKey: "ven-basspoint", serviceName: "Line Array PA + Engineer",   amount: 45000, status: "accepted", paid: true },
  { eventKey: "musicnight", vendorKey: "ven-marigold",  serviceName: "Stage & Backdrop Styling",   amount: 27000, status: "accepted", paid: true },
  { eventKey: "hackday",    vendorKey: "ven-spicebox",  serviceName: "Late-Night Hackathon Refuel", amount: 14000, status: "rejected" },
  { eventKey: "hackday",    vendorKey: "ven-lensroom",  serviceName: "Highlight Reel (3-4 min)",   amount: 25000, status: "pending" },
  { eventKey: "litfest",    vendorKey: "ven-marigold",  serviceName: "Entrance & Foyer Décor",     amount: 11000, status: "pending" },
  { eventKey: "alumni",     vendorKey: "ven-spicebox",  serviceName: "Buffet Lunch — per 100 pax", amount: 80000, status: "accepted", paid: true },
  { eventKey: "sports",     vendorKey: "ven-basspoint", serviceName: "DJ Set — 4 Hours",           amount: 16000, status: "pending" },
];
