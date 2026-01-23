import Button from "../ui/Button";

const plans = [
  {
    name: "Free",
    price: "₹0",
    desc: "Perfect to get started",
    features: [
      "Up to 50 members",
      "Basic fee tracking",
      "Manual reports",
    ],
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹999 / month",
    desc: "Best for growing businesses",
    features: [
      "Unlimited members",
      "Auto renewals",
      "Excel import & export",
      "Advanced reports",
    ],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For large organizations",
    features: [
      "Multi-branch support",
      "Custom integrations",
      "Priority support",
      "Dedicated manager",
    ],
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-bg py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple <span className="text-primary">Pricing</span>
          </h2>
          <p className="text-muted max-w-xl mx-auto">
            Choose a plan that fits your business size.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`rounded-xl p-8 shadow-soft bg-card border ${
                plan.highlight
                  ? "border-primary scale-105"
                  : "border-transparent"
              }`}
            >
              <h3 className="text-xl font-semibold mb-2">
                {plan.name}
              </h3>
              <p className="text-muted text-sm mb-4">
                {plan.desc}
              </p>

              <div className="text-3xl font-bold mb-6">
                {plan.price}
              </div>

              <ul className="space-y-3 text-sm mb-8">
                {plan.features.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    ✅ {f}
                  </li>
                ))}
              </ul>

              <Button variant={plan.highlight ? "primary" : "outline"}>
                Get Started
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
