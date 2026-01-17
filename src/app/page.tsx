import Link from 'next/link';
import { ArrowRight, Zap, Target, GitBranch, BarChart3, Kanban, Sparkles, Play } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white text-sm font-bold">CO</span>
              </div>
              <span className="text-xl font-semibold text-gray-900 tracking-tight">
                Cap Outro
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors px-4 py-2"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium text-white bg-gray-900 px-5 py-2.5 rounded-full hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-white to-white" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-violet-100/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-20 left-0 w-[400px] h-[400px] bg-gradient-to-br from-blue-100/40 to-transparent rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-8">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm font-medium text-blue-700">AI-Powered Investor Outreach</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-[1.05] tracking-tight text-gray-900">
            Close your round
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              at warp speed
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Transform investor outreach with AI-powered personalization,
            automated sequences, and real-time engagement tracking.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all"
            >
              Start free trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#demo"
              className="inline-flex items-center gap-2 text-gray-700 bg-white border border-gray-200 px-8 py-4 rounded-full font-semibold text-lg hover:border-gray-300 hover:shadow-lg transition-all"
            >
              <Play className="w-5 h-5 text-violet-600" />
              Watch demo
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-8 rounded-3xl bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-100">
            <StatCard value="4,700+" label="Investors" color="blue" />
            <StatCard value="3x" label="Response rate" color="violet" />
            <StatCard value="80%" label="Time saved" color="purple" />
            <StatCard value="$50M+" label="Raised" color="emerald" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-600 text-sm font-semibold tracking-wider uppercase mb-4">Features</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Built for velocity
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to close your round faster than ever.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Target className="w-6 h-6" />}
              title="Investor-Deal Fit"
              description="AI matches your raise to investor thesis, check size, and stage preferences."
              color="blue"
            />
            <FeatureCard
              icon={<GitBranch className="w-6 h-6" />}
              title="Warm Intros"
              description="Find the shortest path to a warm intro through your network."
              color="violet"
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Auto Sequences"
              description="Multi-touch campaigns with optimal timing and automated follow-ups."
              color="amber"
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Live Tracking"
              description="Track opens, replies, and meetings in real-time."
              color="emerald"
            />
            <FeatureCard
              icon={<Kanban className="w-6 h-6" />}
              title="Pipeline View"
              description="Kanban board to track investors through every stage."
              color="purple"
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="AI Personalization"
              description="Every email tailored to the investor automatically."
              color="rose"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="demo" className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-violet-600 text-sm font-semibold tracking-wider uppercase mb-4">How It Works</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
              Three steps to funded
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="01"
              title="Import investors"
              description="Upload CSV or connect CRM. We enrich with thesis, check size, and portfolio data."
              color="blue"
            />
            <StepCard
              number="02"
              title="Build sequences"
              description="Create personalized email sequences with AI. Set timing and track engagement."
              color="violet"
            />
            <StepCard
              number="03"
              title="Close your round"
              description="Monitor responses, book meetings, and move investors through your pipeline."
              color="emerald"
            />
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600 p-10 sm:p-16 text-white overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

            <div className="relative">
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-300 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-2xl sm:text-3xl font-medium mb-8 leading-relaxed">
                "Cap Outro helped us close our $4M seed in 6 weeks. Response rate went from 5% to 18%."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold">
                  JM
                </div>
                <div>
                  <p className="font-semibold">Jessica Martinez</p>
                  <p className="text-white/70">CEO, TechFlow (YC W24)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-violet-600/20 to-purple-600/20" />

        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to accelerate?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Join 500+ founders who closed faster with Cap Outro.
          </p>
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all shadow-xl"
          >
            Get started free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="mt-6 text-sm text-gray-500">
            No credit card required • Free 14-day trial
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">CO</span>
              </div>
              <span className="font-semibold text-gray-900">Cap Outro</span>
              <span className="text-sm text-gray-400">© 2025</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-gray-900 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-gray-900 transition-colors">
                Terms
              </Link>
              <Link href="/support" className="hover:text-gray-900 transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const colorVariants = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
};

function StatCard({ value, label, color }: { value: string; label: string; color: keyof typeof colorVariants }) {
  const colors = colorVariants[color];
  return (
    <div className="text-center">
      <p className={`text-3xl sm:text-4xl font-bold ${colors.text} mb-1`}>{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: keyof typeof colorVariants;
}) {
  const colors = colorVariants[color];

  return (
    <div className="group rounded-2xl p-6 bg-white border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className={`w-12 h-12 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
  color,
}: {
  number: string;
  title: string;
  description: string;
  color: keyof typeof colorVariants;
}) {
  const colors = colorVariants[color];

  return (
    <div className="relative">
      <div className={`text-6xl font-bold ${colors.text} opacity-20 mb-4`}>
        {number}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
