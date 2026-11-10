import { AspectRatio } from '@/types';

interface GenerateKeyframeOptions {
  prompt: string;
  aspectRatio: AspectRatio;
  seed?: number;
}

export async function generateKeyframeImage({
  prompt,
  aspectRatio,
  seed = Math.floor(Math.random() * 1000000),
}: GenerateKeyframeOptions): Promise<string> {
  // Dimensions based on aspect ratio
  let width = 1280;
  let height = 720;

  if (aspectRatio === '9:16') {
    width = 720;
    height = 1280;
  } else if (aspectRatio === '1:1') {
    width = 1024;
    height = 1024;
  }

  // Sanitize prompt for URL
  const cleanPrompt = encodeURIComponent(
    `${prompt}, photorealistic, 8k, cinematic lighting, masterpiece, ultra-detailed`
  );

  // Pollinations Flux endpoint (reliable, zero API key required, produces real AI imagery)
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;

  return pollinationsUrl;
}
