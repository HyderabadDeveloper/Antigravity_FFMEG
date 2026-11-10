import { VideoProviderAdapter } from '@/types';
import { RunwayGen3Adapter } from './runwayAdapter';
import { GoogleVeoAdapter } from './googleVeoAdapter';

const adapters: Record<string, VideoProviderAdapter> = {
  runway: new RunwayGen3Adapter(),
  veo: new GoogleVeoAdapter(),
};

export function getProviderAdapter(providerId: string): VideoProviderAdapter {
  const adapter = adapters[providerId] || adapters['runway'];
  return adapter;
}

export function getAllProviderAdapters(): VideoProviderAdapter[] {
  return Object.values(adapters);
}
