import React from "react";

const VIDEO_ID = "5Q2yLC0WOcs";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Muted, looping, chrome-less YouTube clip, desaturated and tinted red.
// The blurred thumbnail sits underneath so the frame is never empty while the
// video loads (or if it is blocked). Reduced-motion visitors get the still only.
export default function HeroMedia() {
  const playVideo = !prefersReducedMotion();

  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    loop: "1",
    playlist: VIDEO_ID,
    controls: "0",
    disablekb: "1",
    fs: "0",
    iv_load_policy: "3",
    cc_load_policy: "0",
    modestbranding: "1",
    playsinline: "1",
    rel: "0",
    enablejsapi: "1",
    origin: window.location.origin,
  });

  const muteOnLoad = (e) => {
    const w = e.target.contentWindow;
    if (!w) return;
    w.postMessage(
      JSON.stringify({ event: "command", func: "mute", args: [] }),
      "*",
    );
  };

  return (
    <div className="ts-hero" aria-hidden="true">
      <div className="ts-hero-fill ts-hero-stage">
        <img
          className="ts-hero-fill ts-hero-still"
          src={`https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`}
          alt=""
        />
        {playVideo && (
          <iframe
            className="ts-hero-video"
            title="Thinkspace"
            src={`https://www.youtube.com/embed/${VIDEO_ID}?${params}`}
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            tabIndex={-1}
            onLoad={muteOnLoad}
          />
        )}
      </div>
      <div className="ts-hero-fill ts-hero-tint" />
    </div>
  );
}
