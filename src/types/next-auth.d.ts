import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      discordId: string;
      username: string;
      avatar?: string | null;
      isModerator: boolean;
      isAdmin: boolean;
    };
  }

  interface User {
    discordId: string;
    username: string;
    avatar?: string | null;
    isModerator: boolean;
    isAdmin: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    discordId: string;
    username: string;
    avatar?: string | null;
    isModerator: boolean;
    isAdmin: boolean;
  }
}
