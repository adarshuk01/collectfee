import { Dumbbell, GraduationCap, Hotel, School } from "lucide-react";

const users = [
  {
    icon: Dumbbell,
    title: "Gyms & Fitness Centers",
    desc: "Manage memberships, monthly renewals, and trainer batches easily.",
  },
  {
    icon: GraduationCap,
    title: "Institutes & Coaching",
    desc: "Track student fees, batch-wise payments, and reports.",
  },
  {
    icon: Hotel,
    title: "Hotels & Hostels",
    desc: "Handle room-wise payments, renewals, and records efficiently.",
  },
  {
    icon: School,
    title: "Academies & Training Centers",
    desc: "Simplify fee collection and performance reporting.",
  },
];

export default function WhoItsFor() {
  return (
    <section id="industries" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Who Is This <span className="text-primary">For?</span>
          </h2>
          <p className="text-muted max-w-xl mx-auto">
            Built for businesses that manage recurring fees.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {users.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="bg-card p-6 rounded-xl shadow-soft text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-primary/10 rounded-lg">
                  <Icon className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
