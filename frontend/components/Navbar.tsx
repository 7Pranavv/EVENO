// "use client";

// export default function Navbar() {
//   return (
//     <nav className="fixed top-0 left-0 right-0 z-[900] flex items-center justify-between px-[60px] py-5 backdrop-blur-xl bg-[rgba(6,8,15,0.75)] border-b border-white/[0.07]">
//       <div className="flex items-center gap-2 font-syne font-extrabold text-2xl tracking-tight">
//         <span className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse2" />
//         Emple Events
//       </div>

//       <ul className="hidden lg:flex gap-9 list-none">
//         {["Browse Events", "For Colleges", "How It Works", "Pricing"].map((item) => (
//           <li key={item}>
//             <a
//               href="#"
//               className="text-muted text-sm font-medium tracking-wide hover:text-[var(--text)] transition-colors duration-200"
//             >
//               {item}
//             </a>
//           </li>
//         ))}
//       </ul>

//       <div className="flex items-center gap-3">
//         <button className="px-[22px] py-[9px] border border-white/[0.07] rounded-lg text-[var(--text)] bg-transparent text-sm hover:border-white/25 hover:bg-white/5 transition-all duration-200">
//           Login
//         </button>
//         <button className="px-[22px] py-[9px] bg-accent rounded-lg text-white text-sm font-medium hover:bg-[#ff6035] hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(255,77,28,0.35)] transition-all duration-200">
//           Signup
//         </button>
//       </div>
//     </nav>
//   );
// }

"use client";

import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 right-0 z-[900] flex items-center justify-between px-[60px] py-5 backdrop-blur-xl bg-[rgba(6,8,15,0.75)] border-b border-white/[0.07]">
      <div className="flex items-center gap-2 font-syne font-extrabold text-2xl tracking-tight">
        <span className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse2" />
        Emple Events
      </div>

      <ul className="hidden lg:flex gap-9 list-none">
        {["Browse Events", "For Colleges", "How It Works", "Pricing"].map((item) => (
          <li key={item}>
            <a
              href="#"
              className="text-muted text-sm font-medium tracking-wide hover:text-[var(--text)] transition-colors duration-200"
            >
              {item}
            </a>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/login")}
          className="px-[22px] py-[9px] border border-white/[0.07] rounded-lg text-[var(--text)] bg-transparent text-sm hover:border-white/25 hover:bg-white/5 transition-all duration-200"
        >
          Login
        </button>
        <button
          onClick={() => router.push("/signup")}
          className="px-[22px] py-[9px] bg-accent rounded-lg text-white text-sm font-medium hover:bg-[#ff6035] hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(255,77,28,0.35)] transition-all duration-200"
        >
          Signup
        </button>
      </div>
    </nav>
  );
}