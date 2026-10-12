import { ArrowRight } from "lucide-react";

type ContactRevealButtonProps = {
  href: string;
  label?: string;
  className?: string;
};

export function ContactRevealButton({ href, label = "Get in touch", className = "" }: ContactRevealButtonProps) {
  return (
    <a
      className={`microkit-contact-reveal group ${className}`.trim()}
      href={href}
      data-magnetic="0.25"
    >
      <span className="microkit-contact-fill" aria-hidden="true" />
      <span className="microkit-contact-icon" aria-hidden="true">
        <ArrowRight size={17} strokeWidth={1.8} />
      </span>
      <span className="microkit-contact-label">{label}</span>
    </a>
  );
}
