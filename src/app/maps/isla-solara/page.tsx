import Image from 'next/image';
import { Waves, CloudLightning, CloudSun, Settings2, Terminal, Video, ImageIcon, Info, FlaskConical, ArrowDown } from 'lucide-react';
import { islaSolara } from '@/data/isla-solara';
import { pageMetadata } from '@/lib/seo';
import { ImageGallery, VideoGallery } from '@/components/maps/MediaGallery';
import { CopyButton } from '@/components/ui/CopyButton';

export const metadata = pageMetadata({
  title: `${islaSolara.name} - Path of Titans Mod Map`,
  description: islaSolara.tagline,
  path: '/maps/isla-solara',
});

const highlightIcons = [Waves, CloudLightning, CloudSun];

export default function IslaSolaraPage() {
  const map = islaSolara;

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {map.hero ? (
          <>
            <Image src={map.hero} alt="" fill priority className="object-cover" sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(10,81,194,0.18),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(24,160,153,0.14),transparent_55%)]" />
            <div className="absolute inset-0 bg-grid-pattern opacity-40" />
          </>
        )}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent-light text-sm font-medium mb-5">
            <Waves size={14} />
            TitanTech Mod Map
          </div>
          <h1 className="font-heading text-4xl sm:text-6xl font-bold tracking-tight mb-5">
            <span className="gradient-text">{map.name}</span>
          </h1>
          <p className="text-text-secondary text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
            {map.tagline}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="#media" className="btn-primary inline-flex items-center gap-2">
              <Video size={16} /> Watch &amp; Explore
            </a>
            <a href="#config" className="btn-outline inline-flex items-center gap-2">
              <Settings2 size={16} /> Game.ini Settings
            </a>
            <a href="#commands" className="btn-outline inline-flex items-center gap-2">
              <Terminal size={16} /> Admin Commands
            </a>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Overview + highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-text-secondary text-lg leading-relaxed max-w-3xl mx-auto text-center mb-12">
          {map.description}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {map.highlights.map((h, i) => {
            const Icon = highlightIcons[i % highlightIcons.length];
            return (
              <div key={h.title} className="card p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary-light flex items-center justify-center mb-4">
                  <Icon size={24} />
                </div>
                <h3 className="font-heading font-semibold text-lg text-text-primary mb-2">{h.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{h.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Media */}
      <section id="media" className="relative overflow-hidden scroll-mt-20">
        <div className="absolute inset-0 bg-background-paper" />
        <div className="absolute inset-0 bg-dots-pattern opacity-30" />
        <div className="gradient-line-accent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-14">
          <div>
            <SectionHeading icon={<Video size={20} />} title="Videos" subtitle="See the tides and floods in motion." />
            <VideoGallery videos={map.videos} />
          </div>
          <div>
            <SectionHeading icon={<ImageIcon size={20} />} title="Screenshots" subtitle="Views from around the island." />
            <ImageGallery images={map.images} />
          </div>
        </div>
      </section>

      {/* Config */}
      <section id="config" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20">
        <SectionHeading icon={<Settings2 size={20} />} title="Game.ini Settings" subtitle={map.configIntro} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          <div className="card-static overflow-hidden lg:col-span-2 lg:sticky lg:top-24">
            <div className="flex items-center justify-between px-4 py-3 border-b border-divider bg-background-secondary/60">
              <span className="font-mono text-xs text-text-secondary">Game.ini</span>
              <CopyButton text={map.gameIni} />
            </div>
            <pre className="p-4 overflow-x-auto text-sm leading-relaxed font-mono">
              <code>{renderIni(map.gameIni)}</code>
            </pre>
          </div>

          <div className="card-static overflow-hidden lg:col-span-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-divider bg-background-secondary/60 text-left">
                  <th className="px-4 py-3 font-heading font-semibold text-text-primary">Key</th>
                  <th className="px-4 py-3 font-heading font-semibold text-text-primary">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {map.configKeys.map((k) => (
                  <tr key={k.key} className="border-b border-divider/50 last:border-0 hover:bg-primary/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-primary-light whitespace-nowrap align-top">{k.key}</td>
                    <td className="px-4 py-3 text-text-secondary leading-relaxed">{k.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Commands */}
      <section id="commands" className="relative overflow-hidden scroll-mt-20">
        <div className="absolute inset-0 bg-background-paper" />
        <div className="gradient-line-accent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <SectionHeading
            icon={<Terminal size={20} />}
            title="Admin Commands"
            subtitle="Steer the weather, tides, and floods live from in-game chat."
          />

          {/* Permission callout */}
          <div className="card-static p-5 mb-8 border-warning/30 bg-warning/5">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Info size={20} className="text-warning shrink-0 mt-0.5" />
                <div>
                  <div className="font-heading font-semibold text-text-primary mb-1">Permission required</div>
                  <p className="text-text-secondary text-sm leading-relaxed">{map.permissionIntro}</p>
                </div>
              </div>
              <div className="rounded-lg border border-divider bg-background overflow-hidden min-w-[260px]">
                <div className="flex items-center justify-between px-3 py-2 border-b border-divider bg-background-secondary/60">
                  <span className="font-mono text-xs text-text-secondary">Commands.ini</span>
                  <CopyButton text={map.permissionIni} />
                </div>
                <pre className="px-3 py-2.5 text-sm font-mono leading-relaxed">
                  <code>{renderIni(map.permissionIni)}</code>
                </pre>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {map.commandGroups.map((group) => (
              <div key={group.title} className="card-static overflow-hidden">
                <div className="px-4 py-3 border-b border-divider bg-background-secondary/60 font-heading font-semibold text-text-primary">
                  {group.title}
                </div>
                <ul className="divide-y divide-divider/50">
                  {group.commands.map((c) => (
                    <li key={c.command} className="px-4 py-3 hover:bg-primary/5 transition-colors">
                      <code className="block font-mono text-sm text-primary-light break-words">{c.command}</code>
                      <p className="text-text-secondary text-sm mt-1 leading-relaxed">{c.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="card-static p-5 flex items-start gap-3">
              <ArrowDown size={20} className="text-accent-light shrink-0 mt-0.5" />
              <p className="text-text-secondary text-sm leading-relaxed">{map.commandsNote}</p>
            </div>
            <div className="card-static p-5 flex items-start gap-3">
              <FlaskConical size={20} className="text-secondary-light shrink-0 mt-0.5" />
              <p className="text-text-secondary text-sm leading-relaxed">{map.testingTip}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h2 className="font-heading text-2xl sm:text-3xl font-bold flex items-center gap-3 mb-2">
        <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary-light flex items-center justify-center">{icon}</span>
        {title}
      </h2>
      {subtitle && <p className="text-text-secondary leading-relaxed max-w-3xl">{subtitle}</p>}
    </div>
  );
}

/** Light syntax colouring for INI text: sections, comments, keys, values. */
function renderIni(ini: string) {
  return ini.split('\n').map((line, i) => {
    let node: React.ReactNode = line;
    if (line.startsWith('[')) {
      node = <span className="text-secondary-light font-semibold">{line}</span>;
    } else if (line.startsWith(';')) {
      node = <span className="text-text-secondary/60 italic">{line}</span>;
    } else if (line.includes('=')) {
      const eq = line.indexOf('=');
      node = (
        <>
          <span className="text-primary-light">{line.slice(0, eq)}</span>
          <span className="text-text-secondary">=</span>
          <span className="text-accent-light">{line.slice(eq + 1)}</span>
        </>
      );
    }
    return (
      <span key={i}>
        {node}
        {'\n'}
      </span>
    );
  });
}
