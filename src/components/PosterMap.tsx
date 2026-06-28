"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import type { MapPin } from "@/lib/map-events";

type RegionId = "sf" | "eastbay" | "southbay";
type BoundsTuple = [[number, number], [number, number]];

type Props = {
  pins: MapPin[];
  issueNo: number;
  dispatchLabel: string;
};

const REGIONS: Record<RegionId, { name: string; bounds: BoundsTuple }> = {
  sf: { name: "San Francisco", bounds: [[37.706, -122.52], [37.82, -122.345]] },
  eastbay: { name: "East Bay", bounds: [[37.74, -122.3], [37.91, -122.15]] },
  southbay: { name: "South Bay", bounds: [[37.27, -122.05], [37.45, -121.8]] },
};

const NAV: Record<RegionId, { dir: "right" | "left" | "up" | "down"; to: RegionId }[]> = {
  sf: [{ dir: "right", to: "eastbay" }, { dir: "down", to: "southbay" }],
  eastbay: [{ dir: "left", to: "sf" }],
  southbay: [{ dir: "up", to: "sf" }],
};

const ARROW = { right: "→", left: "←", up: "↑", down: "↓" } as const;
const VISIBLE_AT_ONCE = 3;
const ROTATE_MS = 2200;

export default function PosterMap({ pins, issueNo, dispatchLabel }: Props) {
  const mapEl = useRef<HTMLDivElement>(null);
  const pinsRoot = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const regionRef = useRef<RegionId>("sf");
  const placePinsRef = useRef<() => void>(() => {});
  const [region, setRegion] = useState<RegionId>("sf");
  const [activeIndices, setActiveIndices] = useState<number[]>([]);

  const regionPins = useMemo(
    () => pins.filter((pin) => inBounds(pin, REGIONS[region].bounds)),
    [pins, region],
  );

  const visiblePins = useMemo(
    () => activeIndices.map((idx) => regionPins[idx]).filter(Boolean),
    [activeIndices, regionPins],
  );

  const placePins = useCallback(() => {
    const map = mapRef.current;
    const root = pinsRoot.current;
    if (!map || !root) return;

    root.innerHTML = "";
    const size = map.getSize();

    for (const event of visiblePins) {
      const point = map.latLngToContainerPoint([event.lat, event.lng]);
      const side = point.x > size.x * 0.55 ? "l" : "r";
      const el = document.createElement("div");
      el.className = `pin ${side}`;
      el.dataset.side = side;
      el.style.left = `${point.x}px`;
      el.style.top = `${point.y}px`;

      const title = event.url
        ? `<a class="title" href="${escapeHtml(event.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(event.title)}</a>`
        : `<span class="title">${escapeHtml(event.title)}</span>`;

      el.innerHTML = `
        <span class="dot"></span>
        <span class="lead"></span>
        <span class="lbl">
          <span class="meta">${escapeHtml(event.meta)}</span>
          ${title}
          ${event.sub ? `<span class="sub">${escapeHtml(event.sub)}</span>` : ""}
        </span>`;
      root.appendChild(el);
    }

    resolveLabelCollisions(root);
  }, [visiblePins]);

  useEffect(() => {
    regionRef.current = region;
  }, [region]);

  useEffect(() => {
    placePinsRef.current = placePins;
    placePins();
  }, [placePins]);

  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;

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

    mapRef.current = map;
    map.attributionControl.setPrefix("");
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
      attribution: "© OpenStreetMap · © CARTO",
      maxZoom: 19,
      minZoom: 10,
    }).addTo(map);
    map.fitBounds(REGIONS.sf.bounds, { padding: [0, 0] });

    const handleResize = () => {
      map.invalidateSize();
      map.fitBounds(REGIONS[regionRef.current].bounds, { padding: [0, 0], animate: false });
      window.setTimeout(() => placePinsRef.current(), 50);
    };

    map.whenReady(() => placePinsRef.current());
    map.on("resize moveend zoomend", () => placePinsRef.current());
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const count = Math.min(VISIBLE_AT_ONCE, regionPins.length);
    setActiveIndices(Array.from({ length: count }, (_, idx) => idx));
  }, [regionPins]);

  useEffect(() => {
    if (regionPins.length <= VISIBLE_AT_ONCE) return;
    const timer = window.setInterval(() => {
      setActiveIndices((current) => {
        const active = new Set(current);
        const candidates = regionPins
          .map((_, idx) => idx)
          .filter((idx) => !active.has(idx));
        if (candidates.length === 0) return current;
        const incoming = candidates[Math.floor(Math.random() * candidates.length)];
        return [...current.slice(1), incoming];
      });
    }, ROTATE_MS);

    return () => window.clearInterval(timer);
  }, [regionPins]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (pinsRoot.current) pinsRoot.current.innerHTML = "";
    map.flyToBounds(REGIONS[region].bounds, { padding: [0, 0], duration: 0.85 });
  }, [region]);

  return (
    <>
      <div
        id="map"
        ref={mapEl}
        role="img"
        aria-label={`${REGIONS[region].name} map with newly announced events`}
        style={{ position: "absolute", inset: 0, background: "var(--ink)" }}
      />

      <div className="corner tl">
        <b>ISSUE №{issueNo}</b>
        <i>{REGIONS[region].name}</i>
      </div>
      <div className="corner tr">
        <b>{pins.length} EVENTS · JUST ANNOUNCED</b>
        <i>all upcoming, none past</i>
      </div>
      <div className="corner br">
        <b>NEXT DISPATCH · {dispatchLabel.toUpperCase()}</b>
        <i>↓ subscribe below</i>
      </div>

      <div className="region-nav">
        {NAV[region].map(({ dir, to }) => (
          <button
            key={`${dir}-${to}`}
            type="button"
            className={`rnav ${dir}`}
            aria-label={`Travel to ${REGIONS[to].name}`}
            onClick={() => setRegion(to)}
          >
            <span className="ar">{ARROW[dir]}</span>
            <span className="rl">{REGIONS[to].name}</span>
          </button>
        ))}
      </div>

      {regionPins.length === 0 && (
        <div className="map-empty">
          <b>Nothing in {REGIONS[region].name}, yet</b>
          <i>new events land every dispatch · check back Sunday</i>
        </div>
      )}

      <div className="pins" ref={pinsRoot} />
    </>
  );
}

