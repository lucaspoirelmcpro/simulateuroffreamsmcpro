"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { StickyCTA } from "@/components/StickyCTA";
import { Hero } from "@/components/Hero";
import { PainPoints } from "@/components/PainPoints";
import { Benefits } from "@/components/Benefits";
import { SocialProof } from "@/components/SocialProof";
import { HowItWorks } from "@/components/HowItWorks";
import { Pricing } from "@/components/Pricing";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";
import { VideoModal } from "@/components/VideoModal";

export default function Home() {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#080b14]">
      {/* Navigation sticky */}
      <Navbar onVideoOpen={() => setVideoOpen(true)} />

      {/* Floating sticky CTA */}
      <StickyCTA onVideoOpen={() => setVideoOpen(true)} />

      {/* Modal vidéo globale */}
      <VideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />

      {/* ① Hero — proposition de valeur */}
      <Hero onVideoOpen={() => setVideoOpen(true)} />

      <div className="section-divider" />

      {/* ② Douleurs */}
      <PainPoints />

      <div className="section-divider" />

      {/* ③ Bénéfices / Solution */}
      <Benefits />

      {/* ④ Preuve sociale #1 — logos + statistiques */}
      <SocialProof />

      <div className="section-divider" />

      {/* ⑤ Comment ça marche */}
      <HowItWorks />

      <div className="section-divider" />

      {/* ⑥ Tarifs */}
      <Pricing />

      <div className="section-divider" />

      {/* ⑦ Preuve sociale #2 — témoignages + cas clients */}
      <Testimonials />

      <div className="section-divider" />

      {/* ⑧ FAQ */}
      <FAQ />

      {/* ⑨ CTA Final + formulaire de demande de démo */}
      <FinalCTA onVideoOpen={() => setVideoOpen(true)} />

      {/* Footer */}
      <Footer />
    </main>
  );
}
