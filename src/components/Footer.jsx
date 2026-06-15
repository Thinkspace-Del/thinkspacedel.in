import React from "react";

export default function Footer() {
  return (
    <footer className="w-full py-12 px-6 md:px-24 bg-surface-container-low border-t border-on-surface/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8 w-full text-on-surface">
        <div className="space-y-4">
          <div className="text-lg font-black font-headline">Thinkspace</div>
          <p className="font-mono text-xs uppercase tracking-widest text-on-surface-variant opacity-70">
            © Keep thinking. Keep Building.
          </p>
        </div>
        <div className="flex flex-wrap gap-12">
          <div className="space-y-4">
            <p className="font-mono text-xs uppercase tracking-widest font-bold">
              Social
            </p>
            <div className="flex flex-col gap-2">
              {/* <a
                className="font-mono text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary underline decoration-2 underline-offset-4 transition-all"
                href="#"
              >
                Twitter
              </a>*/}
              <a
                className="font-mono text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary underline decoration-2 underline-offset-4 transition-all"
                href="https://instagram.com/thinkspacedel"
              >
                Instagram
              </a>
              <a
                className="font-mono text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary underline decoration-2 underline-offset-4 transition-all"
                href="https://github.com/Thinkspace-Del"
              >
                GitHub
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-6 md:pt-0">
            <div className="font-mono text-[10px] text-on-surface-variant uppercase opacity-60">
              System Status
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-primary">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              BUILDING
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
