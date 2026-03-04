import Link from 'next/link';
import Image from 'next/image';
import {
  Server,
  Puzzle,
  Calendar,
  FileCode,
  Terminal,
  FileText,
  ArrowRight,
  Lightbulb,
  Zap,
  Users,
} from 'lucide-react';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Layered background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/15 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,125,230,0.15),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(24,160,153,0.08),transparent)]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-50" />

        {/* Glow orbs */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-1/4 w-56 h-56 bg-accent/10 rounded-full blur-[80px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Hero Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-sm font-medium mb-6">
                <Zap size={14} />
                Path of Titans Community Hub
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Manage Your Server{' '}
                <span className="gradient-text">
                  Like a Pro
                </span>
              </h1>
              <p className="text-text-secondary text-lg sm:text-xl max-w-2xl mb-10 leading-relaxed">
                Post your server, share events, and use powerful configuration tools. The central
                hub for Path of Titans server owners and their communities.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link href="/community" className="btn-primary flex items-center gap-2 text-base px-7 py-3">
                  Browse Servers <ArrowRight size={18} />
                </Link>
                <Link href="/tools/mod-manager" className="btn-outline flex items-center gap-2 text-base px-7 py-3">
                  Open Tools
                </Link>
              </div>

              {/* Quick stats */}
              <div className="flex items-center gap-8 mt-10 justify-center lg:justify-start">
                <div className="text-center">
                  <div className="text-2xl font-bold text-text-primary">4</div>
                  <div className="text-xs text-text-secondary mt-0.5">Config Tools</div>
                </div>
                <div className="w-px h-8 bg-divider" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-text-primary">200+</div>
                  <div className="text-xs text-text-secondary mt-0.5">Settings</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="flex-shrink-0 relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/10 to-secondary/20 rounded-2xl blur-2xl opacity-60" />
              <Image
                src="/images/home1.png"
                alt="Path of Titans"
                width={420}
                height={420}
                className="relative rounded-2xl drop-shadow-2xl animate-float border border-white/5"
                priority
              />
            </div>
          </div>
        </div>

        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Features Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Powerful tools and a thriving community for Path of Titans server management.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Server size={24} />}
            title="Community Servers"
            description="Post your server for the community to find. Browse and discover new servers to play on."
            href="/community"
            color="primary"
          />
          <FeatureCard
            icon={<Calendar size={24} />}
            title="Events"
            description="Share and discover community events. Tournaments, roleplay nights, and more."
            href="/events"
            color="secondary"
          />
          <FeatureCard
            icon={<Lightbulb size={24} />}
            title="Suggestions"
            description="Vote on community suggestions for mod maps and features. Shape the future together."
            href="/suggestions"
            color="accent"
          />
        </div>
      </section>

      {/* Tools Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-background-paper" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,81,194,0.05),transparent)]" />
        <div className="absolute inset-0 bg-dots-pattern opacity-30" />
        <div className="gradient-line-accent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent-light text-sm font-medium mb-4">
              <Zap size={14} />
              Server Configuration
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              Configuration Tools
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Generate server configuration files with our easy-to-use tools. No more manual
              editing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ToolCard
              icon={<Puzzle size={22} />}
              title="Mod Manager"
              description="Browse, search, and select mods for your server. Generate GameUserSettings.ini with one click."
              href="/tools/mod-manager"
              accentColor="from-primary to-accent"
            />
            <ToolCard
              icon={<FileCode size={22} />}
              title="Game.ini Generator"
              description="Configure 200+ server settings across gameplay, quests, waystones, and more."
              href="/tools/game-ini"
              accentColor="from-accent to-secondary"
            />
            <ToolCard
              icon={<Terminal size={22} />}
              title="Commands.ini Generator"
              description="Create server roles with granular permissions, colors, and player assignments."
              href="/tools/commands-ini"
              accentColor="from-secondary to-primary"
            />
            <ToolCard
              icon={<FileText size={22} />}
              title="Rules/MOTD Generator"
              description="Build formatted server rules and message of the day with rich text styling."
              href="/tools/rules-motd"
              accentColor="from-primary-light to-secondary-light"
            />
          </div>
        </div>
        <div className="gradient-line-accent" />
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative overflow-hidden rounded-2xl">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/10 to-secondary/20" />
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-accent to-secondary" />

          {/* Glow orbs */}
          <div className="absolute top-0 left-1/4 w-48 h-48 bg-primary/15 rounded-full blur-[60px]" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-accent/15 rounded-full blur-[60px]" />

          <div className="relative border border-primary/20 rounded-2xl p-8 sm:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary-light text-sm font-medium mb-5">
              <Users size={14} />
              Join the Community
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-8">
              Join the community, post your server, and start using our tools today. Sign in with
              Discord to unlock all features.
            </p>
            <Link href="/community" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3">
              Explore Servers <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  href,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  color: 'primary' | 'secondary' | 'accent';
}) {
  const colorMap = {
    primary: {
      icon: 'bg-primary/10 text-primary-light group-hover:bg-primary/20',
      border: 'group-hover:border-primary/40',
      glow: 'group-hover:shadow-[0_8px_30px_rgba(10,81,194,0.15)]',
    },
    secondary: {
      icon: 'bg-secondary/10 text-secondary-light group-hover:bg-secondary/20',
      border: 'group-hover:border-secondary/40',
      glow: 'group-hover:shadow-[0_8px_30px_rgba(43,197,107,0.15)]',
    },
    accent: {
      icon: 'bg-accent/10 text-accent-light group-hover:bg-accent/20',
      border: 'group-hover:border-accent/40',
      glow: 'group-hover:shadow-[0_8px_30px_rgba(24,160,153,0.15)]',
    },
  };

  const c = colorMap[color];

  return (
    <Link
      href={href}
      className={`group bg-background-paper border border-divider rounded-card p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 ${c.border} ${c.glow}`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${c.icon}`}>
        {icon}
      </div>
      <h3 className="font-heading font-semibold text-lg text-text-primary mb-2 group-hover:text-primary-light transition-colors">
        {title}
      </h3>
      <p className="text-text-secondary text-sm leading-relaxed flex-1">{description}</p>
      <span className="mt-4 text-sm font-medium text-primary-light flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1">
        Explore <ArrowRight size={14} />
      </span>
    </Link>
  );
}

function ToolCard({
  icon,
  title,
  description,
  href,
  accentColor,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  accentColor: string;
}) {
  return (
    <Link
      href={href}
      className="group relative bg-background-paper border border-divider rounded-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-card-hover"
    >
      {/* Top gradient accent */}
      <div className={`h-[2px] bg-gradient-to-r ${accentColor} opacity-60 group-hover:opacity-100 transition-opacity`} />

      <div className="p-6 flex items-start gap-4">
        <div className="p-3 rounded-xl bg-primary/10 text-primary-light shrink-0 group-hover:bg-primary/20 transition-all duration-200 group-hover:shadow-glow-primary/20">
          {icon}
        </div>
        <div>
          <h3 className="font-heading font-semibold text-text-primary mb-1.5 group-hover:text-primary-light transition-colors">
            {title}
          </h3>
          <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
        </div>
        <ArrowRight size={18} className="shrink-0 text-text-secondary/0 group-hover:text-primary-light transition-all duration-300 mt-1" />
      </div>
    </Link>
  );
}
