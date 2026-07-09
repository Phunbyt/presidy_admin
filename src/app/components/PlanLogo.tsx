export type Plan = 'Spotify' | 'Apple Music' | 'YouTube Music';

function SpotifyIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <title>Spotify</title>
      <circle cx="12" cy="12" r="12" fill="#1DB954" />
      <path
        fill="white"
        d="M17.9 10.9C14.7 9 9.35 8.8 6.3 9.75c-.5.15-1-.15-1.15-.6-.15-.5.15-1 .6-1.15 3.55-1.05 9.4-.85 13.1 1.35.45.25.6.85.35 1.3-.25.35-.85.5-1.3.25zm-.1 2.8c-.25.35-.7.5-1.05.25-2.7-1.65-6.8-2.15-9.95-1.15-.4.1-.85-.1-.95-.5-.1-.4.1-.85.5-.95 3.65-1.1 8.15-.55 11.25 1.35.3.15.45.65.2 1zm-1.2 2.75c-.2.3-.55.4-.85.2-2.35-1.45-5.3-1.75-8.8-.95-.3.1-.65-.1-.75-.45-.1-.3.1-.65.45-.75 3.8-.85 7.1-.5 9.7 1.1.3.15.4.55.25.85z"
      />
    </svg>
  );
}

function AppleMusicIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <title>Apple Music</title>
      <rect width="24" height="24" rx="5.5" fill="#FC3C44" />
      <path
        fill="white"
        d="M16 5.5v8.75a2.75 2.75 0 1 1-1.5-2.46V8.2L9 9.55v6.7a2.75 2.75 0 1 1-1.5-2.46V8l8.5-2.5z"
      />
    </svg>
  );
}

function YouTubeMusicIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <title>YouTube Music</title>
      <circle cx="12" cy="12" r="12" fill="#FF0000" />
      <circle cx="12" cy="12" r="5.5" fill="white" />
      <path fill="#FF0000" d="M10.5 9.5l5 2.5-5 2.5V9.5z" />
    </svg>
  );
}

export function PlanLogo({ plan, size = 22 }: { plan: Plan; size?: number }) {
  if (plan === 'Spotify')       return <SpotifyIcon size={size} />;
  if (plan === 'Apple Music')   return <AppleMusicIcon size={size} />;
  if (plan === 'YouTube Music') return <YouTubeMusicIcon size={size} />;
  return null;
}