function inBounds(pin: MapPin, bounds: BoundsTuple) {
  return L.latLngBounds(bounds).contains([pin.lat, pin.lng]);
}

type LabelBox = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

function resolveLabelCollisions(root: HTMLElement) {
  const poster = root.closest(".poster");
  if (!poster) return;
  const posterRect = poster.getBoundingClientRect();
  const gap = 6;
  const placed: LabelBox[] = [];

  const pinEls = [...root.children]
    .filter((child): child is HTMLElement => child instanceof HTMLElement)
    .sort((a, b) => {
      const ar = a.querySelector(".lbl")?.getBoundingClientRect();
      const br = b.querySelector(".lbl")?.getBoundingClientRect();
      return (ar?.top ?? 0) - (br?.top ?? 0);
    });

  for (const el of pinEls) {
    const label = el.querySelector(".lbl");
    if (!(label instanceof HTMLElement)) continue;

    const r = label.getBoundingClientRect();
    const minTop = posterRect.top + gap;
    const maxBottom = posterRect.bottom - gap;
    let best = 0;
    let found = false;

    for (let step = 0; step <= 240 && !found; step += 4) {
      for (const dy of step === 0 ? [0] : [step, -step]) {
        if (r.top + dy < minTop || r.bottom + dy > maxBottom) continue;
        const test = rectFrom(r, dy, gap);
        const hit = placed.some((p) => !isSeparate(test, p));
        if (!hit) {
          best = dy;
          found = true;
          break;
        }
      }
    }

    if (!found) {
      if (r.bottom > maxBottom) best = maxBottom - r.bottom;
      if (r.top + best < minTop) best = minTop - r.top;
    }

    if (best !== 0) {
      const x = el.dataset.side === "l" ? "calc(-100% + 5px)" : "-5px";
      el.style.transform = `translate(${x}, ${-5 + best}px)`;
    }

    placed.push(rectFrom(r, best, gap));
  }
}

function rectFrom(r: DOMRect, dy: number, gap: number): LabelBox {
  return {
    top: r.top + dy - gap,
    bottom: r.bottom + dy + gap,
    left: r.left - gap,
    right: r.right + gap,
  };
}

function isSeparate(a: LabelBox, b: LabelBox) {
  return a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
