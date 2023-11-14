"use client"
// 1. Import statements
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatArea } from "@/components/ChatArea";

// 2. Default function for Chat component
export default function Chat() {

  // 3. Rendering the Chat component
  return (
    <div className="w-full h-screen flex justify-between items-center">
      {/* <Sidebar userId={userId} /> */}
      <ChatArea />
    </div>
  );
}
