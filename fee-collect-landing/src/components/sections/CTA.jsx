import Button from "../ui/Button";

export default function CTA() {
  return (
    <section className="py-20 px-6 bg-primary">
      <div className="max-w-5xl mx-auto text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Start Managing Fees the Smart Way
        </h2>

        <p className="text-white/80 max-w-2xl mx-auto mb-8">
          Join gyms, institutes, hotels, and academies who trust our platform
          to manage members, subscriptions, and payments effortlessly.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          {/* Visible on dark background */}
          <Button variant="light">Start Free Today</Button>
          <Button variant="outlineLight">Request a Demo</Button>
        </div>
      </div>
    </section>
  );
}
