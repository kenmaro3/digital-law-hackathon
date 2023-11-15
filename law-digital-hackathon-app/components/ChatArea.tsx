'use client';
// 1. Importing necessary React hooks and components
import { useState, useEffect, useRef, useLayoutEffect, FormEvent } from 'react';
import { useParams } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useChat, Message } from 'ai/react'; // Custom chat-related hook
import { RivGirl } from './RivGirl';
import { Toggle } from '@/components/ui/toggle';
import ReactMarkdown from 'react-markdown';
import ReactTypingEffect from 'react-typing-effect';

interface CreateSoundRequest {
  /**
   * The input text that will be used to generate the sound.
   */
  text: string;
}

function LinkRenderer(props: any) {
  return (
    <a href={props.href} target="_blank" rel="noreferrer">
      {props.children}
    </a>
  );
}

export const ChatArea = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeak, setIsSpeak] = useState(true);
  const [composing, setComposition] = useState(false);
  const startComposition = () => setComposition(true);
  const endComposition = () => setComposition(false);
  // 2. Getting route parameters
  const params = useParams();
  // 3. Using custom chat hook
  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    setMessages,
  } = useChat(
    //{ initialMessages: [Message({ role: "user", content: "法律について教えて" })] }
    {
      onFinish: async (message) => {
        setIsLoading(false);

        if (isSpeak) {
          //await handleGetAudio(params)
          let utterance = new SpeechSynthesisUtterance(message.content);
          utterance.lang = 'ja-JP';
          window.speechSynthesis.speak(utterance);
        }
      },
    }
  );

  // 6. Function to handle all submits
  const handleAllSubmits = (e: any) => {
    if (e.key === 'Enter') {
      if (composing) return;
      handleSubmit(e as FormEvent<HTMLFormElement>, {});
      setInput('');
      setIsLoading(true);
    }
  };

  const handleStop = () => {
    const synth = window.speechSynthesis;

    synth.cancel();
  };

  useEffect(() => {
    let utterance = new SpeechSynthesisUtterance('hey, how can I help you?');
    window.speechSynthesis.speak(utterance);
  }, []);

  // 7. Creating a ref for the message container
  const containerRef = useRef<HTMLDivElement | null>(null);
  // 8. Using useLayoutEffect to scroll to the bottom of the container
  useLayoutEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight || 0;
    }
  }, [messages]);

  const handleToggleChange = () => {
    setIsSpeak(!isSpeak);
  };
  return (
    <>
      <div className="h-screen max-h-[888px] w-full flex flex-col justify-between items-center">
        <div className="flex flex-col h-[100%] w-[500px]">
          <div className="flex flex-row justify-between">
            <div
              className="w-[25px] my-2 mx-4"
              style={{ cursor: 'pointer' }}
              onClick={(e) => handleToggleChange()}>
              {isSpeak ? (
                <img src="/images/speaker_on.png" alt="speaker_on"></img>
              ) : (
                <img src="/images/speaker_off.png" alt="speaker_off"></img>
              )}
            </div>

            <div className="w-[30px] my-2 mx-4" style={{ cursor: 'pointer' }}>
              <img
                src="/images/stop_speech.png"
                alt="stop_speech"
                onClick={(e) => handleStop()}></img>
            </div>
          </div>
          <div
            ref={containerRef}
            className="h-full mx-3 flex flex-col overflow-y-auto overflow-x-hidden">
            {messages.length > 0
              ? messages.map((m) => (
                  <div
                    key={m.id}
                    className={`${
                      m.role === 'user'
                        ? 'flex justify-end'
                        : 'flex justify-start'
                    } my-1`}>
                    <div
                      className={`max-w-[60%] px-4 py-2 rounded-lg ${
                        m.role === 'user'
                          ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white'
                          : 'bg-gray-200 opacity-80'
                      }`}>
                      <ReactMarkdown components={{ a: LinkRenderer }}>
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))
              : null}

            {isLoading && (
              <>
                <div className="flex justify-start">
                  <h2 className="max-w-3/4 px-4 py-2 rounded-lg bg-gray-200">
                    <ReactTypingEffect
                      text={['・・・・・・・・・・・']}
                      speed={50}
                      eraseSpeed={50}
                    />
                  </h2>
                </div>
              </>
            )}
          </div>
          <form onSubmit={handleAllSubmits} className="mx-3 mb-2">
            <Textarea
              onCompositionStart={startComposition}
              onCompositionEnd={endComposition}
              value={input}
              placeholder="Say something..."
              onChange={handleInputChange}
              onKeyDown={handleAllSubmits}
              className="w-full my-2 bg-slate-900 text-white"
            />
            <Button className="w-full mb-2 bg-gradient-to-l from-violet-600 to-fuchsia-500">
              Send
            </Button>
          </form>
        </div>
        <div className="absolute w-full top-0 h-screen z-[-1] bg-gradient-to-r from-black to-violet-900 rounded-b-2lg">
          <div className="flex justify-center items-center">
            <RivGirl />
          </div>
        </div>
      </div>
    </>
  );
};
