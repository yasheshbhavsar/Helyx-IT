"use client";

import { ArrowUpRight, Check, Copy } from "lucide-react";
import { type FocusEvent, type FormEvent, useRef, useState } from "react";

type FieldName = "name" | "email" | "projectType" | "details";
type FormErrors = Partial<Record<FieldName, string>>;
type CopyState = "idle" | "copying" | "copied" | "error";

type InquiryDraft = {
  subject: string;
  body: string;
};

const emailAddress = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || undefined;

const projectTypes = [
  "Website design & development",
  "SaaS or digital product",
  "Interactive web experience",
  "Optimization & maintenance",
  "Something else",
];

const DETAILS_SOFT_LIMIT = 800;

function validateField(name: FieldName, value: string): string | undefined {
  const trimmed = value.trim();
  if (name === "name" && !trimmed) return "Add your name so we know how to address you.";
  if (name === "email") {
    if (!trimmed) return "Add your work email address.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "Enter a valid email address.";
  }
  if (name === "projectType" && !trimmed) return "Choose the kind of project you have in mind.";
  if (name === "details" && !trimmed) return "Add a few details about what you would like to build.";
  return undefined;
}

export function InquiryForm() {
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState("");
  const [draft, setDraft] = useState<InquiryDraft | null>(null);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const draftFieldRef = useRef<HTMLTextAreaElement>(null);
  const [detailsLength, setDetailsLength] = useState(0);

  const setFieldError = (name: FieldName, message: string | undefined) =>
    setErrors((current) => {
      if (current[name] === message) return current;
      const next = { ...current };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });

  const handleBlur = (event: FocusEvent<HTMLFormElement>) => {
    const target = event.target as unknown as HTMLInputElement | HTMLTextAreaElement;
    const name = target.name as FieldName;
    if (!["name", "email", "details"].includes(name)) return;
    setFieldError(name, validateField(name, target.value));
  };

  const handleInput = (event: FormEvent<HTMLFormElement>) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const name = target.name as FieldName;
    if (name === "details") setDetailsLength(target.value.length);
    if (name === "projectType" || errors[name]) setFieldError(name, validateField(name, target.value));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const projectType = String(formData.get("projectType") ?? "").trim();
    const details = String(formData.get("details") ?? "").trim();
    const nextErrors: FormErrors = {};

    (["name", "email", "projectType", "details"] as FieldName[]).forEach((field) => {
      const value = { name, email, projectType, details }[field];
      const message = validateField(field, value);
      if (message) nextErrors[field] = message;
    });

    setErrors(nextErrors);
    setStatus("");
    setDraft(null);
    setCopyState("idle");

    if (Object.keys(nextErrors).length > 0) {
      const firstInvalid = Object.keys(nextErrors)[0] as FieldName;
      window.requestAnimationFrame(() => {
        form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      });
      return;
    }

    const subject = `Project inquiry — ${projectType}`;
    const body = [
      `Name: ${name}`,
      `Work email: ${email}`,
      `Company / brand: ${String(formData.get("company") ?? "Not provided").trim() || "Not provided"}`,
      `Project type: ${projectType}`,
      `Budget range: ${String(formData.get("budget") ?? "Not provided") || "Not provided"}`,
      "",
      "Project details:",
      details,
    ].join("\n");

    if (emailAddress) {
      const draftUrl = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setStatus("Opening an email draft to the configured inbox. Review it and press send in your email app.");
      window.location.href = draftUrl;
      return;
    }

    setDraft({ subject, body });
  };

  const copyDraft = async () => {
    if (!draft) return;
    setCopyState("copying");
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard access is unavailable.");
      await navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.body}`);
      setCopyState("copied");
    } catch {
      setCopyState("error");
      window.requestAnimationFrame(() => {
        draftFieldRef.current?.focus();
        draftFieldRef.current?.select();
      });
    }
  };

  const copyMessage = {
    idle: "",
    copying: "Copying draft…",
    copied: "Draft copied. Paste it into an email, address it to Helyx IT's confirmed inbox, and send it.",
    error: "Clipboard access failed. The draft is selected above so you can copy it manually.",
  }[copyState];

  return (
    <div className="inquiry-form-wrap" data-spotlight>
      <form className="inquiry-form" onSubmit={handleSubmit} onBlur={handleBlur} onInput={handleInput} noValidate>
        <fieldset>
          <legend className="visually-hidden">Project inquiry details</legend>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="inquiry-name">Your name <span>*</span></label>
              <input
                id="inquiry-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Name"
                required
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "inquiry-name-error" : undefined}
              />
              {errors.name && <p className="field-error" id="inquiry-name-error">{errors.name}</p>}
            </div>
            <div className="form-field">
              <label htmlFor="inquiry-email">Work email <span>*</span></label>
              <input
                id="inquiry-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@company.com"
                required
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "inquiry-email-error" : undefined}
              />
              {errors.email && <p className="field-error" id="inquiry-email-error">{errors.email}</p>}
            </div>
            <div className="form-field">
              <label htmlFor="inquiry-company">Company or brand <span className="optional">Optional</span></label>
              <input id="inquiry-company" name="company" type="text" autoComplete="organization" placeholder="Your company" />
            </div>
            <div className="form-field form-field--full">
              <span className="field-label" id="inquiry-project-label">Project type <span>*</span></span>
              <div
                className="chip-group"
                role="radiogroup"
                aria-labelledby="inquiry-project-label"
                aria-invalid={Boolean(errors.projectType)}
                aria-describedby={errors.projectType ? "inquiry-project-error" : undefined}
              >
                {projectTypes.map((type) => (
                  <label className="chip" key={type}>
                    <input type="radio" name="projectType" value={type} />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
              {errors.projectType && <p className="field-error" id="inquiry-project-error">{errors.projectType}</p>}
            </div>
            <div className="form-field form-field--full">
              <label htmlFor="inquiry-budget">Budget range <span className="optional">Optional</span></label>
              <input id="inquiry-budget" name="budget" type="text" autoComplete="off" placeholder="Share a range and currency, if known" />
            </div>
            <div className="form-field form-field--full">
              <label htmlFor="inquiry-details">A little about your project <span>*</span></label>
              <textarea
                id="inquiry-details"
                name="details"
                rows={4}
                placeholder="What are you looking to make, and what would make it successful?"
                required
                aria-invalid={Boolean(errors.details)}
                aria-describedby={errors.details ? "inquiry-details-error" : undefined}
              />
              <div className="field-foot">
                {errors.details ? <p className="field-error" id="inquiry-details-error">{errors.details}</p> : <span />}
                <span className={`field-count${detailsLength > DETAILS_SOFT_LIMIT ? " is-over" : ""}`} aria-hidden="true">
                  {detailsLength} / {DETAILS_SOFT_LIMIT}
                </span>
              </div>
            </div>
          </div>
        </fieldset>
        <div className="form-submit-row">
          <button className="button button--primary form-submit" type="submit" data-magnetic="0.2">
            Prepare project inquiry <ArrowUpRight size={17} strokeWidth={1.7} />
          </button>
          <p className="form-note">
            {emailAddress
              ? "Your email app opens a draft to the configured inbox. Nothing is sent until you press send."
              : "No studio inbox is configured. Your validated details will be prepared as a copyable draft, not sent."}
          </p>
        </div>
        <p className="form-status" role="status" aria-live="polite">{status}</p>
      </form>
      {draft && (
        <div className="draft-panel" aria-labelledby="draft-heading">
          <div className="draft-heading-row">
            <span className="eyebrow">Email draft</span>
            <span className="draft-status-mark">NOT SENT</span>
          </div>
          <h3 id="draft-heading">Your inquiry is ready to copy.</h3>
          <p>There is no verified Helyx IT inbox configured here. Address this draft to the studio's confirmed email before sending.</p>
          <label className="visually-hidden" htmlFor="prepared-inquiry">Prepared project inquiry</label>
          <textarea
            className="draft-text"
            id="prepared-inquiry"
            ref={draftFieldRef}
            readOnly
            value={`Subject: ${draft.subject}\n\n${draft.body}`}
            onFocus={(event) => event.currentTarget.select()}
          />
          <div className="draft-action-row">
            <button className="button button--primary draft-copy-button" data-magnetic="0.2" type="button" onClick={copyDraft} disabled={copyState === "copying"}>
              {copyState === "copying" ? "Copying…" : copyState === "copied" ? "Copied" : "Copy inquiry draft"}
              {copyState === "copied" ? <Check size={16} /> : <Copy size={15} />}
            </button>
            <p className="draft-copy-status" id="draft-copy-status" role="status" aria-live="polite">{copyMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
