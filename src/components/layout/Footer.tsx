import Link from 'next/link';
import Image from 'next/image';
import {
  Puzzle,
  FileCode,
  Terminal,
  FileText,
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto relative">
      {/* Top gradient line */}
      <div className="gradient-line-accent" />

      <div className="bg-background-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <Image src="/images/logo.png" alt="TitanTech" width={32} height={32} style={{ height: 'auto' }} />
                <span className="font-heading font-bold text-lg">
                  <span className="text-text-primary">Titan</span>
                  <span className="gradient-text-primary">Tech</span>
                </span>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed mb-5">
                The community hub for Path of Titans server owners. Browse servers, share events, and
                use powerful configuration tools.
              </p>
              {/* Social Icons */}
              <div className="flex items-center gap-2">
                <a
                  href="https://discord.gg/titantech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-surface/50 text-text-secondary hover:text-white hover:bg-[#5865F2] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_15px_rgba(88,101,242,0.3)]"
                  aria-label="Discord"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                  </svg>
                </a>
                <a
                  href="https://twitter.com/titantech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-surface/50 text-text-secondary hover:text-white hover:bg-text-primary/20 transition-all duration-200 hover:scale-105"
                  aria-label="Twitter / X"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Community Links */}
            <div>
              <h3 className="font-heading font-semibold text-text-primary text-sm uppercase tracking-wider mb-4">
                Community
              </h3>
              <ul className="space-y-2.5">
                <FooterLink href="/community">Browse Servers</FooterLink>
                <FooterLink href="/community/servers/submit">Submit Server</FooterLink>
                <FooterLink href="/events">Events</FooterLink>
                <FooterLink href="/suggestions">Suggestions</FooterLink>
              </ul>
            </div>

            {/* Tools Links */}
            <div>
              <h3 className="font-heading font-semibold text-text-primary text-sm uppercase tracking-wider mb-4">
                Tools
              </h3>
              <ul className="space-y-2.5">
                <FooterLink href="/tools/mod-manager" icon={<Puzzle size={14} />}>Mod Manager</FooterLink>
                <FooterLink href="/tools/game-ini" icon={<FileCode size={14} />}>Game.ini Generator</FooterLink>
                <FooterLink href="/tools/commands-ini" icon={<Terminal size={14} />}>Commands.ini Generator</FooterLink>
                <FooterLink href="/tools/rules-motd" icon={<FileText size={14} />}>Rules/MOTD Generator</FooterLink>
              </ul>
            </div>

            {/* Quick Info */}
            <div>
              <h3 className="font-heading font-semibold text-text-primary text-sm uppercase tracking-wider mb-4">
                About
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-4">
                Built for the Path of Titans community. Generate server configs, find servers, and connect with other server owners.
              </p>
              <Link
                href="/community"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-light hover:text-primary transition-colors"
              >
                Get Started
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="gradient-line mt-10 mb-6" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-text-secondary/60 text-xs">
              &copy; {new Date().getFullYear()} TitanTech. All rights reserved.
            </p>
            <p className="text-text-secondary/40 text-xs">
              Not affiliated with Alderon Games
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, icon, children }: { href: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary-light transition-colors duration-200"
      >
        {icon}
        {children}
      </Link>
    </li>
  );
}
