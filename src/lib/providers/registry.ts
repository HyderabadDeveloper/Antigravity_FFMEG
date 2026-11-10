import { VideoProviderAdapter } from '@/types';
import { RunwayGen3Adapter } from './runwayAdapter';
import { GoogleVeoAdapter } from './googleVeoAdapter';
import { LumaDreamMachineAdapter } from './lumaAdapter';
import { KlingAIAdapter } from './klingAdapter';
import { AzureVideoAdapter } from './azureVideoAdapter';

export {
  PROVIDER_BENCHMARKS,
  getProviderBenchmarks,
  recommendProviderForScene,
} from './benchmarks';

const adapters: Record<string, VideoProviderAdapter> = {
  runway: new RunwayGen3Adapter(),
  veo: new GoogleVeoAdapter(),
  luma: new LumaDreamMachineAdapter(),
  kling: new KlingAIAdapter(),
  azure: new AzureVideoAdapter(),
};

export function getProviderAdapter(providerId: string): VideoProviderAdapter {
  const adapter = adapters[providerId] || adapters['runway'];
  return adapter;
}

export function getAllProviderAdapters(): VideoProviderAdapter[] {
  return Object.values(adapters);
}
