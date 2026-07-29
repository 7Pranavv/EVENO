import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import HowItWorks from "@/components/HowItWorks";
import ForWho from "@/components/ForWho";
import EventTypes from "@/components/EventTypes";
import PaymentFlow from "@/components/PaymentFlow";
import EventCards from "@/components/EventCards";
import Numbers from "@/components/Numbers";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Marquee />
      <HowItWorks />
      <ForWho />
      <EventTypes />
      <PaymentFlow />
      <EventCards />
      <Numbers />
      <CTA />
      <Footer />
    </main>
  );
}
