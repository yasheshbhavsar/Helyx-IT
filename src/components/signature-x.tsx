type SignatureXProps = {
  className?: string;
};

export function SignatureX({ className = "" }: SignatureXProps) {
  return <span className={`signature-x ${className}`.trim()} aria-hidden="true"><i /></span>;
}
