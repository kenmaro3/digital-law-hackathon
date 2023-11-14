"use client"
// 1. Importing necessary React hooks and components
import { useState, useEffect, useRef, useLayoutEffect, FormEvent } from "react";
import { useParams } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useChat, Message } from "ai/react"; // Custom chat-related hook
import { RivGirl } from "./RivGirl";
import { Toggle } from "@/components/ui/toggle"
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
  const [isSpeak, setIsSpeak] = useState(true)
  const [composing, setComposition] = useState(false);
  const startComposition = () => setComposition(true);
  const endComposition = () => setComposition(false);
  // 2. Getting route parameters
  const params = useParams();
  // 3. Using custom chat hook
  const { messages, input, setInput, handleInputChange, handleSubmit, setMessages } = useChat(
    //{ initialMessages: [Message({ role: "user", content: "法律について教えて" })] }
    {
      onFinish: async (message) => {
        setIsLoading(false)

        if (isSpeak) {
          //await handleGetAudio(params)
          let utterance = new SpeechSynthesisUtterance(message.content);
          utterance.lang = "ja-JP"
          window.speechSynthesis.speak(utterance);
        }
      },
    }
  );


  // 6. Function to handle all submits
  const handleAllSubmits = (e: any) => {
    if (e.key === "Enter") {
      if (composing) return;
      handleSubmit(e as FormEvent<HTMLFormElement>, {
      });
      setInput("")
      setIsLoading(true)
    }
  };

  const handleStop = () => {
    const synth = window.speechSynthesis;

    synth.cancel();

  };

  useEffect(() => {
    let utterance = new SpeechSynthesisUtterance("hey, how can I help you?");
    window.speechSynthesis.speak(utterance);
  }, [])

  // 7. Creating a ref for the message container
  const containerRef = useRef<HTMLDivElement | null>(null);
  // 8. Using useLayoutEffect to scroll to the bottom of the container
  useLayoutEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight || 0;
    }
  }, [messages]);

  const handleToggleChange = () => {
    setIsSpeak(!isSpeak)
  }
  return (
    <>
      <div className="h-screen w-full m-5 flex flex-col justify-between ">
        <Toggle className="mt-2 w-full" onClick={(e) => handleToggleChange()}>{`speak: ${isSpeak ? "on" : "off"}`}</Toggle>
        <Button onClick={(e) => handleStop()} className="w-full mb-2">Stop Speech</Button>
        <div ref={containerRef} className="h-full flex flex-col overflow-y-auto overflow-x-hidden">
          {messages.length > 0
            ? messages.map((m) => (
              <div key={m.id} className={`${m.role === "user" ? "flex justify-end" : "flex justify-start"} my-1`}>
                <div
                  className={`max-w-3/4 px-4 py-2 rounded-lg ${m.role === "user" ? "bg-blue-600 text-white" : "bg-gray-200"
                    }`}
                >
                  <ReactMarkdown components={{ a: LinkRenderer }}>
                    {m.content}
                  </ReactMarkdown>

                </div>
              </div>
            ))
            : null}

          {isLoading &&
            <>
              <div className="flex justify-start">
                <h2 className="max-w-3/4 px-4 py-2 rounded-lg bg-gray-200">
                  <ReactTypingEffect
                    text={["・・・・・・・・・・・"]}
                    speed={50}
                    eraseSpeed={50}
                  />
                </h2>
              </div>
            </>
          }
        </div>
        <form onSubmit={handleAllSubmits} className="">
          <Textarea
            onCompositionStart={startComposition}
            onCompositionEnd={endComposition}
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
            onKeyDown={handleAllSubmits}
            className="w-full my-2"
          />
          <Button className="w-full mb-2">Send</Button>
        </form>
        <div className="absolute inset-x-0 top-0 h-screen z-[-1] bg-gradient-to-b from-transparent to-black rounded-b-2xl">
          <div className="flex justify-start">
            <RivGirl />
          </div>
        </div>
      </div>
    </>
  );
};
