const items = [
  "Websites",
  "SaaS products",
  "Interactive experiences",
  "Design systems",
  "Performance",
  "Accessibility",
  "Maintenance",
];

export function Marquee() {
  const row = (hidden: boolean) => (
    <ul className="marquee-row" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <li key={item}>
          <span>{item}</span>
          <i aria-hidden="true">×</i>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="marquee" role="presentation">
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
