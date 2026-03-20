'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signIn, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import {
  Menu,
  X,
  ChevronDown,
  Home,
  Users,
  Calendar,
  Wrench,
  Lightbulb,
  LogIn,
  LogOut,
  LayoutDashboard,
  Shield,
  User,
  Puzzle,
  FileCode,
  Terminal,
  FileText,
  TrendingUp,
  Bot,
  ImageIcon,
} from 'lucide-react';

const toolsDropdown = [
  { label: 'Mod Manager', href: '/tools/mod-manager', icon: Puzzle, desc: 'Browse & select server mods' },
  { label: 'Game.ini Generator', href: '/tools/game-ini', icon: FileCode, desc: '200+ server settings' },
  { label: 'Commands.ini Generator', href: '/tools/commands-ini', icon: Terminal, desc: 'Roles & permissions' },
  { label: 'Rules/MOTD Generator', href: '/tools/rules-motd', icon: FileText, desc: 'Formatted server rules' },
  { label: 'Curve Overrides', href: '/tools/curve-overrides', icon: TrendingUp, desc: 'Customize creature stats' },
];

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);
  const mobileToolsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        toolsRef.current && !toolsRef.current.contains(target) &&
        (!mobileToolsRef.current || !mobileToolsRef.current.contains(target))
      ) {
        setToolsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const isToolsActive = toolsDropdown.some((t) => pathname.startsWith(t.href));

  return (
    <header className="sticky top-0 z-50">
      {/* Gradient accent line at the very top */}
      <div className="gradient-line-accent" />

      <nav className="bg-background-paper/95 backdrop-blur-xl border-b border-divider/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group" onClick={closeMobile}>
              <div className="relative">
                <Image src="/images/logo.png" alt="TitanTech" width={36} height={36} className="relative z-10" style={{ height: 'auto' }} />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="font-heading font-bold text-xl">
                <span className="text-text-primary">Titan</span>
                <span className="gradient-text-primary">Tech</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-0.5">
              <NavLink href="/" icon={<Home size={16} />} active={isActive('/')}>
                Home
              </NavLink>
              <NavLink href="/community" icon={<Users size={16} />} active={isActive('/community')}>
                Community
              </NavLink>
              <NavLink href="/events" icon={<Calendar size={16} />} active={isActive('/events')}>
                Events
              </NavLink>

              {/* Tools Dropdown */}
              <div ref={toolsRef} className="relative">
                <button
                  onClick={() => setToolsOpen(!toolsOpen)}
                  className={`nav-link ${isToolsActive ? 'nav-link-active' : ''}`}
                >
                  <Wrench size={16} />
                  Tools
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {toolsOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-background-paper border border-divider/70 rounded-card shadow-card overflow-hidden animate-fade-in">
                    <div className="gradient-line-accent" />
                    <div className="p-1.5">
                      {toolsDropdown.map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <Link
                            key={tool.href}
                            href={tool.href}
                            onClick={() => setToolsOpen(false)}
                            className="flex items-start gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-primary/8 transition-all duration-150 group/item"
                          >
                            <div className="p-1.5 rounded-md bg-primary/10 text-primary-light group-hover/item:bg-primary/20 transition-colors mt-0.5">
                              <Icon size={16} />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-text-primary">{tool.label}</div>
                              <div className="text-xs text-text-secondary mt-0.5">{tool.desc}</div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <NavLink href="/gallery" icon={<ImageIcon size={16} />} active={isActive('/gallery')}>
                Gallery
              </NavLink>
              <NavLink href="/suggestions" icon={<Lightbulb size={16} />} active={isActive('/suggestions')}>
                Suggestions
              </NavLink>
              <NavLink href="/bots" icon={<Bot size={16} />} active={isActive('/bots')}>
                Bots
              </NavLink>
            </div>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-3">
              {session?.user ? (
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-transparent hover:border-divider hover:bg-surface/50 transition-all duration-200"
                  >
                    {session.user.avatar ? (
                      <Image
                        src={`https://cdn.discordapp.com/avatars/${session.user.discordId}/${session.user.avatar}.png`}
                        alt=""
                        width={28}
                        height={28}
                        className="rounded-full ring-2 ring-primary/30"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                        <User size={16} className="text-primary-light" />
                      </div>
                    )}
                    <span className="text-sm text-text-primary font-medium">
                      {session.user.username}
                    </span>
                    <ChevronDown size={14} className="text-text-secondary" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-52 bg-background-paper border border-divider/70 rounded-card shadow-card overflow-hidden animate-fade-in">
                      <div className="gradient-line-accent" />
                      <div className="p-1.5">
                        <Link
                          href="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-primary/8 rounded-lg transition-colors"
                        >
                          <LayoutDashboard size={16} />
                          Dashboard
                        </Link>
                        {session.user.isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-primary/8 rounded-lg transition-colors"
                          >
                            <Shield size={16} />
                            Admin Panel
                          </Link>
                        )}
                        <div className="gradient-line my-1" />
                        <button
                          onClick={() => signOut()}
                          className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-error hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <LogOut size={16} />
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => signIn('discord')}
                  className="flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-lg bg-[#5865F2] text-white hover:bg-[#4752C4] hover:shadow-[0_0_20px_rgba(88,101,242,0.4)] transition-all duration-200 hover:scale-[1.02]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                  </svg>
                  Login with Discord
                </button>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-text-secondary hover:text-primary-light transition-colors rounded-lg hover:bg-primary/10"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-divider/50 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex flex-col gap-1">
                <MobileNavLink href="/" onClick={closeMobile} active={isActive('/')}>
                  <Home size={18} /> Home
                </MobileNavLink>
                <MobileNavLink href="/community" onClick={closeMobile} active={isActive('/community')}>
                  <Users size={18} /> Community
                </MobileNavLink>
                <MobileNavLink href="/events" onClick={closeMobile} active={isActive('/events')}>
                  <Calendar size={18} /> Events
                </MobileNavLink>

                {/* Mobile Tools */}
                <div ref={mobileToolsRef} className="px-3 py-2">
                  <button
                    onClick={() => setToolsOpen(!toolsOpen)}
                    className={`flex items-center gap-2 w-full text-sm font-medium transition-colors ${
                      isToolsActive ? 'text-primary-light' : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Wrench size={18} />
                    Tools
                    <ChevronDown
                      size={14}
                      className={`ml-auto transition-transform ${toolsOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {toolsOpen && (
                    <div className="mt-2 ml-2 flex flex-col gap-0.5 border-l-2 border-primary/30 pl-4">
                      {toolsDropdown.map((tool) => (
                        <Link
                          key={tool.href}
                          href={tool.href}
                          onClick={closeMobile}
                          className={`text-sm py-2 transition-colors ${
                            isActive(tool.href)
                              ? 'text-primary-light font-medium'
                              : 'text-text-secondary hover:text-primary-light'
                          }`}
                        >
                          {tool.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <MobileNavLink href="/gallery" onClick={closeMobile} active={isActive('/gallery')}>
                  <ImageIcon size={18} /> Gallery
                </MobileNavLink>
                <MobileNavLink href="/suggestions" onClick={closeMobile} active={isActive('/suggestions')}>
                  <Lightbulb size={18} /> Suggestions
                </MobileNavLink>
                <MobileNavLink href="/bots" onClick={closeMobile} active={isActive('/bots')}>
                  <Bot size={18} /> Bots
                </MobileNavLink>

                {/* Mobile Auth */}
                <div className="gradient-line my-3" />
                <div className="px-3">
                  {session?.user ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2.5 py-2 text-sm text-text-primary font-medium">
                        {session.user.avatar ? (
                          <Image
                            src={`https://cdn.discordapp.com/avatars/${session.user.discordId}/${session.user.avatar}.png`}
                            alt=""
                            width={28}
                            height={28}
                            className="rounded-full ring-2 ring-primary/30"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                            <User size={16} className="text-primary-light" />
                          </div>
                        )}
                        {session.user.username}
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={closeMobile}
                        className="text-sm text-text-secondary hover:text-primary-light py-1.5 pl-10 transition-colors"
                      >
                        Dashboard
                      </Link>
                      {session.user.isAdmin && (
                        <Link
                          href="/admin"
                          onClick={closeMobile}
                          className="text-sm text-text-secondary hover:text-primary-light py-1.5 pl-10 transition-colors"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => signOut()}
                        className="text-sm text-error hover:text-error/80 py-1.5 pl-10 text-left transition-colors"
                      >
                        Log Out
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => signIn('discord')}
                      className="w-full flex items-center justify-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg bg-[#5865F2] text-white hover:bg-[#4752C4] transition-all"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                      </svg>
                      Login with Discord
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

function NavLink({
  href,
  icon,
  active,
  children,
}: {
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`nav-link ${active ? 'nav-link-active' : ''}`}
    >
      {icon}
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  onClick,
  active,
  children,
}: {
  href: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
        active
          ? 'text-primary-light bg-primary/10 font-medium'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface/50'
      }`}
    >
      {children}
    </Link>
  );
}
