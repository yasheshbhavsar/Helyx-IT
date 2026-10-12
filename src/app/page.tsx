import Image from "next/image";
import type { CSSProperties } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { ContactRevealButton } from "@/components/microkit/contact-reveal-button";
import { HeroSpatial } from "@/components/hero-spatial";
import { InquiryForm } from "@/components/inquiry-form";
import { ProcessTimeline } from "@/components/process-timeline";
import { ProjectCard } from "@/components/project-card";
import { InteractionLayer } from "@/components/interaction-layer";
import { Marquee } from "@/components/marquee";
import { ScrubText } from "@/components/scrub-text";
import { ServiceList } from "@/components/service-list";
import { SignatureX } from "@/components/signature-x";
import { SiteHeader } from "@/components/site-header";
import { projects } from "@/lib/projects";

const heroLines = [
  ["Digital", "experiences,"],
  ["engineered", "to"],
  ["stand", "apart."],
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Helyx IT",
  description: "Helyx IT designs and develops distinctive websites, interactive digital experiences and reliable SaaS products.",
  url: process.env.NEXT_PUBLIC_SITE_URL,
  knowsAbout: ["Website design and development", "SaaS products", "Interactive web experiences", "Digital product optimization"],
};

export default function Home() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SiteHeader />
      <InteractionLayer />

      <main id="main-content">
        <section className="hero-section" id="top" aria-labelledby="hero-heading">
          <div className="hero-floor" aria-hidden="true" />
          <HeroSpatial />
          <div className="page-container hero-content">
            <div className="hero-eyebrow eyebrow">
              <span className="eyebrow-index">H / X</span>
              <span>Independent digital studio</span>
              <span className="eyebrow-divider" />
              <span>Design × engineering</span>
            </div>
            <h1 id="hero-heading" className="hero-title">
              {heroLines.map((line, lineIndex) => (
                <span className={`hero-line${lineIndex === heroLines.length - 1 ? " hero-line--dim" : ""}`} key={line.join(" ")}>
                  {line.map((word, wordIndex) => (
                    <span key={word}>
                      {wordIndex > 0 && " "}
                      <span className="hero-word">
                        <span style={{ "--i": lineIndex * 2 + wordIndex } as CSSProperties}>{word}</span>
                      </span>
                    </span>
                  ))}
                </span>
              ))}
            </h1>
            <div className="hero-lower">
              <p className="hero-description">
                We design and develop distinctive websites and SaaS products that turn ambitious ideas into reliable digital experiences.
              </p>
              <div className="hero-actions">
                <a className="button button--primary" href="#work" data-magnetic="0.25">Explore our work <ArrowDown size={16} strokeWidth={1.7} /></a>
                <ContactRevealButton href="#contact" label="Start a project" className="hero-contact-reveal" />
              </div>
            </div>
          </div>
          <div className="hero-bottom page-container">
            <span className="hero-bottom-tag">BUILT BEAUTIFULLY. ENGINEERED TO PERFORM.</span>
            <a className="scroll-cue" href="#work" aria-label="Scroll to selected work">
              <span className="scroll-cue-line" aria-hidden="true" />
              Scroll to explore
            </a>
            <span className="hero-bottom-index">01 — 06</span>
          </div>
        </section>

        <Marquee />

        <section className="work-section section-pad" id="work" aria-labelledby="work-heading">
          <div className="page-container">
            <div className="section-heading section-heading--split" data-reveal>
              <div>
                <p className="eyebrow"><span className="section-index">01</span> Selected projects</p>
                <h2 id="work-heading">Selected work<span className="heading-period">.</span></h2>
              </div>
              <p className="section-intro">Digital products and experiences designed to solve real problems.</p>
            </div>

            <div className="project-grid">
              <ProjectCard project={projects[0]} featured total={projects.length} />
              <ProjectCard project={projects[1]} total={projects.length} />
              <ProjectCard project={projects[2]} total={projects.length} />
            </div>
            <div className="work-outro" data-reveal>
              <span>THREE LIVE DIGITAL EXPERIENCES</span>
              <span>DESIGN / PRODUCT / ENGINEERING</span>
            </div>
          </div>
        </section>

        <section className="services-section section-pad" id="services" aria-labelledby="services-heading">
          <div className="page-container services-layout">
            <div className="services-intro" data-reveal>
              <p className="eyebrow"><span className="section-index">02</span> What we do</p>
              <h2 id="services-heading">What we bring<br />to the table<span className="heading-period">.</span></h2>
              <p>One considered team for the thinking, design and technology behind a stronger digital product.</p>
              <a className="text-link" href="#contact" data-magnetic="0.2">Talk through a project <ArrowUpRight size={15} strokeWidth={1.6} /></a>
            </div>
            <ServiceList />
          </div>
        </section>

        <section className="statement-section" aria-labelledby="statement-heading">
          <div className="statement-grid page-container">
            <div className="statement-kicker" data-reveal>
              <span className="eyebrow"><span className="section-index">03</span> The Helyx standard</span>
              <SignatureX className="signature-x--section" />
            </div>
            <div className="statement-copy">
              <ScrubText
                id="statement-heading"
                lines={[
                  { text: "Beautiful is the beginning." },
                  { text: "Reliability is the standard.", className: "scrub-line--dim" },
                ]}
              />
              <p data-reveal>Exceptional digital products must do more than look impressive. They should feel intuitive, work consistently and deliver real value.</p>
            </div>
            <div className="statement-foot" data-reveal><span>DESIGNED WITH INTENT</span><span>BUILT TO LAST</span></div>
          </div>
        </section>

        <section className="approach-section section-pad" id="approach" aria-labelledby="approach-heading">
          <div className="page-container">
            <div className="section-heading section-heading--split" data-reveal>
              <div>
                <p className="eyebrow"><span className="section-index">04</span> A clear way forward</p>
                <h2 id="approach-heading">From first idea to a<br />better digital product<span className="heading-period">.</span></h2>
              </div>
              <p className="section-intro">A collaborative process with enough structure to move forward and enough room to get the details right.</p>
            </div>
            <ProcessTimeline />
          </div>
        </section>

        <section className="about-section section-pad" id="about" aria-labelledby="about-heading">
          <div className="page-container about-layout">
            <div className="about-heading" data-reveal>
              <p className="eyebrow"><span className="section-index">05</span> About Helyx IT</p>
              <h2 id="about-heading">A small studio mindset.<br /><span>A high standard of execution.</span></h2>
            </div>
            <div className="about-copy" data-reveal data-reveal-delay="2">
              <p className="about-lead">Helyx IT combines thoughtful design and practical engineering to create digital experiences that are visually distinctive, technically dependable and built around real business needs.</p>
              <p>Design and engineering work together from the start. We communicate clearly, implement thoughtfully and choose technology to serve the product—not the other way around.</p>
              <ul className="about-principles" aria-label="Studio principles" data-stagger>
                <li data-reveal data-spotlight><span>01</span>Responsive by nature</li>
                <li data-reveal data-spotlight><span>02</span>Accessible by design</li>
                <li data-reveal data-spotlight><span>03</span>Maintainable over time</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="contact-section section-pad" id="contact" aria-labelledby="contact-heading">
          <div className="page-container contact-layout">
            <div className="contact-copy" data-reveal>
              <p className="eyebrow"><span className="section-index">06</span> Start a conversation</p>
              <h2 id="contact-heading">Have an idea<br />worth <span>building?</span></h2>
              <p>Tell us what you're imagining. Let's turn it into something useful, distinctive and beautifully executed.</p>
              <div className="contact-mark"><SignatureX className="signature-x--contact" /></div>
              <span className="contact-caption">GOOD WORK STARTS WITH A GOOD QUESTION.</span>
            </div>
            <InquiryForm />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-container footer-main">
          <div className="footer-brand-column">
            <a className="footer-logo-link" href="#top" aria-label="Helyx IT, return to top">
              <Image src="/helyx-it-logo.png" alt="Helyx IT" width={740} height={310} className="footer-logo" />
            </a>
            <p>Beautiful on the surface.<br />Intelligent underneath. Reliable by design.</p>
          </div>
          <div className="footer-links-column">
            <span className="eyebrow">Explore</span>
            <a href="#work">Selected work</a>
            <a href="#services">Services</a>
            <a href="#approach">Approach</a>
            <a href="#about">About Helyx</a>
          </div>
          <div className="footer-links-column footer-projects-column">
            <span className="eyebrow">On the web</span>
            {projects.map((project) => (
              <a key={project.id} href={project.url} target="_blank" rel="noopener noreferrer">{project.name} <ArrowUpRight size={12} /></a>
            ))}
            <a className="footer-contact-link" href="#contact">Start a project <ArrowUpRight size={12} /></a>
          </div>
          <div className="footer-signature" aria-hidden="true"><SignatureX className="signature-x--footer" /><span>H / X</span></div>
        </div>
        <div className="page-container footer-bottom">
          <span>© {currentYear} HELYX IT</span>
          <span>INDEPENDENT DIGITAL STUDIO</span>
          <a href="#top">Back to top <ArrowRight size={13} /></a>
        </div>
      </footer>
    </>
  );
}
