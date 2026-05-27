import React, { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import JoinForm from "./components/JoinForm";
import { Quote, Moon, Sun } from "lucide-react";

function App() {
  const [isDark, setIsDark] = useState(false);
  const [showNavbarAction, setShowNavbarAction] = useState(false);
  const heroButtonRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show navbar action only when hero button is NOT intersecting (scrolled past)
        // and we are below the button (boundingClientRect.top < 0)
        setShowNavbarAction(
          !entry.isIntersecting && entry.boundingClientRect.top < 0,
        );
      },
      { threshold: 0 },
    );

    if (heroButtonRef.current) {
      observer.observe(heroButtonRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`${isDark ? "dark" : ""} font-sans selection:bg-primary selection:text-primary-foreground transition-colors duration-500`}
    >
      <div className="bg-background text-foreground min-h-screen relative">
        <Navbar showAction={showNavbarAction} />

        {/* Theme Toggle Button */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="fixed bottom-8 right-8 z-[100] bg-primary text-primary-foreground p-4 shadow-xl hover:scale-110 active:scale-95 transition-all rounded-full"
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun size={24} /> : <Moon size={24} />}
        </button>

        <main className="pt-16 mt-4 overflow-hidden">
          {/* 01. HERO: Emotional Hook */}
          <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-24 border-b border-border/10">
            <div className="max-w-7xl mx-auto w-full">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
                <div className="lg:col-span-7 space-y-12">
                  <div className="space-y-4">
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-headline font-bold tracking-tighter leading-[0.9]">
                      Don't let your day <br />
                      <span className="text-destructive italic">
                        sweep away.
                      </span>
                    </h1>
                  </div>
                  <div className="max-w-xl space-y-8">
                    <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                      It's easy to stay horizontal—blindly consuming in bed,
                      letting your day sweep away while your passions stay
                      dormant. You've slept on your interests for too long.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                      <a
                        ref={heroButtonRef}
                        href="#join"
                        className="bg-primary text-primary-foreground px-10 py-4 rounded-none font-bold text-lg tracking-tight active:scale-95 transition-all shadow-lg font-headline"
                      >
                        Start Building
                      </a>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-5 relative group">
                  <div className="aspect-4/5 bg-card overflow-hidden shadow-xl border-4 border-foreground">
                    <img
                      alt="Gritty workspace"
                      className="w-full h-full object-cover grayscale contrast-125 opacity-90 group-hover:grayscale-0 transition-all duration-700"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuANjn9pQMNSVkJuVQWs3zmKtv7szCcvQU3G9TpanuAqFJiKP0or2z225WLiCqeHnJbRtuhXb1S9pQNY5bLxz5i7_10OMZUZtvU8fS0Qc6yI-3hYoFurtlLxt9ZtUEDGq7xhjeDltfBUl8tWTHAFyVu_-Plqtn4_1CGrhkmN65yqZgImQGOseq_IQmXYj7i0kUq0Ppczsbwk7Zy9s6f9tDWP2MFOEVMdzCfTDdhDyB6XB7DZ9cwJwuXidL_XALC0tIIMRQxwq1WcGIed"
                    />
                  </div>
                  <div className="absolute -bottom-6 -right-4 bg-card p-6 shadow-xl border-4 border-foreground z-10">
                    <p className="font-mono text-[10px] text-primary mb-2">
                      The Space temple
                    </p>
                    <p className="text-sm text-muted-foreground leading-tight italic">
                      This room is an extension of my mind
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 02. IDENTITY: The Gathering */}
          <section className="bg-muted py-[108px] px-6 md:px-24">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="relative group">
                <div className="aspect-4/5 bg-card overflow-hidden shadow-xl border-4 border-foreground">
                  <img
                    alt="Focused creative hands"
                    className="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-700"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuepU3jNn5RG-cqGM6nI0QpYazfJCPPubU36EdlPSCKpv2TyZCgfHFnG0nmwAY-SdoYoSd56g0dZ_zWQLbyatgXbBDPTihoOb9xKzGyzNDk1LHWoMxPuhqFJW1ZyvUDDooryyPYTePAoWKirm9Wr2q-twq5_7GKgnfWm4BEDyzNvRoqh79CpQSF2b2cm4bXP7QlOp2HY3ijLH9hPSYNNtzplX8SnSYJ7MRDHI1SsjOV8Dg3OnIiLOMzgRSPPRHrGWFLmhdwgjnOBw"
                  />
                </div>
              </div>
              <div className="space-y-8">
                <div className="inline-block px-3 py-1 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest">
                  The Definition
                </div>
                <h2 className="font-bold text-4xl md:text-6xl tracking-tight leading-tight font-headline">
                  A gathering for people who realized that the only way to learn
                  is to build.
                </h2>
                <div className="h-2 w-24 bg-primary"></div>
                <p className="text-muted-foreground text-xl leading-relaxed">
                  Thinkspace is a community like no other, we welcome thinkers
                  and creators of all kinds to come and share their experience,
                  ideas and innovations! We truly believe that the best outcomes
                  come when you share your ideas and ideate over them with
                  people of all backgrounds.
                </p>
              </div>
            </div>
          </section>

          {/* 03. THE COLLECTIVE: One Table */}
          <section className="py-[108px] px-6 md:px-24 bg-background">
            <div className="max-w-7xl mx-auto">
              <div className="dark relative overflow-hidden bg-background text-foreground p-12 md:p-24 min-h-[550px] flex flex-col justify-center group shadow-2xl border-4 border-primary">
                <img
                  alt="Shared creative workspace"
                  className="absolute inset-0 w-full h-full object-cover grayscale opacity-10 contrast-150"
                  src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop"
                />
                <div className="relative z-10 max-w-5xl">
                  <h2 className="text-5xl md:text-7xl lg:text-7xl font-bold tracking-tighter leading-[0.9] mb-16 font-headline">
                    Artist, developer, songwriter, photographer. <br />
                    <span className="text-primary italic pt-3">
                      It doesn't matter.
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                    <p className="text-xl md:text-2xl opacity-80 leading-relaxed">
                      The best ideas don't happen in a vacuum. We organize
                      meetups for creative people of all backgrounds to tear
                      into projects and discuss new themes.
                    </p>
                    <p className="text-xl md:text-2xl opacity-80 leading-relaxed">
                      We’re here to stop sleeping on our potential and start
                      learning from the people who think nothing like us. You
                      won't know what you're capable of until you get up and
                      build.
                    </p>
                  </div>
                  <div className="mt-20 pt-10 border-t border-foreground/20 flex flex-wrap gap-8 items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-[10px] opacity-60 uppercase">
                      <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center animate-pulse">
                        ●
                      </span>
                      Photo by{" "}
                      <a href="https://unsplash.com/@headwayio?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">
                        Headway
                      </a>{" "}
                      on{" "}
                      <a href="https://unsplash.com/photos/black-smartphone-near-person-5QgIuuBxKwM?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">
                        Unsplash
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 04. BREAKER: The Jobs Quote */}
          <section className="py-[108px] px-6 md:px-24 bg-primary text-primary-foreground">
            <div className="max-w-5xl mx-auto relative">
              <Quote className="w-32 h-32 opacity-10 absolute -top-12 -left-12 rotate-180" />
              <blockquote className="font-bold text-4xl md:text-6xl leading-tight relative z-10 font-headline">
                "Remembering that you are going to die is the best way I know to
                avoid the trap of thinking you have something to lose. You are
                already naked. There is no reason not to follow your heart."
              </blockquote>
              <div className="mt-12 font-mono text-sm tracking-widest uppercase opacity-60">
                — Steve Jobs
              </div>
            </div>
          </section>

          {/* 05. RESOLUTION: Final Call with Embedded Form */}
          <section
            id="join"
            className="py-[108px] lg:py-[170px] bg-background overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-6 md:px-24 text-foreground">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
                <div className="lg:sticky lg:top-32">
                  <h2 className="text-6xl md:text-8xl lg:text-8xl font-bold tracking-tighter leading-[0.9] mb-12 font-headline">
                    Stop dreaming. <br />
                    <span className="text-primary">Start building.</span>
                  </h2>
                  <div className="space-y-6 max-w-md">
                    <p className="text-xl text-muted-foreground leading-relaxed">
                      Capacity is strictly regulated to maintain high kinetic
                      energy. We review applications weekly.
                    </p>
                    <div className="flex items-center gap-4 text-primary font-mono text-sm uppercase tracking-widest">
                      <span className="w-12 h-px bg-primary"></span>
                      Registration Open
                    </div>
                  </div>
                </div>

                <div className="bg-card p-8 md:p-12 shadow-2xl border-4 border-foreground relative">
                  <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
                  <JoinForm />
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
