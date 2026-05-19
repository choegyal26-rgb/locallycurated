"use client";

import dynamic from "next/dynamic";
import type { MapPin } from "@/lib/map-events";

const PosterMap = dynamic(() => import("./PosterMap"), { ssr: false });

export default function PosterMapClient({ pins }: { pins: MapPin[] }) {
  return <PosterMap pins={pins} />;
}
