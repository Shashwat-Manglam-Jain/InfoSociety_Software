import Link from "next/link";

const links = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/advertising-disclosure", label: "Advertising Disclosure" }
] as const;

export function SiteFooter() {
  return (
    <footer
      style={{
        marginTop: "48px",
        borderTop: "1px solid #cce2f4",
        background: "linear-gradient(180deg, #f5fbff 0%, #ebf5ff 100%)",
        padding: "24px 16px"
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <p style={{ margin: "0 0 10px", fontSize: "14px", fontWeight: 700, color: "#0f3554" }}>
          Infopath Banking Platform
        </p>
        <nav
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "10px",
            fontSize: "14px",
            color: "#0f3554"
          }}
        >
          {links.map((item) => (
            <Link key={item.href} href={item.href} style={{ fontWeight: 600 }}>
              {item.label}
            </Link>
          ))}
        </nav>
        <p style={{ margin: 0, fontSize: "12px", color: "#4d6a85" }}>
          Ads are shown for monetization. Please interact only when genuinely interested. Invalid traffic and forced clicks
          are not permitted.
        </p>
      </div>
    </footer>
  );
}
