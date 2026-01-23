import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Button from "../ui/Button";

const navLinks = [
  { label: "Features", href: "features" },
  { label: "How It Works", href: "how-it-works" },
  { label: "Pricing", href: "pricing" },
  { label: "Industries", href: "industries" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const sections = navLinks.map(link =>
      document.getElementById(link.href)
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-50% 0px -50% 0px",
      }
    );

    sections.forEach(section => section && observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const linkClass = (id) =>
    `relative pb-1 transition
     ${active === id
      ? "text-primary"
      : "text-muted hover:text-primary"}
    `;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4  flex items-center justify-between">
        <div className="">
          <a href="#hero" className="">
            <img
              src="/feEzy.png"
              width={80}
              alt="FeeCollect logo"
              className="cursor-pointer lg:w-[80px] w-[50px] "
            />
          </a>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={`#${link.href}`}
              className={linkClass(link.href)}
            >
              {link.label}

              {/* Underline */}
              <span
                className={`absolute left-0 -bottom-0.5 h-[2px] w-full bg-primary
                  transform transition-transform origin-left
                  ${active === link.href ? "scale-x-100" : "scale-x-0"}
                `}
              />
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="outline">
              Login
            </Button>
          <Button>Get Started</Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t">
          <nav className="flex flex-col px-6 py-4 gap-4 text-sm font-medium">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={`#${link.href}`}
                onClick={() => setOpen(false)}
                className={`py-1 ${active === link.href
                    ? "text-primary font-semibold"
                    : "text-muted"
                  }`}
              >
                {link.label}
              </a>
            ))}

            <hr />

            <Button variant="outline">
              Login
            </Button>
            <Button className="w-full">Get Started</Button>
          </nav>
        </div>
      )}
    </header>
  );
}
