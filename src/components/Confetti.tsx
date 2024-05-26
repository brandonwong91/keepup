"use client";
import Fireworks from "react-canvas-confetti/dist/presets/fireworks";

import React, { useRef } from "react";
import { Button } from "./ui/button";
import { SignedOut, SignInButton, SignedIn, useUser } from "@clerk/nextjs";
import {
  GlowingStarsBackgroundCard,
  GlowingStarsDescription,
  GlowingStarsTitle,
} from "./ui/glowing-stars";

const Confetti = () => {
  const user = useUser();
  const controller = useRef<{ shoot: () => void } | null>(null);
  const onInitHandler = ({ conductor }: { conductor: any }) => {
    controller.current = conductor;
  };
  const onShoot = () => {
    if (controller.current) {
      controller?.current.shoot();
    }
  };
  return (
    <div className="flex flex-col items-center p-4 md:p-20">
      <SignedOut>
        <GlowingStarsBackgroundCard className="h-[100vh] content-center text-center">
          <GlowingStarsTitle className="flex flex-col items-center justify-center gap-2 sm:pt-6 md:flex-row">
            <p className="">Let's get you</p>
            <Button variant={"secondary"}>
              <SignInButton />
            </Button>
          </GlowingStarsTitle>
          <GlowingStarsDescription className="mx-auto pt-2">
            To start your workout
          </GlowingStarsDescription>
        </GlowingStarsBackgroundCard>
      </SignedOut>
      <SignedIn>
        <Button onClick={onShoot}>Time to party {user.user?.firstName}</Button>
        <Fireworks onInit={onInitHandler} />
      </SignedIn>
    </div>
  );
};

export default Confetti;
