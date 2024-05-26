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
    <div>
      <SignedOut>
        <GlowingStarsBackgroundCard>
          <GlowingStarsTitle className="container flex justify-center space-x-2 pt-6">
            <p>Let's get you</p>
            <Button variant={"secondary"}>
              <SignInButton />
            </Button>
          </GlowingStarsTitle>
          <GlowingStarsDescription></GlowingStarsDescription>
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
