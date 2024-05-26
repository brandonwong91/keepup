"use client";
import Fireworks from "react-canvas-confetti/dist/presets/fireworks";

import React, { useRef } from "react";
import { Button } from "./ui/button";

const Confetti = () => {
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
      <Button onClick={onShoot}>Party time</Button>
      <Fireworks onInit={onInitHandler} />
    </div>
  );
};

export default Confetti;
