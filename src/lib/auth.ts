import { NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import { prisma } from '@/lib/db';

const moderatorIds = (process.env.DISCORD_MODERATORS || '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: 'identify' } },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'discord' && profile) {
        const discordProfile = profile as { id: string; username: string; avatar?: string };
        const isModerator = moderatorIds.includes(discordProfile.id);

        // Upsert user with Discord data
        await prisma.user.upsert({
          where: { discordId: discordProfile.id },
          update: {
            username: discordProfile.username,
            avatar: discordProfile.avatar || null,
            isModerator,
          },
          create: {
            discordId: discordProfile.id,
            username: discordProfile.username,
            avatar: discordProfile.avatar || null,
            isModerator,
          },
        });
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (account?.provider === 'discord' && profile) {
        const discordProfile = profile as { id: string; username: string; avatar?: string };
        token.discordId = discordProfile.id;
        token.username = discordProfile.username;
        token.avatar = discordProfile.avatar || null;
        token.isModerator = moderatorIds.includes(discordProfile.id);

        // Get DB user for id and admin status
        const dbUser = await prisma.user.findUnique({
          where: { discordId: discordProfile.id },
          select: { id: true, isAdmin: true },
        });
        token.userId = dbUser?.id || token.sub;
        token.isAdmin = dbUser?.isAdmin || false;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: (token.userId as string) || token.sub!,
        discordId: token.discordId,
        username: token.username,
        avatar: token.avatar,
        isModerator: token.isModerator,
        isAdmin: token.isAdmin,
      };
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: '/login',
  },
};
