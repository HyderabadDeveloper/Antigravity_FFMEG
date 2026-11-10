import { ProviderBenchmark } from '@/types';

export const PROVIDER_BENCHMARKS: ProviderBenchmark[] = [
  {
    id: 'runway',
    name: 'Runway Gen-3 Alpha',
    company: 'Runway ML',
    costPerSecond: 0.05,
    avgTurnaroundSeconds: 30,
    qualityScore: 9.4,
    consistencyScore: 9.2,
    bestFor: 'Precision camera motion & Image-to-Video keyframe anchoring',
    strengths: ['Smooth camera choreography', 'First-frame conditioning', 'Turbo speed options'],
  },
  {
    id: 'veo',
    name: 'Google Veo (Vertex AI)',
    company: 'Google Cloud / DeepMind',
    costPerSecond: 0.06,
    avgTurnaroundSeconds: 35,
    qualityScore: 9.5,
    consistencyScore: 9.1,
    bestFor: 'Natural physics, complex atmospheric prompts & cinematic lighting',
    strengths: ['Volumetric lighting', 'Coherent fluid dynamics', 'Complex environmental text adherence'],
  },
  {
    id: 'luma',
    name: 'Luma Dream Machine (Ray-2)',
    company: 'Luma AI',
    costPerSecond: 0.04,
    avgTurnaroundSeconds: 20,
    qualityScore: 9.0,
    consistencyScore: 8.8,
    bestFor: 'High-speed turnaround & kinetic tracking camera motion',
    strengths: ['Fastest generation turnaround', 'Fluid character motion', 'High-speed pan/tilt'],
  },
  {
    id: 'kling',
    name: 'Kling AI 1.5 HD',
    company: 'Kuaishou Technology',
    costPerSecond: 0.07,
    avgTurnaroundSeconds: 55,
    qualityScore: 9.6,
    consistencyScore: 9.5,
    bestFor: 'Human facial fidelity, character consistency & micro-expressions',
    strengths: ['Unmatched facial preservation', 'Realistic cloth physics', 'Native 1080p output'],
  },
  {
    id: 'azure',
    name: 'Azure OpenAI / Foundry',
    company: 'Microsoft Azure',
    costPerSecond: 0.09,
    avgTurnaroundSeconds: 40,
    qualityScore: 9.1,
    consistencyScore: 8.9,
    bestFor: 'Enterprise governance, VPC isolation & strict data compliance',
    strengths: ['Zero data retention guarantee', 'Enterprise SLA', 'SOC2 / HIPAA compliance'],
  },
];

export function getProviderBenchmarks(): ProviderBenchmark[] {
  return PROVIDER_BENCHMARKS;
}

/**
 * Smart recommendation engine recommending the best provider model for a scene.
 */
export function recommendProviderForScene(scenePrompt: string, hasCharacter: boolean): {
  recommendedId: string;
  reason: string;
} {
  const lower = (scenePrompt || '').toLowerCase();

  if (hasCharacter || lower.includes('face') || lower.includes('eyes') || lower.includes('portrait')) {
    return {
      recommendedId: 'kling',
      reason: 'Kling AI 1.5 HD exhibits the highest facial fidelity and character continuity score (9.5/10).',
    };
  }

  if (lower.includes('orbit') || lower.includes('fast') || lower.includes('dynamic') || lower.includes('speed')) {
    return {
      recommendedId: 'luma',
      reason: 'Luma Dream Machine excels at high-velocity camera motion and rapid iteration (20s turnaround).',
    };
  }

  if (lower.includes('rain') || lower.includes('neon') || lower.includes('cinematic') || lower.includes('smoke')) {
    return {
      recommendedId: 'veo',
      reason: 'Google Veo produces the most accurate natural physics, volumetric lighting, and environmental reflections.',
    };
  }

  return {
    recommendedId: 'runway',
    reason: 'Runway Gen-3 Alpha provides balanced temporal consistency and precise first-frame keyframe anchoring.',
  };
}
