"use client";

import React from "react";

type Scene3DBackgroundProps = {
  className?: string;
  subtle?: boolean;
};

export function Scene3DBackground({ className = "", subtle = false }: Scene3DBackgroundProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div className={`absolute inset-0 ${subtle ? "opacity-[0.16]" : "opacity-[0.28]"} bg-3d-grid`} />
      <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl orb-rotate" />
      <div className="absolute top-1/4 -right-20 h-72 w-72 rounded-full bg-cyan-400/16 blur-3xl orb-float" />
      <div className="absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-fuchsia-400/12 blur-3xl orb-rotate" />
      <div className="absolute bottom-12 right-16 h-24 w-24 rounded-full bg-emerald-300/25 orb-float orb-glow" />
    </div>
  );
}

