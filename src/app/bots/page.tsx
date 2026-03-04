'use client';

import { Bot, ExternalLink, MessageCircle } from 'lucide-react';

export default function BotsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 text-primary-light mb-2">
          <Bot size={28} />
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">Discord Bots</h1>
        <p className="text-text-secondary">
          Custom Discord bots built for Path of Titans communities.
        </p>
      </div>

      <div className="card p-8 text-center space-y-6">
        <a
          href="https://bots.titantech.party/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-flex items-center gap-2 text-base px-6 py-3"
        >
          <ExternalLink size={18} />
          View Our Bots
        </a>

        <div className="gradient-line" />

        <div>
          <h2 className="font-heading font-semibold text-lg mb-2 flex items-center justify-center gap-2">
            <MessageCircle size={20} className="text-secondary-light" />
            Interested?
          </h2>
          <p className="text-text-secondary text-sm">
            DM us on Discord to learn more or get a bot for your server:
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <span className="px-4 py-2 rounded-lg bg-[#5865F2]/10 border border-[#5865F2]/30 text-[#7289da] font-mono text-sm font-medium">
              sadgasm8980
            </span>
            <span className="px-4 py-2 rounded-lg bg-[#5865F2]/10 border border-[#5865F2]/30 text-[#7289da] font-mono text-sm font-medium">
              .mars_
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
