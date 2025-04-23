'use client'

interface YouTubeEmbedProps {
  url: string
}

export default function YouTubeEmbed({ url }: YouTubeEmbedProps) {
  // Extract video ID from URL
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
  }

  const videoId = getYouTubeId(url);

  if (!videoId) return null;

  return (
    <div className="relative overflow-hidden rounded-xl shadow-lg">
      <div className="relative pt-[56.25%]">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </div>
  );
} 