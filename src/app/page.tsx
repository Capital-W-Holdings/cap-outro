import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Target, Zap, TrendingUp, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-neutral-900">Cap Outro</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary">Get started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-neutral-900 mb-6">
            Stop cold calling investors.
            <br />
            <span className="text-neutral-600">Start closing rounds.</span>
          </h1>
          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
            AI-powered investor outreach that transforms your messy investor lists into
            sequenced, personalized campaigns with real-time engagement tracking.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Start free trial
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg">
                See how it works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 border-t border-neutral-200 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-neutral-900 text-center mb-16">
            Everything you need to close your round
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Target className="w-6 h-6" />}
              title="Investor-Deal Fit Scoring"
              description="AI matches your raise to investor thesis, check size, and stage preferences. No more wasted outreach."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Warm Path Detection"
              description="Find the shortest path to a warm intro through your network. Stop going in cold."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Sequence Orchestration"
              description="Multi-touch campaigns with optimal timing. Automated follow-ups that feel personal."
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Conversion Intelligence"
              description="Track opened → replied → meeting → committed in real-time. Know exactly where you stand."
            />
            <FeatureCard
              icon={<Target className="w-6 h-6" />}
              title="Pipeline Management"
              description="Kanban view of your raise. Move investors through stages with one click."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="AI Personalization"
              description="Every email tailored to the investor. Increase response rates by 3x."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 border-t border-neutral-200">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Ready to transform your raise?
          </h2>
          <p className="text-neutral-600 mb-8">
            Join hundreds of founders who have used Cap Outro to close their rounds faster.
          </p>
          <Link href="/signup">
            <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Get started for free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-8 px-4 bg-neutral-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-neutral-900 flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-neutral-600">© 2025 Cap Outro</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-neutral-600">
            <Link href="/privacy" className="hover:text-neutral-900 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-neutral-900 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 hover:border-neutral-300 hover:shadow-md transition-all">
      <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-900 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-600">{description}</p>
    </div>
  );
}
