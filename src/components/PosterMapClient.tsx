"use client";

import dynamic from "next/dynamic";
import type { MapPin } from "@/lib/map-events";

const PosterMap = dynamic(() => import("./PosterMap"), { ssr: false });

export default function PosterMapClient({
  pins,
  issueNo,
  dispatchLabel,
}: {
  pins: MapPin[];
  issueNo: number;
  dispatchLabel: string;
}) {
  return <PosterMap pins={pins} issueNo={issueNo} dispatchLabel={dispatchLabel} />;
}
