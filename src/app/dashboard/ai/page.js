"use client";

import {
  Pause, SkipForward, Volume2, Maximize,
  Paperclip, Smile, Send, Share, Bookmark,
  Folder, Image as ImageIcon, Lock, UserPlus, Play
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

export default function LiveClassDashboard() {
  return (
    <div className="animate-fade-in flex h-full flex-col gap-6">
      <header>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Live class
        </h1>
      </header>

      <div className="grid min-h-[400px] grid-cols-1 gap-6 lg:grid-cols-[2.2fr_1fr]">
        {/* Video player */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-transparent bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-success" />
                </span>
                Live
              </span>
              <h2 className="text-lg font-semibold text-foreground">Design patterns</h2>
              <span aria-hidden className="text-border">|</span>
              <span className="text-sm text-muted-foreground">by</span>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="https://i.pravatar.cc/150?u=rachel" alt="Rachel Zang" />
                  <AvatarFallback>RZ</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground">Rachel Zang</span>
              </div>
            </div>
            <div className="flex items-center">
              <Avatar className="-ml-2 h-8 w-8 border-2 border-card first:ml-0">
                <AvatarImage src="https://i.pravatar.cc/150?u=1" alt="Participant" />
                <AvatarFallback>P1</AvatarFallback>
              </Avatar>
              <Avatar className="-ml-2 h-8 w-8 border-2 border-card">
                <AvatarImage src="https://i.pravatar.cc/150?u=2" alt="Participant" />
                <AvatarFallback>P2</AvatarFallback>
              </Avatar>
              <Avatar className="-ml-2 h-8 w-8 border-2 border-card">
                <AvatarImage src="https://i.pravatar.cc/150?u=3" alt="Participant" />
                <AvatarFallback>P3</AvatarFallback>
              </Avatar>
              <Avatar className="-ml-2 h-8 w-8 border-2 border-card">
                <AvatarImage src="https://i.pravatar.cc/150?u=4" alt="Participant" />
                <AvatarFallback>P4</AvatarFallback>
              </Avatar>
              <span className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-secondary text-xs font-medium tabular-nums text-secondary-foreground">
                +9
              </span>
            </div>
          </div>

          <div className="relative h-[380px] w-full overflow-hidden rounded-xl border border-border bg-navy">
            <img
              src="https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069&auto=format&fit=crop"
              alt="Instructor presenting the live class"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-6 bottom-6 flex items-center justify-between rounded-md border border-border bg-card/95 px-4 py-2.5 shadow-sm">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Pause">
                  <Pause size={18} />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Skip forward">
                  <SkipForward size={18} />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Volume">
                  <Volume2 size={18} />
                </Button>
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Fullscreen">
                <Maximize size={18} />
              </Button>
            </div>
          </div>
        </section>

        {/* Group chat */}
        <section className="flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Group chat</h3>

          <ScrollArea className="-mr-2 flex-1 pr-2">
            <div className="flex flex-col gap-5">
              <div className="flex items-start gap-3">
                <Avatar className="mt-1 h-8 w-8 shrink-0">
                  <AvatarImage src="https://i.pravatar.cc/150?u=5" alt="Classmate" />
                  <AvatarFallback>C</AvatarFallback>
                </Avatar>
                <div className="flex max-w-[80%] flex-col gap-1">
                  <span className="px-1 text-xs tabular-nums text-muted-foreground">14:33</span>
                  <div className="rounded-md rounded-tl-sm bg-muted px-3 py-2 text-sm leading-relaxed text-foreground">
                    Could you show some examples of what you consider to be the best practice of existing mobile onboardings?
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Avatar className="mt-1 h-8 w-8 shrink-0">
                  <AvatarImage src="https://i.pravatar.cc/150?u=rachel" alt="Rachel Zang" />
                  <AvatarFallback>RZ</AvatarFallback>
                </Avatar>
                <div className="flex max-w-[80%] flex-col gap-1">
                  <span className="px-1 text-xs tabular-nums text-muted-foreground">14:34</span>
                  <div className="rounded-md rounded-tl-sm bg-muted px-3 py-2 text-sm leading-relaxed text-foreground">
                    Sure thing. I&apos;ve saved some for you.
                  </div>
                </div>
              </div>

              <div className="flex items-start justify-end gap-3">
                <div className="flex max-w-[80%] flex-col items-end gap-1">
                  <span className="px-1 text-xs tabular-nums text-muted-foreground">14:35</span>
                  <div className="rounded-md rounded-tr-sm bg-primary px-3 py-2 text-sm leading-relaxed text-primary-foreground">
                    That&apos;s awesome, thanks.
                  </div>
                </div>
                <Avatar className="mt-1 h-8 w-8 shrink-0">
                  <AvatarImage src="https://i.pravatar.cc/150?u=me" alt="You" />
                  <AvatarFallback>You</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </ScrollArea>

          <div className="mt-4">
            <p className="mb-2 px-1 text-xs text-muted-foreground">Mike is typing…</p>
            <div className="flex items-center gap-1 rounded-md border border-input bg-background p-1.5 transition-colors focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Attach file">
                <Paperclip size={18} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Add emoji">
                <Smile size={18} />
              </Button>
              <input
                type="text"
                placeholder="Type a message…"
                aria-label="Message"
                className="flex-1 border-none bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <Button size="icon" className="h-8 w-8" aria-label="Send message">
                <Send size={18} />
              </Button>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Content */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Content</h3>
          <ol className="relative flex flex-col gap-5 before:absolute before:bottom-3 before:left-[15px] before:top-7 before:w-px before:bg-border">
            <li className="relative z-[1] flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground">
                <Folder size={16} />
              </span>
              <span className="flex-1 text-sm font-medium text-foreground">Introduction</span>
              <span className="text-xs tabular-nums text-muted-foreground">2 min</span>
            </li>
            <li className="relative z-[1] flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary/40 bg-brand-green-soft text-primary">
                <ImageIcon size={16} />
              </span>
              <span className="flex-1 text-sm font-medium text-foreground">Landing page</span>
              <span className="text-xs tabular-nums text-muted-foreground">15 min</span>
            </li>
            <li className="relative z-[1] flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground">
                <Lock size={16} />
              </span>
              <span className="flex-1 text-sm font-medium text-foreground">Login and signup</span>
              <span className="text-xs tabular-nums text-muted-foreground">20 min</span>
            </li>
            <li className="relative z-[1] flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground">
                <UserPlus size={16} />
              </span>
              <span className="flex-1 text-sm font-medium text-muted-foreground">User onboarding</span>
              <span className="text-xs tabular-nums text-muted-foreground">18 min</span>
            </li>
          </ol>
        </section>

        {/* Resources */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Resources</h3>
          <ul className="flex flex-col gap-2">
            <li className="flex items-center gap-3 rounded-md border border-transparent p-2 transition-colors hover:border-border hover:bg-accent">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-medium tabular-nums text-muted-foreground">01</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">LP design inspirations</p>
                <p className="text-xs text-muted-foreground">100+ real cases</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Share resource">
                <Share size={14} />
              </Button>
            </li>
            <li className="flex items-center gap-3 rounded-md border border-transparent p-2 transition-colors hover:border-border hover:bg-accent">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-medium tabular-nums text-muted-foreground">02</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Mobile design patterns</p>
                <p className="text-xs text-muted-foreground">Best practices used worldwide</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Share resource">
                <Share size={14} />
              </Button>
            </li>
            <li className="flex items-center gap-3 rounded-md border border-transparent p-2 transition-colors hover:border-border hover:bg-accent">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-medium tabular-nums text-muted-foreground">03</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Micro-interactions</p>
                <p className="text-xs text-muted-foreground">200 inspirational designs</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Share resource">
                <Share size={14} />
              </Button>
            </li>
            <li className="flex items-center gap-3 rounded-md border border-transparent p-2 transition-colors hover:border-border hover:bg-accent">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-medium tabular-nums text-muted-foreground">04</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">How to increase website conversion</p>
                <p className="text-xs text-muted-foreground">Practical advice</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Share resource">
                <Share size={14} />
              </Button>
            </li>
          </ul>
        </section>

        {/* Previous class records */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Previous class records</h3>
          <ul className="flex flex-col gap-3">
            <li className="flex items-center gap-3">
              <div className="relative h-[60px] w-[90px] shrink-0 overflow-hidden rounded-md border border-border">
                <img
                  src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop"
                  alt="Design accessibility recording"
                  className="h-full w-full object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-navy/40">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-card/90 text-foreground">
                    <Play size={12} fill="currentColor" />
                  </span>
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Design accessibility</p>
                <p className="mt-1 text-xs tabular-nums text-muted-foreground">05.01.2023</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Bookmark recording">
                <Bookmark size={16} />
              </Button>
            </li>
            <li className="flex items-center gap-3">
              <div className="relative h-[60px] w-[90px] shrink-0 overflow-hidden rounded-md border border-border">
                <img
                  src="https://images.unsplash.com/photo-1573164574572-cb89e39749b4?q=80&w=2069&auto=format&fit=crop"
                  alt="UX research recording"
                  className="h-full w-full object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-navy/40">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-card/90 text-foreground">
                    <Play size={12} fill="currentColor" />
                  </span>
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">UX research</p>
                <p className="mt-1 text-xs tabular-nums text-muted-foreground">04.01.2023</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Bookmark recording">
                <Bookmark size={16} />
              </Button>
            </li>
            <li className="flex items-center gap-3">
              <div className="relative h-[60px] w-[90px] shrink-0 overflow-hidden rounded-md border border-border">
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"
                  alt="Wireframing recording"
                  className="h-full w-full object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-navy/40">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-card/90 text-foreground">
                    <Play size={12} fill="currentColor" />
                  </span>
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Wireframing</p>
                <p className="mt-1 text-xs tabular-nums text-muted-foreground">04.01.2023</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Bookmark recording">
                <Bookmark size={16} />
              </Button>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
