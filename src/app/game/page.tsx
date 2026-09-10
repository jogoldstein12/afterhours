"use client";

import { useEffect, useState, useCallback, useRef, type PointerEvent as ReactPointerEvent, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Prompt,
  GameMode,
  GAME_MODES,
  getPromptCategory,
  type PromptCategory,
} from '@/lib/prompts';
import {
  extractDurationSeconds,
  filterDeck,
  promptById,
  renderPromptText,
  shuffledIndices,
} from '@/lib/game';
import {
  ArrowRightCircle,
  RotateCcw,
  Trash2,
  Undo2,
  UserPlus,
  Users,
  Flame,
  Wine,
  MessageCircle,
  Zap,
  Timer,
  Repeat,
  TrendingUp,
  Trophy,
  Sparkles,
  SkipForward,
  type LucideIcon,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn, playerColor, rosterFromQuery } from '@/lib/utils';
import { MAX_NAME_LENGTH, MAX_PLAYERS, MIN_PLAYERS, hasName, normalisePlayerName, normaliseRoster } from '@/lib/roster';
import {
  HISTORY_LIMIT,
  clearGame,
  isGameMode,
  readGame,
  writeGame,
  writeLastSetup,
  type StoredGame,
} from '@/lib/session';
import { Separator } from '@/components/ui/separator';

// Swipe left deals the next card, swipe right steps back (undo). A gesture
// commits if it either travels past SWIPE_THRESHOLD or is a quick flick past
// FLICK_VELOCITY — so a short, fast flick works as well as a long drag.
const SWIPE_THRESHOLD = 56;
const FLICK_VELOCITY = 0.35; // px per ms

// Each mode carries its color the whole way through the screen: the card's neon
// border, the status-strip chip, the progress filament, and the selected pill.
const MODE_BORDER: Record<GameMode, string> = {
  Mild: 'neon-border-violet',
  Medium: 'neon-border-pink',
  Extreme: 'neon-border-red',
  NHIE: 'neon-border-blue',
};
const MODE_CHIP: Record<GameMode, string> = {
  Mild: 'text-primary border-primary/50 bg-primary/10',
  Medium: 'text-secondary border-secondary/50 bg-secondary/10',
  Extreme: 'text-[hsl(var(--destructive-bright))] border-destructive/50 bg-destructive/10',
  NHIE: 'text-[hsl(var(--chart-3))] border-[hsl(var(--chart-3)/0.5)] bg-[hsl(var(--chart-3)/0.12)]',
};
const MODE_FILL: Record<GameMode, string> = {
  Mild: 'bg-primary',
  Medium: 'bg-secondary',
  Extreme: 'bg-destructive',
  NHIE: 'bg-[hsl(var(--chart-3))]',
};
const MODE_SELECTED: Record<GameMode, string> = {
  Mild: 'bg-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.6)]',
  Medium: 'bg-secondary text-secondary-foreground shadow-[0_0_12px_hsl(var(--secondary)/0.6)]',
  Extreme: 'bg-destructive text-destructive-foreground shadow-[0_0_12px_hsl(var(--destructive)/0.6)]',
  NHIE: 'bg-[hsl(var(--chart-3))] text-background shadow-[0_0_12px_hsl(var(--chart-3)/0.6)]',
};

// "Turn It Up" on the finale steps the group one tier hotter; Extreme is already
// the top, so it offers no hotter path.
const HOTTER_MODE: Partial<Record<GameMode, GameMode>> = {
  Mild: 'Medium',
  Medium: 'Extreme',
  NHIE: 'Extreme',
};

// Card-kind badge shown on each prompt so a dare, a drink rule, a question, and
// a Never-Have-I-Ever each read as their own thing before it is read aloud.
const CATEGORY_META: Record<PromptCategory, { label: string; Icon: LucideIcon; className: string }> = {
  nhie: { label: 'Never Have I Ever', Icon: Zap, className: 'text-[hsl(var(--chart-3))]' },
  timed: { label: 'Timed Dare', Icon: Timer, className: 'text-secondary' },
  drink: { label: 'Drink', Icon: Wine, className: 'text-primary' },
  question: { label: 'Question', Icon: MessageCircle, className: 'text-primary' },
  dare: { label: 'Dare', Icon: Flame, className: 'text-secondary' },
};

