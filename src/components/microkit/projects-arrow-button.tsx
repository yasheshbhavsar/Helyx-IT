import { ArrowRight } from "lucide-react";

type ProjectsArrowButtonProps = {
  href: string;
  label: string;
  ariaLabel: string;
  external?: boolean;
};

export function ProjectsArrowButton({ href, label, ariaLabel, external = false }: ProjectsArrowButtonProps) {
  return (
    <a
      className="microkit-project-link group"
      href={href}
      aria-label={ariaLabel}
      data-magnetic="0.25"
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      <span>{label}</span>
      <span className="microkit-project-arrow" aria-hidden="true">
        <ArrowRight className="microkit-project-arrow-current" size={17} strokeWidth={1.8} />
        <ArrowRight className="microkit-project-arrow-incoming" size={17} strokeWidth={1.8} />
      </span>
    </a>
  );
}
