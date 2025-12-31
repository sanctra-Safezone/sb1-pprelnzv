export const C = {
  bg: '#050807',
  bgCard: '#0a0f0d',
  accent: '#cca35e',
  accentLight: '#e8c87a',
  emerald: '#10b981',
  emeraldLight: '#34d399',
  emeraldDark: '#059669',
  text: '#f0fdf4',
  textSecondary: '#d1fae5',
  muted: '#9cc6c6',
  mutedDark: '#6b9a9a',
  glass: 'rgba(6,78,59,0.18)',
  glassLight: 'rgba(6,78,59,0.12)',
  glassDark: 'rgba(6,78,59,0.35)',
  border: 'rgba(255,255,255,0.06)',
  borderLight: 'rgba(255,255,255,0.1)',
  gradient: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(6,78,59,0.2) 100%)',
  gradientAccent: 'linear-gradient(135deg, rgba(204,163,94,0.15) 0%, rgba(204,163,94,0.05) 100%)'
};

export const PLAN_LIMITS = {
  free: { images: 2, videos: 1, audio: 1, maxVideoSeconds: 10, maxAudioSeconds: 30 },
  personal: { images: 5, videos: 3, audio: 3, maxVideoSeconds: 10, maxAudioSeconds: 60 },
  creator: { images: 20, videos: 10, audio: 10, maxVideoSeconds: 30, maxAudioSeconds: 120 }
};

export const GARDEN_MUSIC = [
  {
    id: 'strong-mindset',
    label: 'Strong Have Mindset',
    file: 'https://res.cloudinary.com/demo/video/upload/v1/samples/strong-have-mindset.mp3',
    icon: 'sparkles'
  },
  {
    id: 'season-by-season',
    label: 'Season By Season',
    file: 'https://res.cloudinary.com/demo/video/upload/v1/samples/season-by-season.mp3',
    icon: 'trees'
  },
  {
    id: 'day-by-day',
    label: 'Day By Day',
    file: 'https://res.cloudinary.com/demo/video/upload/v1/samples/day-by-day.mp3',
    icon: 'cloud-rain'
  },
  {
    id: 'sanc-wave',
    label: 'Sanc Wave Beat',
    file: 'https://res.cloudinary.com/demo/video/upload/v1/samples/sanc-wave-beat.mp3',
    icon: 'waves'
  },
  {
    id: 'sanc-chill',
    label: 'Sanc Chill Beat',
    file: 'https://res.cloudinary.com/demo/video/upload/v1/samples/sanc-chill-beat.mp3',
    icon: 'wind'
  },
  {
    id: 'agree-sanctra',
    label: 'Agree Sanctra Beat',
    file: 'https://res.cloudinary.com/demo/video/upload/v1/samples/agree-sanctra-beat.mp3',
    icon: 'music'
  }
];

export const FREE_LIVE_IMAGES = [
  {
    id: 'solitary-place',
    label: 'Solitary Place',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/samples/solitary-place.mp4',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/solitary-place.jpg'
  },
  {
    id: 'interstellar',
    label: 'Interstellar',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/samples/interstellar.mp4',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/interstellar.jpg'
  },
  {
    id: 'neon-cyberpunk',
    label: 'Neon Green Cyberpunk',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/samples/neon-cyberpunk.mp4',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/neon-cyberpunk.jpg'
  },
  {
    id: 'sanctra-farer',
    label: 'Sanctra Farer',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/samples/sanctra-farer.mp4',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/sanctra-farer.jpg'
  },
  {
    id: 'emo-punk',
    label: 'Emo-Punk',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/samples/emo-punk.mp4',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/emo-punk.jpg'
  }
];

export const MEDIA_LIMITS = {
  image: {
    maxSize: 5 * 1024 * 1024,
    formats: ['image/jpeg', 'image/png', 'image/webp'],
    formatLabel: 'JPG, PNG, WEBP'
  },
  video: {
    maxSize: 15 * 1024 * 1024,
    maxDuration: 10,
    formats: ['video/mp4', 'video/webm'],
    formatLabel: 'MP4, WEBM'
  },
  audio: {
    maxSize: 5 * 1024 * 1024,
    maxDuration: 15,
    formats: ['audio/mpeg', 'audio/wav', 'audio/mp3'],
    formatLabel: 'MP3, WAV'
  },
  profileSound: {
    maxSize: 5 * 1024 * 1024,
    maxDuration: 20,
    formats: ['audio/mpeg', 'audio/wav', 'audio/mp3'],
    formatLabel: 'MP3, WAV'
  }
};
