import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-bold text-black tracking-tight">
                CAP OUTRO
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium text-white bg-black px-4 py-2 hover:bg-gray-800 transition-colors"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono text-sm text-gray-500 mb-6 tracking-wide">
            ////// INVESTOR OUTREACH PLATFORM
          </p>
          <h1 className="font-mono text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-8 leading-tight">
            Stop cold calling investors.
            <br />
            Start closing rounds.
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl leading-relaxed">
            AI-powered investor outreach that transforms your messy investor lists into
            sequenced, personalized campaigns with real-time engagement tracking.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-white bg-black px-6 py-3 font-medium hover:bg-gray-800 transition-colors"
            >
              Start free trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 text-black border border-black px-6 py-3 font-medium hover:bg-black hover:text-white transition-colors"
            >
              See how it works
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard label="Investors" value="4,700+" />
            <StatCard label="Response Rate" value="3x" />
            <StatCard label="Time Saved" value="80%" />
            <StatCard label="Rounds Closed" value="$50M+" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <p className="font-mono text-sm text-gray-500 mb-4 tracking-wide">
            ////// FEATURES
          </p>
          <h2 className="font-mono text-3xl font-bold text-black mb-16">
            Everything you need to close your round
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              marker="01"
              title="Investor-Deal Fit Scoring"
              description="AI matches your raise to investor thesis, check size, and stage preferences. No more wasted outreach."
            />
            <FeatureCard
              marker="02"
              title="Warm Path Detection"
              description="Find the shortest path to a warm intro through your network. Stop going in cold."
            />
            <FeatureCard
              marker="03"
              title="Sequence Orchestration"
              description="Multi-touch campaigns with optimal timing. Automated follow-ups that feel personal."
            />
            <FeatureCard
              marker="04"
              title="Conversion Intelligence"
              description="Track opened → replied → meeting → committed in real-time. Know exactly where you stand."
            />
            <FeatureCard
              marker="05"
              title="Pipeline Management"
              description="Kanban view of your raise. Move investors through stages with one click."
            />
            <FeatureCard
              marker="06"
              title="AI Personalization"
              description="Every email tailored to the investor. Increase response rates by 3x."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-black text-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-mono text-sm text-gray-400 mb-4 tracking-wide">
            ////// GET STARTED
          </p>
          <h2 className="font-mono text-3xl font-bold mb-6">
            Ready to transform your raise?
          </h2>
          <p className="text-gray-400 mb-10 text-lg">
            Join hundreds of founders who have used Cap Outro to close their rounds faster.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 font-medium hover:bg-gray-100 transition-colors"
          >
            Get started for free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-black">CAP OUTRO</span>
            <span className="text-sm text-gray-400">© 2025</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-black transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-black transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="font-mono text-3xl font-bold text-black mb-1">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function FeatureCard({
  marker,
  title,
  description,
}: {
  marker: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border border-gray-200 p-6 hover:border-gray-400 transition-colors bg-white">
      <p className="font-mono text-xs text-gray-400 mb-4">{marker}</p>
      <h3 className="font-mono text-lg font-semibold text-black mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
