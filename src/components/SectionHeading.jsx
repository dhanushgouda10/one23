export function Eyebrow({ children }) {
  return <span className="eyebrow">{children}</span>;
}

export function SectionHeading({ eyebrow, title, align = "left" }) {
  return (
    <div className={`section-heading${align === "center" ? " center" : ""}`}>
      <div>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2>{title}</h2>
      </div>
    </div>
  );
}

export function PageHeader({ title, description, action }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </header>
  );
}
