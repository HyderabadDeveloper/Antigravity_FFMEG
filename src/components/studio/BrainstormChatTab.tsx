'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Project, ChatMessage, Scene, CreativeBrief } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Send,
  Sparkles,
  Bot,
  User,
  PlusCircle,
  Check,
  Clapperboard,
  Compass,
} from 'lucide-react';

interface BrainstormChatTabProps {
  project: Project;
  onSendMessage: (message: string) => Promise<void>;
  onAddScene: (scene: Partial<Scene>) => Promise<void>;
  onApplyBrief: (brief: Partial<CreativeBrief>) => Promise<void>;
  isSending: boolean;
}

const QUICK_PROMPTS = [
  'Suggest a 3-scene story breakdown for this concept',
  'Define a consistent antagonist character with visual tokens',
  'Generate a high-tension opening hook and logline',
  'How should we choreograph the camera motion for Scene 1?',
];

export const BrainstormChatTab: React.FC<BrainstormChatTabProps> = ({
  project,
  onSendMessage,
  onAddScene,
  onApplyBrief,
  isSending,
}) => {
  const [input, setInput] = useState('');
  const [addedSceneIds, setAddedSceneIds] = useState<Record<string, boolean>>({});
  const [appliedBriefs, setAppliedBriefs] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [project.brainstormMessages, isSending]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    const msg = input.trim();
    setInput('');
    await onSendMessage(msg);
  };

  const handleQuickPrompt = async (prompt: string) => {
    if (isSending) return;
    await onSendMessage(prompt);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-230px)] bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-800 bg-[#141E33]/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Bot className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">AI Creative Director</h3>
              <Badge variant="cyan" size="sm">
                Stage 2: Brainstorm
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400">
              Brainstorm narrative beats, character continuity tokens, and camera choreography.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Interactive Story Engine</span>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {project.brainstormMessages.map((msg) => {
          const isAssistant = msg.sender === 'assistant';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              {isAssistant && (
                <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex-shrink-0 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-cyan-300" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  isAssistant
                    ? 'bg-[#182238] border border-slate-800 text-slate-200'
                    : 'bg-indigo-600 text-white shadow-md'
                }`}
              >
                {/* Text Content */}
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Suggested Scene Action Cards */}
                {msg.suggestedScenes && msg.suggestedScenes.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-700/60 space-y-3">
                    <div className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                      <Clapperboard className="w-3.5 h-3.5" />
                      <span>Suggested Scene Generated</span>
                    </div>

                    {msg.suggestedScenes.map((scene, idx) => {
                      const sceneKey = scene.id || `scene_${idx}`;
                      const isAdded = !!addedSceneIds[sceneKey];

                      return (
                        <div
                          key={sceneKey}
                          className="bg-[#0B0F19] border border-slate-800 p-3.5 rounded-xl space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-white">
                              {scene.title || `Scene ${scene.order}`}
                            </span>
                            <Badge variant="indigo" size="sm">
                              {scene.cameraMovement || 'dolly_in'}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-400">{scene.visualDescription}</p>
                          {scene.narration && (
                            <p className="text-xs text-slate-300 italic">
                              "{scene.narration}"
                            </p>
                          )}

                          <Button
                            size="xs"
                            variant={isAdded ? 'secondary' : 'neon'}
                            disabled={isAdded}
                            onClick={async () => {
                              await onAddScene(scene);
                              setAddedSceneIds((prev) => ({ ...prev, [sceneKey]: true }));
                            }}
                            leftIcon={
                              isAdded ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <PlusCircle className="w-3 h-3" />
                              )
                            }
                          >
                            {isAdded ? 'Added to Storyboard' : 'Add to Scene Storyboard'}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Suggested Brief Updates */}
                {msg.suggestedBrief && (
                  <div className="mt-4 pt-3 border-t border-slate-700/60">
                    <Button
                      size="xs"
                      variant={appliedBriefs ? 'secondary' : 'neon'}
                      disabled={appliedBriefs}
                      onClick={async () => {
                        await onApplyBrief(msg.suggestedBrief!);
                        setAppliedBriefs(true);
                      }}
                      leftIcon={
                        appliedBriefs ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )
                      }
                    >
                      {appliedBriefs ? 'Applied to Brief' : 'Apply Logline to Creative Brief'}
                    </Button>
                  </div>
                )}

                <div
                  className={`mt-2 text-[10px] ${
                    isAssistant ? 'text-slate-500' : 'text-indigo-200'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              {!isAssistant && (
                <div className="w-8 h-8 rounded-lg bg-indigo-700 flex-shrink-0 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          );
        })}

        {isSending && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
              <Bot className="w-4 h-4 text-cyan-300" />
            </div>
            <div className="bg-[#182238] border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Director is formulating narrative suggestions & continuity tokens...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="px-4 py-2 border-t border-slate-800 bg-[#0E1524] flex items-center gap-2 overflow-x-auto scrollbar-none">
        <Compass className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
        {QUICK_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleQuickPrompt(prompt)}
            disabled={isSending}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-[#0B0F19]">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSending}
            placeholder="Ask AI Director to develop characters, write scene dialogue, or refine camera movement..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#141E33] border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-white placeholder-slate-500"
          />
          <Button
            type="submit"
            variant="primary"
            isLoading={isSending}
            disabled={!input.trim()}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};