const formatSeconds = (total: number): string =>
  `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;

// Scale the prompt to its length so a short dare fills the card and a long
// scenario still fits — this text is read at arm's length in a dark room.
const promptSizeClass = (len: number): string => {
  if (len <= 55) return 'text-3xl sm:text-4xl md:text-5xl';
  if (len <= 110) return 'text-2xl sm:text-3xl md:text-4xl';
  if (len <= 180) return 'text-xl sm:text-2xl md:text-3xl';
  return 'text-lg sm:text-xl md:text-2xl';
};

const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
};

// `countedTurn` distinguishes a played card (which incremented the player's
// tally and advanced the rotation) from a skipped one (which did neither), so
// Undo can reverse each correctly.
type TurnSnapshot = {
  prompt: Prompt;
  playerIndex: number;
  text: string;
  upcoming: number[];
  countedTurn: boolean;
};

export default function GamePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [players, setPlayers] = useState<string[]>([]);
  // Distinguishes "still reading the URL" from "the URL has no roster", so the
  // screen can bounce to setup instead of holding a loader forever.
  const [rosterChecked, setRosterChecked] = useState(false);
  const [nsfwLevel, setNsfwLevel] = useState<GameMode>('Mild');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [processedPromptText, setProcessedPromptText] = useState<string>('');
  const [availablePrompts, setAvailablePrompts] = useState<Prompt[]>([]);
  const [usedPromptIds, setUsedPromptIds] = useState<Set<number>>(new Set());
  const [gameEnded, setGameEnded] = useState(false);
  const [cardKey, setCardKey] = useState(0);
  const [isNewGameDialogOpen, setIsNewGameDialogOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [upcomingTurns, setUpcomingTurns] = useState<number[]>([]);
  const [history, setHistory] = useState<TurnSnapshot[]>([]);
  // Running tally of how many cards each player has answered, keyed by name so
  // it survives roster edits. Feeds the "most drawn" stat on the finale.
  const [turnsByName, setTurnsByName] = useState<Record<string, number>>({});
  // The text a restored or undone card was showing, tagged with the card it
  // belongs to so the processing effect below can show it instead of deriving
  // the text again and re-rolling {{randomOtherPlayer}} onto somebody else.
  //
  // Tagged rather than a one-shot flag, which is what this was and what made it
  // wrong: hydration lands its state over more than one render, so the effect
  // runs more than once, and the first pass consumed the flag — leaving a later
  // pass to re-derive the text. Refreshing mid-card genuinely changed who the
  // card was pointing at, about half the time with four players.
  const restoredTextRef = useRef<{ promptId: number; text: string } | null>(null);
  // The level the loaded deck belongs to. The deck only (re)loads when this
  // changes, never on roster changes — adding or removing a player mid-game
  // must not reset progress.
  const deckLevelRef = useRef<GameMode | null>(null);

  // Swipe: the card tracks the finger and, past the threshold or on a flick,
  // flies off — left to deal the next card, right to step back. The transform
  // is written straight to the DOM during the drag (no React re-render per
  // move) so it stays smooth on a phone. Button parity is kept in the dock.
  const cardElRef = useRef<HTMLDivElement>(null);
  const peekElRef = useRef<HTMLDivElement>(null);
  const swipe = useRef({ x: 0, y: 0, t: 0, active: false, tracking: false, busy: false });
  const flyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const timerTotal = currentPrompt ? extractDurationSeconds(currentPrompt.text) : null;

  // A fresh prompt resets the timer to its full duration, stopped.
  useEffect(() => {
    setTimerRunning(false);
    setTimeLeft(currentPrompt ? extractDurationSeconds(currentPrompt.text) : null);
  }, [currentPrompt]);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          setTimerRunning(false);
          vibrate([100, 50, 100]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const startTimer = () => {
    setTimeLeft(timerTotal);
    setTimerRunning(true);
  };

  // The one entry point for a game's state. Setup writes a record and
  // navigates to a bare `/game`; a refresh, a locked phone, or Resume from the
  // home screen reads the same record back and puts the night where it was.
  //
  // A legacy play URL (`/game?player=...`) is honoured for exactly one read and
  // then scrubbed out of the address bar, so a bookmark from before the roster
  // moved into storage opens into a game instead of a dead end.
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const fromQuery = normaliseRoster(rosterFromQuery(query));
    if (query.toString()) window.history.replaceState(null, '', window.location.pathname);

    if (fromQuery.length >= MIN_PLAYERS) {
      const levelFromQuery = query.get('nsfwLevel');
      const level = isGameMode(levelFromQuery) ? levelFromQuery : 'Mild';
      setPlayers(fromQuery);
      setNsfwLevel(level);
      writeLastSetup({ players: fromQuery, nsfwLevel: level });
      setRosterChecked(true);
      return;
    }

    const saved = readGame();
    if (!saved) {
      setRosterChecked(true);
      return;
    }

    setPlayers(saved.players);
    setNsfwLevel(saved.nsfwLevel);
    setCurrentPlayerIndex(saved.currentPlayerIndex);

    const card = saved.currentPromptId === null ? null : promptById.get(saved.currentPromptId) ?? null;
    // A record written by Start carries a roster and nothing else; let the deck
    // effect below deal it a first card the normal way. Anything further along
    // is restored wholesale.
    if (saved.usedPromptIds.length > 0 || card || saved.gameEnded) {
      // Claim the level before the deck effect runs, so restoring does not read
      // as a mid-game level change and wipe the progress just loaded.
      deckLevelRef.current = saved.nsfwLevel;
      setAvailablePrompts(filterDeck(saved.nsfwLevel));
      setUsedPromptIds(new Set(saved.usedPromptIds));
      setUpcomingTurns(saved.upcomingTurns);
      setTurnsByName(saved.turnsByName);
      // A card whose id has since left the deck is dropped from the undo stack.
      setHistory(
        saved.history.flatMap((turn) => {
          const prompt = promptById.get(turn.promptId);
          return prompt
            ? [{ prompt, playerIndex: turn.playerIndex, text: turn.text, upcoming: turn.upcoming, countedTurn: turn.countedTurn }]
            : [];
        }),
      );
      setGameEnded(saved.gameEnded);
      if (card) {
        // Show the card exactly as it was read out, rather than re-rolling
        // {{randomOtherPlayer}} under a group that is looking at it.
        if (saved.processedPromptText) {
          restoredTextRef.current = { promptId: card.id, text: saved.processedPromptText };
        }
        setCurrentPrompt(card);
      }
    }
    setRosterChecked(true);
  }, []);

  // Mirror the live game back to storage, so a refresh, a backgrounded tab, or
  // the phone locking mid-round does not restart the night. Deliberately not
  // driven by the countdown or the swipe transform — those change constantly
  // and are not worth persisting.
  useEffect(() => {
    if (!rosterChecked || players.length === 0) return;
    const record: StoredGame = {
      players,
      nsfwLevel,
      currentPlayerIndex,
      currentPromptId: currentPrompt?.id ?? null,
      processedPromptText,
      usedPromptIds: [...usedPromptIds],
      upcomingTurns,
      turnsByName,
      history: history.map(({ prompt, playerIndex, text, upcoming, countedTurn }) => ({
        promptId: prompt.id,
        playerIndex,
        text,
        upcoming,
        countedTurn,
      })),
      gameEnded,
    };
    writeGame(record);
  }, [
    rosterChecked,
    players,
    nsfwLevel,
    currentPlayerIndex,
    currentPrompt,
    processedPromptText,
    usedPromptIds,
    upcomingTurns,
    turnsByName,
    history,
    gameEnded,
  ]);

  // Reaching /game without a roster — a bookmark, a shared link with the query
  // stripped, a crawler — used to hold "Charging Neon..." forever with no way
  // out. Send them to setup instead.
  useEffect(() => {
    if (rosterChecked && players.length === 0) router.replace('/');
  }, [rosterChecked, players.length, router]);

  // Tint the nightclub atmosphere (R6) to the mode in play. Cleared on unmount
  // so the setup lobby falls back to the default violet/pink night.
  useEffect(() => {
    document.documentElement.dataset.mode = nsfwLevel;
    return () => { delete document.documentElement.dataset.mode; };
  }, [nsfwLevel]);

  useEffect(() => () => { if (flyTimeout.current) clearTimeout(flyTimeout.current); }, []);

  // Keep the screen awake during play — pass-the-phone games have long gaps
  // between touches and the phone sleeping mid-card kills the momentum.
  useEffect(() => {
    if (!('wakeLock' in navigator)) return;
    let sentinel: WakeLockSentinel | null = null;
    const request = async () => {
      try {
        sentinel = await navigator.wakeLock.request('screen');
      } catch {
        sentinel = null;
      }
    };
    request();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') request();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      sentinel?.release().catch(() => {});
    };
  }, []);

  const selectNewPrompt = useCallback((promptsToUse: Prompt[], currentUsedIds: Set<number>) => {
    const remainingPrompts = promptsToUse.filter(p => !currentUsedIds.has(p.id));
    if (remainingPrompts.length === 0) {
      setGameEnded(true);
      setCurrentPrompt(null);
      return null;
    }
    const randomIndex = Math.floor(Math.random() * remainingPrompts.length);
    const newPrompt = remainingPrompts[randomIndex];
    setCurrentPrompt(newPrompt);
    setCardKey(prevKey => prevKey + 1);
    return newPrompt;
  }, []);

  const loadAndFilterPrompts = useCallback(() => {
    const filtered = filterDeck(nsfwLevel);
    setAvailablePrompts(filtered);
    setUsedPromptIds(new Set());
    setGameEnded(false);
    setHistory([]);
    setUpcomingTurns([]);
    setTurnsByName({});
    return filtered;
  }, [nsfwLevel]);

  const restartGame = useCallback(() => {
    setCurrentPlayerIndex(0);
    const freshPrompts = loadAndFilterPrompts();
    if (freshPrompts.length > 0) {
      selectNewPrompt(freshPrompts, new Set());
    } else {
      setCurrentPrompt(null);
      setGameEnded(true);
    }
    setIsNewGameDialogOpen(false);
  }, [loadAndFilterPrompts, selectNewPrompt]);

  const handleNsfwLevelChange = (newLevel: GameMode) => {
    setNsfwLevel(newLevel);
  };

  // "This crew" is the roster as it stands, which may have changed mid-game.
  // Heading back to setup keeps the crew and ends the saved game — otherwise
  // setup would offer to resume the night the group just walked away from.
  const leaveToSetup = useCallback(() => {
    writeLastSetup({ players, nsfwLevel });
    clearGame();
    router.push('/');
  }, [players, nsfwLevel, router]);

  useEffect(() => {
    if (players.length === 0 || deckLevelRef.current === nsfwLevel) return;
    deckLevelRef.current = nsfwLevel;
    const newPrompts = loadAndFilterPrompts();
    selectNewPrompt(newPrompts, new Set());
  }, [nsfwLevel, players.length, loadAndFilterPrompts, selectNewPrompt]);

  // A restored game can come back without a card: the saved id no longer
  // resolves because the deck changed under it. The effect above has already
  // claimed the level and will not deal one, so the group would be left staring
  // at an empty card. Deal the next one instead of restarting the night.
  useEffect(() => {
    if (!rosterChecked || gameEnded || currentPrompt || availablePrompts.length === 0) return;
    selectNewPrompt(availablePrompts, usedPromptIds);
  }, [rosterChecked, gameEnded, currentPrompt, availablePrompts, usedPromptIds, selectNewPrompt]);

  useEffect(() => {
    // Held until a different card is actually dealt, so every render of the
    // same restored card shows the same words. The `currentPrompt` guard on the
    // clear matters: this effect also runs on mount, before hydration's state
    // has landed, and clearing then would throw the restored text away before
    // the card it belongs to ever arrives.
    const restored = restoredTextRef.current;
    if (restored && currentPrompt) {
      if (restored.promptId === currentPrompt.id) {
        setProcessedPromptText(restored.text);
        return;
      }
      restoredTextRef.current = null;
    }

    if (gameEnded) {
      setProcessedPromptText("Game Over! You've gone through all the prompts for this level.");
    } else if (currentPrompt && players.length > 0) {
      setProcessedPromptText(renderPromptText(currentPrompt, players, currentPlayerIndex));
    }
  }, [currentPrompt, players, currentPlayerIndex, gameEnded]);

  const handleNextPlayer = useCallback(() => {
    if (gameEnded || !currentPrompt) return;
    vibrate(12);

    const outgoing = players[currentPlayerIndex];
    if (outgoing) setTurnsByName(prev => ({ ...prev, [outgoing]: (prev[outgoing] ?? 0) + 1 }));

    setHistory(prev => [
      ...prev.slice(-(HISTORY_LIMIT - 1)),
      { prompt: currentPrompt, playerIndex: currentPlayerIndex, text: processedPromptText, upcoming: upcomingTurns, countedTurn: true },
    ]);

    const newUsedPromptIds = new Set(usedPromptIds);
    newUsedPromptIds.add(currentPrompt.id);
    setUsedPromptIds(newUsedPromptIds);

    let queue = upcomingTurns.filter(i => i < players.length);
    if (queue.length === 0) queue = shuffledIndices(players.length, currentPlayerIndex);
    setCurrentPlayerIndex(queue[0]);
    setUpcomingTurns(queue.slice(1));

    selectNewPrompt(availablePrompts, newUsedPromptIds);
  }, [gameEnded, currentPrompt, players, currentPlayerIndex, processedPromptText, upcomingTurns, usedPromptIds, availablePrompts, selectNewPrompt]);

  // Pass on a card without doing it. Deals a fresh prompt to the *same* player,
  // so declining costs nothing and skips no one's turn: no tally, no rotation,
  // no penalty. Every prompt in this game is optional, and this is the control
  // that makes that true in the product rather than only in the rules.
  const handleSkip = useCallback(() => {
    if (gameEnded || !currentPrompt) return;
    vibrate(8);

    setHistory(prev => [
      ...prev.slice(-(HISTORY_LIMIT - 1)),
      { prompt: currentPrompt, playerIndex: currentPlayerIndex, text: processedPromptText, upcoming: upcomingTurns, countedTurn: false },
    ]);

    const newUsedPromptIds = new Set(usedPromptIds);
    newUsedPromptIds.add(currentPrompt.id);
    setUsedPromptIds(newUsedPromptIds);

    selectNewPrompt(availablePrompts, newUsedPromptIds);
  }, [gameEnded, currentPrompt, currentPlayerIndex, processedPromptText, upcomingTurns, usedPromptIds, availablePrompts, selectNewPrompt]);

  const handleUndo = () => {
    const last = history[history.length - 1];
    if (!last) return;
    const restoredName = players[Math.min(last.playerIndex, players.length - 1)];
    // A skipped card never incremented the tally, so undoing one must not
    // decrement it.
    if (restoredName && last.countedTurn) {
      setTurnsByName(prev => {
        const next = { ...prev };
        if (next[restoredName]) next[restoredName] -= 1;
        return next;
      });
    }
    setHistory(prev => prev.slice(0, -1));
    setUsedPromptIds(prev => {
      const next = new Set(prev);
      next.delete(last.prompt.id);
      return next;
    });
    restoredTextRef.current = { promptId: last.prompt.id, text: last.text };
    setGameEnded(false);
    setCurrentPrompt(last.prompt);
    setCurrentPlayerIndex(Math.min(last.playerIndex, players.length - 1));
    setUpcomingTurns(last.upcoming);
    setCardKey(prev => prev + 1);
  };

  // --- Swipe handlers (imperative, for a smooth 60fps drag) -----------------
  const paintDrag = (dx: number) => {
    const card = cardElRef.current;
    if (card) card.style.transform = `translateX(${dx}px) rotate(${dx * 0.02}deg)`;
    const peek = peekElRef.current;
    if (peek) {
      const p = Math.min(1, Math.abs(dx) / SWIPE_THRESHOLD);
      peek.style.opacity = String(0.2 + 0.55 * p);
      peek.style.transform = `scale(${0.93 + 0.07 * p})`;
    }
  };
  const settleCard = (animate: boolean) => {
    const card = cardElRef.current;
    if (card) {
      card.style.transition = animate ? 'transform 0.2s ease-out' : 'none';
      card.style.transform = 'translateX(0px) rotate(0deg)';
    }
    const peek = peekElRef.current;
    if (peek) {
      peek.style.transition = animate ? 'opacity 0.2s ease-out, transform 0.2s ease-out' : 'none';
      peek.style.opacity = '0';
      peek.style.transform = 'scale(0.93)';
    }
  };

  const onCardPointerDown = (e: ReactPointerEvent) => {
    if (gameEnded || !currentPrompt || swipe.current.busy) return;
    swipe.current = { x: e.clientX, y: e.clientY, t: e.timeStamp, active: true, tracking: false, busy: false };
    const card = cardElRef.current;
    if (card) card.style.transition = 'none';
  };
  const onCardPointerMove = (e: ReactPointerEvent) => {
    const s = swipe.current;
    if (!s.active || s.busy) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (!s.tracking) {
      // Decide intent once: horizontal → swipe; vertical → let the card scroll.
      if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
        s.tracking = true;
        try { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); } catch {}
      } else if (Math.abs(dy) > 8) {
        s.active = false;
        return;
      } else {
        return;
      }
    }
    paintDrag(dx);
  };
  const endDrag = (e: ReactPointerEvent) => {
    const s = swipe.current;
    if (!s.active) return;
    if (!s.tracking) { s.active = false; return; }
    const dx = e.clientX - s.x;
    const dt = Math.max(1, e.timeStamp - s.t);
    const v = dx / dt; // signed px/ms
    s.active = false;

    const goNext = dx < -SWIPE_THRESHOLD || v < -FLICK_VELOCITY;
    const goBack = dx > SWIPE_THRESHOLD || v > FLICK_VELOCITY;
    const canBack = history.length > 0;

    if (goNext && !goBack) {
      s.busy = true;
      const card = cardElRef.current;
      if (card) { card.style.transition = 'transform 0.16s ease-out'; card.style.transform = 'translateX(-115%) rotate(-6deg)'; }
      flyTimeout.current = setTimeout(() => { handleNextPlayer(); settleCard(false); s.busy = false; }, 150);
    } else if (goBack && canBack) {
      s.busy = true;
      const card = cardElRef.current;
      if (card) { card.style.transition = 'transform 0.16s ease-out'; card.style.transform = 'translateX(115%) rotate(6deg)'; }
      flyTimeout.current = setTimeout(() => { handleUndo(); settleCard(false); s.busy = false; }, 150);
    } else {
      settleCard(true);
    }
  };

  const handleAddPlayer = () => {
    const name = normalisePlayerName(newPlayerName);
    if (!name) return toast({ title: 'Player name cannot be empty.', variant: 'destructive' });
    if (players.length >= MAX_PLAYERS) return toast({ title: `Limit: ${MAX_PLAYERS} players.`, variant: 'destructive' });
    // The turn tally is keyed by name, so a second "Sam" would share one count
    // and be indistinguishable on the cards.
    if (hasName(players, name)) {
      return toast({ title: `${name} is already in`, description: 'Give this one a different name.', variant: 'destructive' });
    }

    setUpcomingTurns(prev => {
      const queue = [...prev];
      queue.splice(Math.floor(Math.random() * (queue.length + 1)), 0, players.length);
      return queue;
    });
    setPlayers(prev => [...prev, name]);
    setNewPlayerName('');
  };

  const handleRemovePlayer = (indexToRemove: number) => {
    if (players.length <= MIN_PLAYERS) {
      return toast({ title: `Minimum ${MIN_PLAYERS} players required.`, variant: 'destructive' });
    }
    const newLength = players.length - 1;
    setPlayers(prev => prev.filter((_, index) => index !== indexToRemove));
    setCurrentPlayerIndex(prev => {
      if (indexToRemove < prev) return prev - 1; // same person keeps the turn
      if (indexToRemove === prev) return prev % newLength; // turn passes to the next player
      return prev;
    });
    setUpcomingTurns(prev => prev.filter(i => i !== indexToRemove).map(i => (i > indexToRemove ? i - 1 : i)));
  };

  if (players.length === 0) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <MartiniMark className="h-14 w-14 animate-pulse" />
          <p className="font-headline text-xl font-bold text-primary neon-text-primary tracking-tight">
            Charging Neon...
          </p>
        </div>
      </div>
    );
  }

  const cardsPlayed = usedPromptIds.size;
  const deckTotal = availablePrompts.length;
  const cardNumber = Math.min(cardsPlayed + 1, Math.max(deckTotal, 1));
  const roundNumber = players.length > 0 ? Math.floor(cardsPlayed / players.length) + 1 : 1;
  const progressPct = deckTotal > 0 ? Math.min((cardsPlayed / deckTotal) * 100, 100) : 0;
  const category = currentPrompt ? getPromptCategory(currentPrompt) : null;
  const categoryMeta = category ? CATEGORY_META[category] : null;

  // R4 — "Last Call" finale: the night gets a real ending, not a stalled turn.
  if (gameEnded) {
    return (
      <GameOverView
        players={players}
        nsfwLevel={nsfwLevel}
        cardsPlayed={cardsPlayed}
        turnsByName={turnsByName}
        onRunItBack={restartGame}
        onTurnItUp={() => { const hotter = HOTTER_MODE[nsfwLevel]; if (hotter) setNsfwLevel(hotter); }}
        onNewCrew={leaveToSetup}
      />
    );
  }

  const timerPct = timerTotal && timeLeft !== null ? Math.max(0, Math.min(100, (timeLeft / timerTotal) * 100)) : 0;

  return (
    <>
      <AlertDialog open={isNewGameDialogOpen} onOpenChange={setIsNewGameDialogOpen}>
        <AlertDialogContent className="glass-card border-white/10 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-2xl">End this game?</AlertDialogTitle>
            <AlertDialogDescription>
              Restart the same deck, head back to setup with this crew, or keep playing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
            <AlertDialogAction
              onClick={restartGame}
              className="w-full bg-primary text-primary-foreground touch-manipulation"
            >
              Restart Deck
            </AlertDialogAction>
            <AlertDialogAction
              onClick={leaveToSetup}
              className="w-full bg-white/5 border border-white/15 text-white hover:bg-white/10 touch-manipulation"
            >
              Back to Setup
            </AlertDialogAction>
            <AlertDialogCancel className="mt-0 w-full bg-transparent border-white/10 hover:bg-white/5 touch-manipulation">
              Keep Playing
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent
          side="bottom"
          className="glass-card border-t-white/10 rounded-t-2xl max-h-[88dvh] overflow-y-auto overscroll-contain pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        >
          <div className="mx-auto mb-3 h-1.5 w-12 shrink-0 rounded-full bg-white/15" />
          <div className="mx-auto w-full max-w-md">
            <SheetHeader className="text-center sm:text-center">
              <SheetTitle className="font-headline text-2xl">Game Settings</SheetTitle>
              <SheetDescription>Add or drop players and change intensity mid-game.</SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-6">
              <div className="space-y-3">
                <Label className="text-accent uppercase tracking-wider text-xs font-semibold">Players</Label>
                <div className="space-y-2 max-h-[34vh] overflow-y-auto overscroll-contain pr-1">
                  {players.map((player, index) => (
                    <div key={`${player}-${index}`} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="flex min-w-0 items-center gap-2.5">
                        <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", playerColor(index).dot)} />
                        <span className="font-medium truncate pr-2">{player}</span>
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePlayer(index)}
                        disabled={players.length <= MIN_PLAYERS}
                        aria-label={`Remove ${player}`}
                        className="h-11 w-11 shrink-0 touch-manipulation"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    placeholder="Add a player"
                    maxLength={MAX_NAME_LENGTH}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                    className="bg-white/5 h-11"
                    aria-label="New player name"
                  />
                  <Button onClick={handleAddPlayer} size="icon" aria-label="Add player" className="h-11 w-11 shrink-0 bg-accent text-accent-foreground hover:bg-accent/80 touch-manipulation">
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Separator className="bg-white/10" />
              <div className="space-y-3">
                <Label className="text-accent uppercase tracking-wider text-xs font-semibold">Game Mode</Label>
                <RadioGroup value={nsfwLevel} onValueChange={(v) => handleNsfwLevelChange(v as GameMode)} className="grid grid-cols-3 gap-2 bg-white/5 p-1.5 rounded-xl">
                  {GAME_MODES.map((mode) => (
                    <Label
                      key={mode.id}
                      className={cn(
                        "flex items-center justify-center min-h-[44px] px-2 rounded-lg cursor-pointer transition-all text-sm font-medium touch-manipulation has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background",
                        mode.wide && 'col-span-3',
                        nsfwLevel === mode.id ? MODE_SELECTED[mode.id] : 'text-white/70 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <RadioGroupItem value={mode.id} className="sr-only" />{mode.label}
                    </Label>
                  ))}
                </RadioGroup>
                <p className="text-xs text-muted-foreground/90">Switching intensity deals a fresh deck.</p>
              </div>
            </div>
            <SheetFooter>
              <Button onClick={() => setIsEditSheetOpen(false)} className="w-full h-12 touch-manipulation">Done</Button>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex flex-col h-[100dvh] text-foreground select-none touch-manipulation overflow-hidden">
        {/* Status strip — replaces the old colliding three-column header. */}
        <header className="shrink-0 pt-[env(safe-area-inset-top)]">
          <div className="h-[3px] w-full bg-white/5">
            <div className={cn("h-full rounded-r-full transition-[width] duration-500 ease-out", MODE_FILL[nsfwLevel])} style={{ width: `${progressPct}%` }} />
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/5">
            <div className="flex flex-col gap-1 min-w-0">
              <span className={cn("inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest", MODE_CHIP[nsfwLevel])}>
                {GAME_MODES.find((m) => m.id === nsfwLevel)?.badge ?? nsfwLevel}
              </span>
              <h1 className="flex min-w-0 items-center gap-2 font-headline text-lg sm:text-xl font-bold tracking-tight text-white">
                <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", playerColor(currentPlayerIndex).dot, playerColor(currentPlayerIndex).glow)} />
                <span className="truncate">{players[currentPlayerIndex]}</span>
              </h1>
            </div>
            <div className="shrink-0 text-right">
              <div className="font-headline text-sm font-bold tabular-nums text-white/90">
                {cardNumber}<span className="text-white/60"> / {deckTotal}</span>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-white/55">
                Round {roundNumber} · {players.length}p
              </div>
            </div>
          </div>
        </header>

        {/* The card fills the middle and never pushes the controls off-screen. */}
        <main className="flex-1 min-h-0 flex items-center justify-center px-4 py-3">
          <div className="relative flex h-full w-full max-w-2xl items-stretch">
            {/* Card peek: rises from behind as the live card is swiped away. */}
            <div
              ref={peekElRef}
              aria-hidden
              className={cn(
                "absolute inset-0 flex items-center justify-center rounded-2xl border glass-card",
                MODE_BORDER[nsfwLevel]
              )}
              style={{ transform: 'scale(0.93)', opacity: 0 }}
            >
              <MartiniMark className="h-10 w-10 opacity-40" />
            </div>

            {/* Live card. */}
            <div
              ref={cardElRef}
              className="relative h-full w-full"
              onPointerDown={onCardPointerDown}
              onPointerMove={onCardPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              style={{ touchAction: 'pan-y' }}
            >
              <Card
                className={cn(
                  "relative flex h-full w-full flex-col overflow-hidden rounded-2xl border glass-card transition-shadow duration-500",
                  MODE_BORDER[nsfwLevel]
                )}
              >
                <div
                  aria-live="polite"
                  className="flex flex-1 min-h-0 flex-col items-center justify-center gap-6 overflow-y-auto overscroll-contain p-6 text-center sm:p-10"
                >
                  {categoryMeta && (
                    <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em]", categoryMeta.className)}>
                      <categoryMeta.Icon className="h-3.5 w-3.5" />
                      {categoryMeta.label}
                    </span>
                  )}
                  <p
                    key={cardKey}
                    className={cn(
                      "font-medium leading-tight text-white text-balance animate-card-enter drop-shadow-md",
                      promptSizeClass(processedPromptText.length)
                    )}
                  >
                    {processedPromptText}
                  </p>
                  {timerTotal !== null && (
                    <div className="flex items-center gap-3">
                      {timerRunning ? (
                        <span className="text-4xl font-bold tabular-nums text-accent neon-text-accent" aria-live="off">
                          {formatSeconds(timeLeft ?? 0)}
                        </span>
                      ) : timeLeft === 0 ? (
                        <span className="text-2xl font-bold text-secondary neon-text-accent animate-fade-in">Time is up!</span>
                      ) : null}
                      {!timerRunning && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={startTimer}
                          className="h-11 rounded-full border-accent/40 text-accent hover:bg-accent/10 text-xs uppercase tracking-widest touch-manipulation"
                        >
                          <Timer className="mr-1.5 h-4 w-4" />
                          {timeLeft === 0 ? 'Restart timer' : `Start ${formatSeconds(timerTotal)}`}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>

              {/* R5 — draining conic ring while the countdown runs; a flash at 0. */}
              {timerRunning && (
                <div
                  className="timer-ring rounded-2xl"
                  data-critical={(timeLeft ?? 0) <= 5}
                  style={{ '--timer-pct': String(timerPct) } as CSSProperties}
                />
              )}
              {timerTotal !== null && !timerRunning && timeLeft === 0 && (
                <div key={`flash-${cardKey}`} className="timer-flash rounded-2xl" />
              )}
            </div>
          </div>
        </main>

        {/* Thumb dock — full-width primary action, then three fitted controls. */}
        <footer className="shrink-0 border-t border-white/5 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Button
            onClick={handleNextPlayer}
            className="w-full h-14 rounded-2xl text-lg font-bold bg-primary text-primary-foreground shadow-xl transition-transform active:scale-[0.98] touch-manipulation"
          >
            Next Player
            <ArrowRightCircle className="ml-1 h-5 w-5" />
          </Button>

          <div className="mt-2 grid grid-cols-4 gap-2">
            <DockButton icon={SkipForward} label="Skip" onClick={handleSkip} accent />
            <DockButton icon={Undo2} label="Undo" onClick={handleUndo} disabled={history.length === 0} />
            <DockButton icon={Users} label="Group" onClick={() => setIsEditSheetOpen(true)} />
            <DockButton icon={RotateCcw} label="End" onClick={() => setIsNewGameDialogOpen(true)} />
          </div>
        </footer>
      </div>
    </>
  );
}

function DockButton({ icon: Icon, label, onClick, disabled, accent }: { icon: LucideIcon; label: string; onClick: () => void; disabled?: boolean; accent?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-xl py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:text-white/40 disabled:pointer-events-none touch-manipulation",
        accent
          // Skip is an offer, not a utility — it sits in the accent so declining
          // a card reads as a first-class move rather than a hidden escape.
          ? "border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20"
          : "text-white/75 hover:bg-white/5 hover:text-white",
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[10px] font-semibold uppercase tracking-widest">{label}</span>
    </button>
  );
}

// R4 — the end of the deck as a destination: a celebratory recap of the night
// and three clear ways to keep it going.
function GameOverView({
  players,
  nsfwLevel,
  cardsPlayed,
  turnsByName,
  onRunItBack,
  onTurnItUp,
  onNewCrew,
}: {
  players: string[];
  nsfwLevel: GameMode;
  cardsPlayed: number;
  turnsByName: Record<string, number>;
  onRunItBack: () => void;
  onTurnItUp: () => void;
  onNewCrew: () => void;
}) {
  const rounds = players.length > 0 ? Math.max(1, Math.ceil(cardsPlayed / players.length)) : 1;
  const modeLabel = GAME_MODES.find((m) => m.id === nsfwLevel)?.badge ?? nsfwLevel;
  const hotter = HOTTER_MODE[nsfwLevel];
  const hotterLabel = hotter ? GAME_MODES.find((m) => m.id === hotter)?.label : null;

  // Most-drawn player, if anyone pulled ahead (all-ties reads as no standout).
  const entries = Object.entries(turnsByName).filter(([, n]) => n > 0);
  let mvpName: string | null = null;
  let mvpCount = 0;
  for (const [name, n] of entries) {
    if (n > mvpCount) { mvpName = name; mvpCount = n; }
  }
  const allEqual = entries.length > 0 && entries.every(([, n]) => n === entries[0][1]);
  const mvpIndex = mvpName ? players.indexOf(mvpName) : -1;
  const mvpColor = playerColor(mvpIndex >= 0 ? mvpIndex : 0);

  useEffect(() => { vibrate([16, 40, 16, 40, 60]); }, []);

  const stats: { label: string; value: string; sub?: string }[] = [
    { label: 'Cards played', value: String(cardsPlayed) },
    { label: 'Rounds', value: String(rounds) },
    { label: 'Intensity', value: modeLabel },
    { label: 'Crew', value: String(players.length), sub: 'players' },
  ];

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-5 py-8 text-center pt-[max(2rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="flex w-full max-w-md flex-col items-center">
        <div className="animate-finale-rise flex flex-col items-center" style={{ animationDelay: '0ms' }}>
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-secondary">
            <Sparkles className="h-4 w-4" /> That&apos;s a wrap
          </span>
          <h1 className="mt-3 font-headline text-5xl font-bold text-secondary neon-text-accent">Last Call</h1>
          <p className="mt-2 text-sm text-muted-foreground">You ran the whole {modeLabel} deck. Not bad.</p>
        </div>

        {mvpName && !allEqual && (
          <div
            className="animate-finale-rise mt-6 flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5"
            style={{ animationDelay: '80ms' }}
          >
            <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/5", mvpColor.glow)}>
              <Trophy className={cn("h-5 w-5", mvpColor.text)} />
            </span>
            <div className="min-w-0 text-left">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-white/55">Most in the hot seat</div>
              <div className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", mvpColor.dot)} />
                <span className="truncate font-headline text-lg font-bold text-white">{mvpName}</span>
                <span className="shrink-0 text-sm text-white/55">· {mvpCount} cards</span>
              </div>
            </div>
          </div>
        )}

        <div className="animate-finale-rise mt-4 grid w-full grid-cols-2 gap-2.5" style={{ animationDelay: '140ms' }}>
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
              <div className="font-headline text-3xl font-bold tabular-nums text-white">{s.value}</div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-white/55">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="animate-finale-rise mt-7 flex w-full flex-col gap-2.5" style={{ animationDelay: '220ms' }}>
          <Button
            onClick={onRunItBack}
            className="h-14 w-full rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-xl transition-transform active:scale-[0.98] touch-manipulation"
          >
            <Repeat className="mr-2 h-5 w-5" /> Run It Back
          </Button>
          {hotter && (
            <Button
              onClick={onTurnItUp}
              variant="outline"
              className="h-[52px] w-full rounded-2xl border-destructive/50 bg-destructive/10 text-base font-semibold text-white hover:bg-destructive/20 touch-manipulation"
            >
              <TrendingUp className="mr-2 h-5 w-5 text-destructive" /> Turn It Up{hotterLabel ? ` · ${hotterLabel}` : ''}
            </Button>
          )}
          <Button
            onClick={onNewCrew}
            variant="ghost"
            className="h-12 w-full rounded-2xl text-base font-medium text-white/70 hover:bg-white/5 hover:text-white touch-manipulation"
          >
            <Users className="mr-2 h-5 w-5" /> New Crew
          </Button>
        </div>
      </div>
    </div>
  );
}

// The logo's martini glass, on its own, used as the loading mark.
function MartiniMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-secondary drop-shadow-[0_0_10px_rgba(242,82,169,0.9)]", className)}
    >
      <path d="M6 3h12l-6 9Z" />
      <path d="M12 12v9" />
      <path d="M7 21h10" />
      <path d="m15 3 1 4" />
    </svg>
  );
}

