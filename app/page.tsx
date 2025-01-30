"use client";
import React, { useEffect, useState } from "react";
import SimliAgent from "@/app/SimliAgent";
import DottedFace from "./Components/DottedFace";
import SimliHeaderLogo from "./Components/Logo";
import Navbar from "./Components/Navbar";
import Image from "next/image";
import GitHubLogo from "@/media/github-mark-white.svg";
import Link from "next/link";

const Demo: React.FC = () => {
  const [showDottedFace, setShowDottedFace] = useState(true);
  const [customerId, setCustomerId] = useState<string | null>(null);

  const onStart = () => {
    console.log("Setting setshowDottedface to false...");
    setShowDottedFace(false);
  };

  const onClose = () => {
    console.log("Setting setshowDottedface to true...");
    setShowDottedFace(true);
  };

  return (
    <div className="bg-black min-h-[100dvh] h-[100dvh] overflow-y-auto flex flex-col items-center font-abc-repro font-normal text-sm text-white p-8 relative">
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-6">
        <a 
          href="https://vitorbruno.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center space-x-2"
        >
          <Image 
            src="https://vitorbruno.com/wp-content/uploads/2023/07/Vitor-Bruno-Logo-blue.png"
            alt="Vitor Bruno Logo"
            width={150}
            height={50}
            className="hover:opacity-80 transition-opacity"
          />
        </a>
        
        <a
          href="https://github.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold cursor-pointer text-xl leading-8"
        >
          <Image className="w-[20px] inline mr-2" src={GitHubLogo} alt="GitHub" />
        </a>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="flex flex-col items-center gap-6 bg-effect15White p-6 pb-[40px] rounded-xl w-full max-h-full">
          <SimliHeaderLogo className="!top-[100px]" />
          <div>
            {showDottedFace && <DottedFace />}
            <SimliAgent
              onStart={onStart}
              onClose={onClose}
              customerId={customerId}
            />
          </div>
        </div>
      </div>

      {/* Footer Copyright */}
      <div className="absolute bottom-4 text-white text-sm">
        © {new Date().getFullYear()} VitorBruno.com - All rights reserved
      </div>
    </div>
  );
};

export default Demo;
