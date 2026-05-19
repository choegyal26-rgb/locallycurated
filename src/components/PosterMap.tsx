"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import type { MapPin } from "@/lib/map-events";

type Props = {
  pins: MapPin[];
};

const SF_BOUNDS = L.latLngBounds([37.706, -122.52], [37.82, -122.345]);
const VISIBLE_AT_ONCE = 3;
const ROTATE_MS = 2200; // a pin holds for ~2.2s before being swapped
const FADE_MS = 450;    // fade in/out transition duration

export default function PosterMap({ pins }: Props) {
  const mapEl = useRef<HTMLDivElement>(null);
  const pinsRoot = useRef<HTMLDivElement>(null);

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

    /** Build pin DOM nodes once; we never re-create, just toggle opacity. */
    function renderAll() {
      const root = pinsRoot.current;
      if (!root) return;
      root.innerHTML = "";
      const size = map.getSize();
      pins.forEach((e, idx) => {
        const p = map.latLngToContainerPoint([e.lat, e.lng]);
        const side = p.x > size.x * 0.55 ? "l" : "r";
        const el = document.createElement("div");
        el.className = "pin " + side;
        el.dataset.idx = String(idx);
        el.style.left = p.x + "px";
        el.style.top = p.y + "px";
        el.style.opacity = "0";
        el.style.transition = `opacity ${FADE_MS}ms ease`;
        el.innerHTML = `
          <span class="dot"></span>
          <span class="lead"></span>
          <span class="lbl">
            <span class="meta">${escapeHtml(e.meta)}</span>
            <span class="title">${escapeHtml(e.title)}</span>
          </span>`;
        root.appendChild(el);
      });
    }

    /** Pick a fresh index that's not in the active set right now. */
    function pickNext(active: Set<number>): number {
      const candidates = pins.map((_, i) => i).filter((i) => !active.has(i));
      if (candidates.length === 0) return -1;
      return candidates[Math.floor(Math.random() * candidates.length)];
    }

    /** Set opacity of pin by index. */
    function setVisible(idx: number, visible: boolean) {
      const root = pinsRoot.current;
      if (!root) return;
      const el = root.querySelector<HTMLElement>(`[data-idx="${idx}"]`);
      if (el) el.style.opacity = visible ? "1" : "0";
    }

    let active: number[] = [];
    let cycle: ReturnType<typeof setInterval> | null = null;

    function startCycle() {
      if (pins.length === 0) return;
      // Initial fill: pick up to VISIBLE_AT_ONCE distinct random indices
      active = [];
      const initialSet = new Set<number>();
      while (active.length < Math.min(VISIBLE_AT_ONCE, pins.length)) {
        const next = pickNext(initialSet);
        if (next < 0) break;
        initialSet.add(next);
        active.push(next);
      }
      // Reveal them
      active.forEach((i) => setVisible(i, true));

      // Now cycle: every ROTATE_MS, swap the oldest one for a fresh random one
      cycle = setInterval(() => {
        if (pins.length <= VISIBLE_AT_ONCE) return; // nothing to rotate to
        const outgoing = active.shift();
        if (outgoing !== undefined) setVisible(outgoing, false);
        // After the fade-out completes, swap in a new one
        setTimeout(() => {
          const incoming = pickNext(new Set(active));
          if (incoming < 0) return;
          active.push(incoming);
          setVisible(incoming, true);
        }, FADE_MS);
      }, ROTATE_MS);
    }

    function onResize() {
      map.invalidateSize();
      map.fitBounds(SF_BOUNDS, { padding: [0, 0], animate: false });
      // Re-render positions; active set continues
      const prevActive = [...active];
      renderAll();
      // Restore visibility of the active ones after re-render
      prevActive.forEach((i) => setVisible(i, true));
    }

    map.whenReady(() => {
      renderAll();
      startCycle();
    });
    map.on("resize moveend zoomend", onResize);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (cycle) clearInterval(cycle);
      map.remove();
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
