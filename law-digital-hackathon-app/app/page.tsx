"use client";

import { RivRobot } from "@/components/RivRobot";
import { Button } from "@/components/ui/button";
import Image from "next/image";
// 1. Import statement
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// 2. Default function for HomePage component

export default function HomePage() {
  const router = useRouter();
  // 3. Handling the button click event
  const handleClick = () => {
    router.push(`/chat`);
  };

  // 4. Rendering the HomePage component
  return (
    <div className="min-h-screen items-center justify-center">

      <div className="min-h-screen flex items-center justify-center">
        <Button className="mt-6" onClick={handleClick}>法律の女神を呼び醒ます</Button>
        <div className="absolute h-screen z-[-1]">
          <div className="text-center justify-center">
            <RivRobot />
          </div>
        </div>
        <div className="absolute h-screen z-[-2]" style={{ width: '100%', height: '100%' }}>
          <Image alt="back" src="/images/dark_wall.jpg" layout="fill" />
        </div>
      </div>
    </div>
  );
}
