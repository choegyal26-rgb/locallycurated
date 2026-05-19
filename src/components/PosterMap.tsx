"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import type { MapPin } from "@/lib/map-events";

type Props = {
  pins: MapPin[];
};

const SF_BOUNDS = L.latLngBounds([37.706, -122.52], [37.82, -122.345]);

export default function PosterMap({ pins }: Props) {
  const mapEl = useRef<HTMLDivElement>(null);
  const pinsRoot = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapEl.current) return;

    const map = L.map(mapEl.current, {
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: false,
      doubleClickZoom: false,
      touchZoom: false,
      boxZoom: false,
      keyboard: false,
      attributionControl: true,
    });
    map.fitBounds(SF_BOUNDS, { padding: [0, 0] });
    map.attributionControl.setPrefix("");
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
      attribution: "© OpenStreetMap · © CARTO",
      maxZoom: 19,
      minZoom: 11,
    }).addTo(map);

    mapRef.current = map;

    function placePins() {
      const root = pinsRoot.current;
      if (!root) return;
      root.innerHTML = "";
      const size = map.getSize();
      pins.forEach((e) => {
        const p = map.latLngToContainerPoint([e.lat, e.lng]);
        const side = p.x > size.x * 0.55 ? "l" : "r";
        const el = document.createElement("div");
        el.className = "pin " + side;
        el.dataset.side = side;
        el.style.left = p.x + "px";
        el.style.top = p.y + "px";
        el.innerHTML = `
          <span class="dot"></span>
          <span class="lead"></span>
          <span class="lbl">
            <span class="meta">${escapeHtml(e.meta)}</span>
            <span class="title">${escapeHtml(e.title)}</span>
            <span class="sub">${escapeHtml(e.sub)}</span>
          </span>`;
        root.appendChild(el);
      });

      // collision resolution: push overlapping labels downward
      const pinEls = [...root.children].sort((a, b) => {
        const aRect = (a as HTMLElement).querySelector(".lbl")!.getBoundingClientRect();
        const bRect = (b as HTMLElement).querySelector(".lbl")!.getBoundingClientRect();
        return aRect.top - bRect.top;
      });
      const placed: Array<{ top: number; bottom: number; left: number; right: number }> = [];
      pinEls.forEach((node) => {
        const el = node as HTMLElement;
        const r = el.querySelector(".lbl")!.getBoundingClientRect();
        const pad = 6;
        let dy = 0;
        while (dy < 180) {
          const test = {
            top: r.top + dy - pad,
            bottom: r.bottom + dy + pad,
            left: r.left - pad,
            right: r.right + pad,
          };
          const hit = placed.some(
            (p) =>
              !(test.right < p.left || test.left > p.right || test.bottom < p.top || test.top > p.bottom),
          );
          if (!hit) break;
          dy += 4;
        }
        if (dy > 0) {
          const isL = el.dataset.side === "l";
          const x = isL ? "calc(-100% + 5px)" : "-5px";
          el.style.transform = `translate(${x}, ${-5 + dy}px)`;
        }
        placed.push({ top: r.top + dy, bottom: r.bottom + dy, left: r.left, right: r.right });
      });
    }

    map.whenReady(placePins);
    map.on("resize moveend zoomend", placePins);
    const onResize = () => {
      map.invalidateSize();
      map.fitBounds(SF_BOUNDS, { padding: [0, 0], animate: false });
      setTimeout(placePins, 50);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      map.remove();
      mapRef.current = null;
    };
  }, [pins]);

  return (
    <>
      <div id="map" ref={mapEl} style={{ position: "absolute", inset: 0, background: "var(--ink)" }} />
      <div className="pins" ref={pinsRoot} />
    </>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
