export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('Bot is Ready!');
    // Load shutdown signal handlers
    await import('@/lib/shutdown');
  }
}
