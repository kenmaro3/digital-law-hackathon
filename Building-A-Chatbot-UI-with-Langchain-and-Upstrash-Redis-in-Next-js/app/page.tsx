"use client";

import { RivGirl } from "@/components/RivGirl";
import { RivRobot } from "@/components/RivRobot";
import { Button } from "@/components/ui/button";
// 1. Import statement
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// 2. Default function for HomePage component

export default function HomePage() {
  const router = useRouter();
  const userId = "UUID-abc123";
  // 3. Handling the button click event
  const handleClick = () => {
    const timestamp = Math.round(new Date().getTime());
    router.push(`/chat-history/${userId}-${timestamp}`);
  };

  // 4. Rendering the HomePage component
  return (
    <>
      <div className="min-h-screen items-center justify-center">

        <div className="min-h-screen flex items-center justify-center">
          <Button className="mt-6" onClick={handleClick}>Talk to Sexy Layer</Button>
          <div className="absolute h-screen z-[-1]">
            <div className="text-center justify-center">
              <RivRobot />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
