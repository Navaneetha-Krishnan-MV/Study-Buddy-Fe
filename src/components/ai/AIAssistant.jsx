import { useEffect, useMemo, useRef, useState } from 'react';
import { AI_QUICK_PROMPTS, AI_RESPONSES } from '../../data/mockData';
import { Brain } from '../icons/Icons';
import ChatDrawer from './ChatDrawer';

function nowLabel() {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function pickFromPool(pool, seed) {
  if (!pool || !pool.length) {
    return '';
  }

  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return pool[hash % pool.length];
}

function buildAssistantReply({ prompt, subjectId, unitId }) {
  const normalized = prompt.toLowerCase();

  const general = pickFromPool(AI_RESPONSES.general, `${prompt}-general`);
  const unitReply = pickFromPool(AI_RESPONSES.units[unitId] || [], `${prompt}-${unitId}`);
  const subjectReply = pickFromPool(AI_RESPONSES.bySubject[subjectId] || [], `${prompt}-${subjectId}`);

  if (!subjectId) {
    return `${general}\n\nSelect a semester and subject so I can provide topic-specific guidance.`;
  }

  if (normalized.includes('quiz') || normalized.includes('test') || normalized.includes('mcq')) {
    const quizTip = pickFromPool(AI_RESPONSES.quizTips, `${prompt}-quiz`);
    return `${quizTip}\n\n${unitReply || general}`;
  }

  if (normalized.includes('plan') || normalized.includes('schedule') || normalized.includes('revision')) {
    return [
      'Suggested 45-minute plan:',
      '1) 15 min concept recap from notes',
      '2) 20 min problem practice',
      '3) 10 min quick self-test and error review',
      unitReply || general,
    ].join('\n');
  }

  if (normalized.includes('formula') || normalized.includes('derive') || normalized.includes('definition')) {
    return `${subjectReply || general}\n\n${unitReply || general}`;
  }

  return [unitReply || general, subjectReply].filter(Boolean).join('\n\n');
}

export default function AIAssistant({ open, onOpenChange, selectedSubject, units }) {
  const introText = selectedSubject
    ? `I am ready to help with ${selectedSubject.name}. Ask for summaries, revision plans, or likely quiz questions.`
    : 'I am your AI study assistant. Select a subject first so I can answer with context.';

  const [messages, setMessages] = useState([
    {
      id: `intro-${selectedSubject?.id || 'none'}`,
      role: 'assistant',
      text: introText,
      time: 'Now',
    },
  ]);
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState(units[0]?.id || '');
  const typingTimeoutRef = useRef(null);

  const quickPrompts = useMemo(() => AI_QUICK_PROMPTS.slice(0, 3), []);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const pushAssistantReply = (prompt) => {
    setIsTyping(true);

    typingTimeoutRef.current = setTimeout(() => {
      const text = buildAssistantReply({
        prompt,
        subjectId: selectedSubject?.id,
        unitId: selectedUnitId || units[0]?.id,
      });

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text,
          time: nowLabel(),
        },
      ]);
      setIsTyping(false);
      typingTimeoutRef.current = null;
    }, 520);
  };

  const sendMessage = (text = draft) => {
    const message = text.trim();
    if (!message) {
      return;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
      setIsTyping(false);
    }

    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        text: message,
        time: nowLabel(),
      },
    ]);
    setDraft('');
    pushAssistantReply(message);
  };

  return (
    <>
      <button
        type="button"
        className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-lg transition ${
          open
            ? 'border-slate-900 bg-slate-900 text-white'
            : 'border-slate-900 bg-slate-900 text-white hover:bg-black'
        }`}
        onClick={() => onOpenChange(!open)}
      >
        <Brain size={15} />
        AI Tutor
        <span className="inline-block h-2 w-2 rounded-full bg-slate-300 animate-pulse" />
      </button>

      <ChatDrawer
        open={open}
        onClose={() => onOpenChange(false)}
        messages={messages}
        draft={draft}
        onDraftChange={setDraft}
        onSend={() => sendMessage()}
        isTyping={isTyping}
        quickPrompts={quickPrompts}
        onUsePrompt={(prompt) => {
          onOpenChange(true);
          sendMessage(prompt);
        }}
        selectedSubject={selectedSubject}
        units={units}
        selectedUnitId={selectedUnitId}
        onSelectUnit={setSelectedUnitId}
      />
    </>
  );
}
