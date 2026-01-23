export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 px-6">
      <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-4">
        {/* Brand */}
        <div>
          <h3 className="text-xl font-bold text-white mb-3">
            FeeCollect
          </h3>
          <p className="text-sm text-slate-400">
            Smart fee and subscription management for modern businesses.
          </p>
        </div>

        {/* Product */}
        <div>
          <h4 className="font-semibold text-white mb-3">Product</h4>
          <ul className="space-y-2 text-sm">
            <li>Features</li>
            <li>Pricing</li>
            <li>Security</li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-semibold text-white mb-3">Company</h4>
          <ul className="space-y-2 text-sm">
            <li>About</li>
            <li>Contact</li>
            <li>Support</li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-semibold text-white mb-3">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li>Privacy Policy</li>
            <li>Terms & Conditions</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 mt-10 pt-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} FeeCollect. All rights reserved.
      </div>
    </footer>
  );
}
