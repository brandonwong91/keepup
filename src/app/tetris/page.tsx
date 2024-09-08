"use client";

import React from "react";
import Tetris from "react-tetris-ts";

const TetrisPage = () => {
  return (
    <div className="absolute w-full">
      <Tetris height={""} />
    </div>
  );
};

export default TetrisPage;
