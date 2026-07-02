export type NsfwLevel = 'Mild' | 'Medium' | 'Extreme';

export type Prompt = {
  id: number;
  text: string;
  nsfwLevel: NsfwLevel;
};

export const PROMPTS: Prompt[] = [
  // ============================================================================
  // MILD (IDs 1-48) - Sharp icebreakers, light confessions & tasteful flirtation
  // ============================================================================

  // --- Mild: Icebreakers & Wit ---
  { id: 1, text: "Describe yourself in three words your ex would strongly disagree with.", nsfwLevel: 'Mild' },
  { id: 2, text: "What's the most flattering lie you tell people about yourself?", nsfwLevel: 'Mild' },
  { id: 3, text: "If your life had a theme song that played when you walked in, what is it?", nsfwLevel: 'Mild' },
  { id: 4, text: "What's a strong opinion you'll defend with your whole chest and zero evidence?", nsfwLevel: 'Mild' },
  { id: 5, text: "Reveal the pettiest reason you've ever disliked someone on sight.", nsfwLevel: 'Mild' },
  { id: 6, text: "What's the most unhinged thing in your search history you'll actually admit to?", nsfwLevel: 'Mild' },
  { id: 7, text: "What compliment do you fish for the hardest?", nsfwLevel: 'Mild' },
  { id: 8, text: "Reveal your most-used emoji and explain what that says about you.", nsfwLevel: 'Mild' },

  // --- Mild: Light Confessions ---
  { id: 9, text: "Confess the last little white lie you told, and who you told it to.", nsfwLevel: 'Mild' },
  { id: 10, text: "What's the most embarrassing thing you've done to get someone's attention?", nsfwLevel: 'Mild' },
  { id: 11, text: "What's a secret talent you're quietly proud of but never bring up?", nsfwLevel: 'Mild' },
  { id: 12, text: "Tell the group the last thing you Googled at 2am.", nsfwLevel: 'Mild' },
  { id: 13, text: "Reveal the most embarrassing song in your most-played list.", nsfwLevel: 'Mild' },
  { id: 14, text: "What's the pettiest hill you've ever died on in an argument?", nsfwLevel: 'Mild' },
  { id: 15, text: "Admit the most childish thing that still genuinely upsets you.", nsfwLevel: 'Mild' },

  // --- Mild: This or That ---
  { id: 16, text: "Would you rather always be ten minutes late or twenty minutes early, forever?", nsfwLevel: 'Mild' },
  { id: 17, text: "Would you rather read minds or be invisible for a day? Justify the chaos.", nsfwLevel: 'Mild' },
  { id: 18, text: "Would you rather lose all your photos or all your texts?", nsfwLevel: 'Mild' },
  { id: 19, text: "Would you rather never drink again or never check your phone again? Choose carefully.", nsfwLevel: 'Mild' },
  { id: 20, text: "Kiss, marry, avoid: three people the group picks for you.", nsfwLevel: 'Mild' },

  // --- Mild: Light Flirtation ---
  { id: 21, text: "Give {{randomOtherPlayer}} the most convincing compliment you can, no laughing.", nsfwLevel: 'Mild' },
  { id: 22, text: "Describe your ideal first date in enough detail to make {{randomOtherPlayer}} jealous.", nsfwLevel: 'Mild' },
  { id: 23, text: "What's the first thing you notice about someone across a room?", nsfwLevel: 'Mild' },
  { id: 24, text: "Tell {{randomOtherPlayer}} one thing that would instantly win you over.", nsfwLevel: 'Mild' },
  { id: 25, text: "What's your most attractive quality? Brag, don't be humble.", nsfwLevel: 'Mild' },
  { id: 26, text: "Look at {{randomOtherPlayer}} and guess their toxic dating trait.", nsfwLevel: 'Mild' },
  { id: 27, text: "What's the smoothest thing anyone has ever said to you?", nsfwLevel: 'Mild' },
  { id: 28, text: "Rate the group's collective flirting skills and name a clear winner.", nsfwLevel: 'Mild' },

  // --- Mild: Drink If (Social) ---
  { id: 29, text: "Everyone who's ever rehearsed a text before sending it, drink.", nsfwLevel: 'Mild' },
  { id: 30, text: "Anyone who's stalked an ex's profile this week, drink twice.", nsfwLevel: 'Mild' },
  { id: 31, text: "Everyone who's lied about how much they've had tonight, drink.", nsfwLevel: 'Mild' },
  { id: 32, text: "Anyone who's the messiest one in their friend group, drink; you know who you are.", nsfwLevel: 'Mild' },
  { id: 33, text: "Everyone who's ever faked being busy to avoid plans, take a sip.", nsfwLevel: 'Mild' },
  { id: 34, text: "Anyone who's cried in the last week, the group drinks for you.", nsfwLevel: 'Mild' },
  { id: 35, text: "Everyone still a little hung up on someone they shouldn't be, drink.", nsfwLevel: 'Mild' },
  { id: 36, text: "Anyone who's ever been called intimidating, drink and take the compliment.", nsfwLevel: 'Mild' },

  // --- Mild: Playful Dares ---
  { id: 37, text: "Do your best impression of another player until someone guesses who it is.", nsfwLevel: 'Mild' },
  { id: 38, text: "Speak in your most dramatic movie-trailer voice until your next turn; break character and drink.", nsfwLevel: 'Mild' },
  { id: 39, text: "Let the group pick your next social media caption, no editing.", nsfwLevel: 'Mild' },
  { id: 40, text: "Show the group the last photo you took, then explain it with no context.", nsfwLevel: 'Mild' },
  { id: 41, text: "Do your most convincing runway walk across the room.", nsfwLevel: 'Mild' },
  { id: 42, text: "Let {{randomOtherPlayer}} give you a nickname for the rest of the night.", nsfwLevel: 'Mild' },
  { id: 43, text: "Read your last sent text out loud in a seductive whisper.", nsfwLevel: 'Mild' },
  { id: 44, text: "Everyone votes: who's most likely to get famous, and for what? Winner gives out 3 drinks.", nsfwLevel: 'Mild' },
  { id: 45, text: "Hold eye contact with {{randomOtherPlayer}} for 20 seconds; first to laugh drinks.", nsfwLevel: 'Mild' },
  { id: 46, text: "Compliment everyone in the room in one breath; miss someone and drink twice.", nsfwLevel: 'Mild' },
  { id: 47, text: "Confess which player you'd want beside you in a crisis, and why.", nsfwLevel: 'Mild' },
  { id: 48, text: "Do your signature dance move like the whole room is watching, because they are.", nsfwLevel: 'Mild' },

  // ============================================================================
  // MEDIUM (IDs 100-196) - Flirty, spicy confessions & sensual dares, escalating
  // ============================================================================

  // --- Medium: Spicy Confessions & Stories ---
  { id: 100, text: "Describe the most awkward hookup you've ever had; spare no cringe.", nsfwLevel: 'Medium' },
  { id: 101, text: "What's the worst place you've ever been caught making out?", nsfwLevel: 'Medium' },
  { id: 102, text: "Confess the wildest thing you've done to impress someone you wanted.", nsfwLevel: 'Medium' },
  { id: 103, text: "Tell the story of your worst date, the one that became a group legend.", nsfwLevel: 'Medium' },
  { id: 104, text: "What's the boldest way you've ever shot your shot?", nsfwLevel: 'Medium' },
  { id: 105, text: "Confess the most trouble a crush has ever gotten you into.", nsfwLevel: 'Medium' },
  { id: 106, text: "Read the dirtiest text you've ever sent, verbatim, or drink 4.", nsfwLevel: 'Medium' },
  { id: 107, text: "What's the closest you've come to getting caught doing something you shouldn't?", nsfwLevel: 'Medium' },
  { id: 108, text: "Confess a fantasy that has nothing to do with anyone in this room. Probably.", nsfwLevel: 'Medium' },
  { id: 109, text: "What's the most reckless thing you've done for a good story?", nsfwLevel: 'Medium' },
  { id: 110, text: "Describe the best kiss of your life without naming any names.", nsfwLevel: 'Medium' },
  { id: 111, text: "Confess the most delusional situationship you convinced yourself was real.", nsfwLevel: 'Medium' },

  // --- Medium: Flirty Questions ---
  { id: 112, text: "What's your favorite feature on {{randomOtherPlayer}}? Be specific.", nsfwLevel: 'Medium' },
  { id: 113, text: "Where do you love being kissed that isn't your mouth?", nsfwLevel: 'Medium' },
  { id: 114, text: "What's an instant turn-on for you that has nothing to do with looks?", nsfwLevel: 'Medium' },
  { id: 115, text: "If you had to make out with one person here, who's the least bad option?", nsfwLevel: 'Medium' },
  { id: 116, text: "What's your type, and who in this room is dangerously close to it?", nsfwLevel: 'Medium' },
  { id: 117, text: "What's the most attractive thing someone can do while fully clothed?", nsfwLevel: 'Medium' },
  { id: 118, text: "Who in this room gives the most trouble energy, and do you mean it as a compliment?", nsfwLevel: 'Medium' },
  { id: 119, text: "What does someone have to do to make you catch feelings against your will?", nsfwLevel: 'Medium' },
  { id: 120, text: "Point to who you'd least want to see your search history; they drink 3.", nsfwLevel: 'Medium' },
  { id: 121, text: "How fast has someone ever gone from a stranger to exactly your type?", nsfwLevel: 'Medium' },
  { id: 122, text: "What's the longest dry spell you'll admit to? Drink for every month you'd rather not say.", nsfwLevel: 'Medium' },

  // --- Medium: Drink If (Sexual History) ---
  { id: 123, text: "Drink if you've ever fantasized about someone in this room.", nsfwLevel: 'Medium' },
  { id: 124, text: "Take a drink for every person here you've thought about more than once.", nsfwLevel: 'Medium' },
  { id: 125, text: "Drink if you've ever sent a text you'd be mortified to have read aloud.", nsfwLevel: 'Medium' },
  { id: 126, text: "Drink if you've hooked up with someone and never told your friends.", nsfwLevel: 'Medium' },
  { id: 127, text: "Drink if you've ever faked it convincingly enough to get an encore.", nsfwLevel: 'Medium' },
  { id: 128, text: "Drink if your body count is higher than your closest friend would guess.", nsfwLevel: 'Medium' },
  { id: 129, text: "Drink if you've ever hooked up with a coworker, a roommate, or a regret.", nsfwLevel: 'Medium' },
  { id: 130, text: "Drink if you've sent a spicy photo in the last month.", nsfwLevel: 'Medium' },
  { id: 131, text: "Take a sip for every dating app on your phone right now.", nsfwLevel: 'Medium' },
  { id: 132, text: "Drink if you've ever gone home with someone you met that same night.", nsfwLevel: 'Medium' },
  { id: 133, text: "Drink if you've hooked up somewhere you could easily have been caught.", nsfwLevel: 'Medium' },
  { id: 134, text: "Drink if you've ever flirted your way out of a ticket, a bill, or trouble.", nsfwLevel: 'Medium' },
  { id: 135, text: "Drink if there's someone here you'd say yes to right now.", nsfwLevel: 'Medium' },
  { id: 136, text: "Anyone who's been the reason a couple broke up, drink; no elaboration required.", nsfwLevel: 'Medium' },
  { id: 137, text: "Anyone who owns something they'd hide before a parent visited, drink twice.", nsfwLevel: 'Medium' },

  // --- Medium: Voting & Group Heat ---
  { id: 138, text: "Everyone vote: who here is secretly the wildest in private? They drink 3.", nsfwLevel: 'Medium' },
  { id: 139, text: "Vote for who gives the best hugs; the winner earns a demonstration or gives out 3 drinks.", nsfwLevel: 'Medium' },
  { id: 140, text: "Who's most likely to have a spicy secret account? They drink 4, or prove you wrong.", nsfwLevel: 'Medium' },
  { id: 141, text: "Everyone point at once: who's the best kisser in the room? The winner gives out 5.", nsfwLevel: 'Medium' },
  { id: 142, text: "Vote for who's most likely to break a heart this year; they drink 3.", nsfwLevel: 'Medium' },
  { id: 143, text: "Everyone votes for who they'd trust with their phone unlocked; least trusted drinks 4.", nsfwLevel: 'Medium' },
  { id: 144, text: "Who here could talk anyone into anything? They give out 4 drinks.", nsfwLevel: 'Medium' },
  { id: 145, text: "Vote: who's most likely to text an ex tonight? They hand over their phone or drink 5.", nsfwLevel: 'Medium' },
  { id: 146, text: "Everyone votes: who's the biggest flirt at this table? They give out 4 drinks.", nsfwLevel: 'Medium' },

  // --- Medium: Sensual Dares (Light) ---
  { id: 147, text: "Whisper something you find attractive about {{randomOtherPlayer}} in their ear, or drink 2.", nsfwLevel: 'Medium' },
  { id: 148, text: "Give {{randomOtherPlayer}} a 20-second shoulder massage like you mean it.", nsfwLevel: 'Medium' },
  { id: 149, text: "Trace a slow line from {{randomOtherPlayer}}'s wrist to their elbow, or take 2 drinks.", nsfwLevel: 'Medium' },
  { id: 150, text: "Hold {{randomOtherPlayer}}'s gaze and describe how you'd greet them after a year apart.", nsfwLevel: 'Medium' },
  { id: 151, text: "Feed {{randomOtherPlayer}} the next sip of your drink.", nsfwLevel: 'Medium' },
  { id: 152, text: "Let {{randomOtherPlayer}} whisper something scandalous in your ear; keep a straight face or drink.", nsfwLevel: 'Medium' },
  { id: 153, text: "Slow dance with {{randomOtherPlayer}} to whatever plays next, no matter the tempo.", nsfwLevel: 'Medium' },
  { id: 154, text: "Give {{randomOtherPlayer}} your best bedroom eyes for 10 seconds without laughing.", nsfwLevel: 'Medium' },
  { id: 155, text: "Sit on {{randomOtherPlayer}}'s lap until your next turn, or take 3 drinks.", nsfwLevel: 'Medium' },
  { id: 156, text: "Compliment {{randomOtherPlayer}}'s best physical feature while holding eye contact, or drink 2.", nsfwLevel: 'Medium' },
  { id: 157, text: "Let {{randomOtherPlayer}} write a word on your arm with a fingertip; guess it or drink.", nsfwLevel: 'Medium' },
  { id: 158, text: "Do your best impression of {{randomOtherPlayer}} flirting; they rate it or drink 2.", nsfwLevel: 'Medium' },

  // --- Medium: Reveals (Incentivized) ---
  { id: 159, text: "Reveal your go-to pickup line to give out 5 drinks, or drink 2 to keep it secret.", nsfwLevel: 'Medium' },
  { id: 160, text: "Say your body count out loud to give out 6 drinks, or drink 3 to keep the mystery.", nsfwLevel: 'Medium' },
  { id: 161, text: "Show the group the last spicy text you sent to give out 8 drinks.", nsfwLevel: 'Medium' },
  { id: 162, text: "Name the ick that ends things for you instantly; anyone guilty of it drinks.", nsfwLevel: 'Medium' },
  { id: 163, text: "Describe your ideal night in with someone in enough detail to give out 5 drinks.", nsfwLevel: 'Medium' },
  { id: 164, text: "Reveal the wildest place you'd be willing to get frisky to give out 6 drinks.", nsfwLevel: 'Medium' },
  { id: 165, text: "Admit which player you'd swipe right on to give out 4 drinks, or drink 2.", nsfwLevel: 'Medium' },
  { id: 166, text: "Confess a crush you had that would genuinely surprise everyone here, or drink 3.", nsfwLevel: 'Medium' },

  // --- Medium: Phone & Reveal Stunts ---
  { id: 167, text: "Text your most recent crush a single 👀 and show the group the send, or drink 4.", nsfwLevel: 'Medium' },
  { id: 168, text: "Show the group your most recent selfie, the one you didn't post, or drink 3.", nsfwLevel: 'Medium' },
  { id: 169, text: "Read your boldest DM out loud, or drink 4.", nsfwLevel: 'Medium' },
  { id: 170, text: "Let the group ask you one yes-or-no question about your love life; answer or drink 3.", nsfwLevel: 'Medium' },
  { id: 171, text: "Trade phones with {{randomOtherPlayer}} for one round; no deleting.", nsfwLevel: 'Medium' },
  { id: 172, text: "Let {{randomOtherPlayer}} post a one-word story to your close friends, or drink 5.", nsfwLevel: 'Medium' },

  // --- Medium: Social Drink Commands ---
  { id: 173, text: "Everyone showing skin below the collarbone right now, drink twice.", nsfwLevel: 'Medium' },
  { id: 174, text: "The last person here to hook up with someone, drink 3; welcome back.", nsfwLevel: 'Medium' },
  { id: 175, text: "Everyone single by choice, drink. Everyone single by circumstance, drink twice.", nsfwLevel: 'Medium' },
  { id: 176, text: "Anyone who's ever dated someone in this room, or wanted to, drink.", nsfwLevel: 'Medium' },
  { id: 177, text: "The most recently heartbroken person here finishes their drink; the group toasts you.", nsfwLevel: 'Medium' },
  { id: 178, text: "Everyone born under a fire sign, drink 3 and act surprised.", nsfwLevel: 'Medium' },
  { id: 179, text: "Anyone who thinks they're the best-looking person in the room, drink; bold move.", nsfwLevel: 'Medium' },
  { id: 180, text: "Anyone who's ever been called a heartbreaker, give out 3 drinks.", nsfwLevel: 'Medium' },
  { id: 181, text: "Take a drink for every year since your last relationship; round up.", nsfwLevel: 'Medium' },
  { id: 182, text: "Everyone wearing black tonight, drink; you know exactly what you're doing.", nsfwLevel: 'Medium' },
  { id: 183, text: "Anyone not wearing socks right now, take a drink.", nsfwLevel: 'Medium' },
  { id: 184, text: "The person who's checked their phone most this round drinks twice.", nsfwLevel: 'Medium' },

  // --- Medium: Flirty Challenges ---
  { id: 185, text: "Reenact the face you make when a text from a crush lights up your phone.", nsfwLevel: 'Medium' },
  { id: 186, text: "Whisper the number of people you've kissed to {{randomOtherPlayer}}; they decide if the group finds out.", nsfwLevel: 'Medium' },
  { id: 187, text: "Rank the room by who you'd want stranded on an island with; most romantic reasons win a drink to give out.", nsfwLevel: 'Medium' },
  { id: 188, text: "Admit the pettiest thing you've done after a breakup, or drink 3.", nsfwLevel: 'Medium' },
  { id: 189, text: "Let {{randomOtherPlayer}} choose one word you have to work into conversation until your next turn; fail and drink.", nsfwLevel: 'Medium' },
  { id: 190, text: "Describe your worst kiss ever without naming who it was with.", nsfwLevel: 'Medium' },
  { id: 191, text: "Everyone vote for the biggest tease in the room; they give out 4 drinks.", nsfwLevel: 'Medium' },
  { id: 192, text: "Confess the last thing that made you blush, or drink 3.", nsfwLevel: 'Medium' },
  { id: 193, text: "Look at {{randomOtherPlayer}} and finish this sentence out loud: 'If we were alone right now...'", nsfwLevel: 'Medium' },
  { id: 194, text: "Give {{randomOtherPlayer}} a genuine, uninterrupted 15-second compliment; no jokes allowed.", nsfwLevel: 'Medium' },
  { id: 195, text: "Reveal the most attractive thing about the last person you dated, or drink 2.", nsfwLevel: 'Medium' },
  { id: 196, text: "Everyone who's ever kept a hookup a secret from this exact group, drink.", nsfwLevel: 'Medium' },

  // ============================================================================
  // EXTREME (IDs 300-412) - Escalating heat: confessions, dares & explicit play
  // ============================================================================

  // --- Extreme: Explicit Confessions ---
  { id: 300, text: "Describe, in detail, the filthiest thing you've ever done, or take 4 drinks.", nsfwLevel: 'Extreme' },
  { id: 301, text: "What's the kinkiest thing you've tried and would absolutely do again?", nsfwLevel: 'Extreme' },
  { id: 302, text: "Reveal the fantasy you've never said out loud, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 303, text: "Tell the group exactly what you'd do to {{randomOtherPlayer}} if the room were empty, or take 5 drinks.", nsfwLevel: 'Extreme' },
  { id: 304, text: "What's the riskiest place you've ever finished what you started?", nsfwLevel: 'Extreme' },
  { id: 305, text: "Confess the wildest thing you've been talked into in bed.", nsfwLevel: 'Extreme' },
  { id: 306, text: "Name the person in this room you'd break your own rules for, or take 5 drinks.", nsfwLevel: 'Extreme' },
  { id: 307, text: "Describe how you like to be touched, then let {{randomOtherPlayer}} demonstrate, or drink 3.", nsfwLevel: 'Extreme' },
  { id: 308, text: "What's the most people you've been with in a single week? Drink that number if you'd rather not say.", nsfwLevel: 'Extreme' },
  { id: 309, text: "Whisper your dirtiest fantasy to {{randomOtherPlayer}}, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 310, text: "Confess the most scandalous thing on your phone right now, or hand it to {{randomOtherPlayer}} for 30 seconds.", nsfwLevel: 'Extreme' },
  { id: 311, text: "Reveal the roleplay you'd actually want to try, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 312, text: "What are you into that you'd never admit on a first date? Say it or take 4.", nsfwLevel: 'Extreme' },
  { id: 313, text: "Describe the best you've ever had, details not names, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 314, text: "If you've hooked up with anyone in this room, look at them and drink.", nsfwLevel: 'Extreme' },

  // --- Extreme: Drink If (Explicit) ---
  { id: 315, text: "Drink if you've had a threesome; remove a layer if you'd do it again tonight.", nsfwLevel: 'Extreme' },
  { id: 316, text: "Drink if you've ever been tied up, or done the tying.", nsfwLevel: 'Extreme' },
  { id: 317, text: "Drink if you've ever filmed yourself and still have the evidence.", nsfwLevel: 'Extreme' },
  { id: 318, text: "Drink if you've joined the mile-high club.", nsfwLevel: 'Extreme' },
  { id: 319, text: "Drink if you've ever been choked and asked for it harder.", nsfwLevel: 'Extreme' },
  { id: 320, text: "Drink if you've hooked up with two people in the same friend group.", nsfwLevel: 'Extreme' },
  { id: 321, text: "Drink if you've had a friends-with-benefits arrangement end in chaos.", nsfwLevel: 'Extreme' },
  { id: 322, text: "Drink if you've done something in this exact company you'd never confess sober.", nsfwLevel: 'Extreme' },
  { id: 323, text: "Drink if you own a toy within reach of your bed right now.", nsfwLevel: 'Extreme' },
  { id: 324, text: "Drink if you've had a night you genuinely can't remember but heard the reviews.", nsfwLevel: 'Extreme' },
  { id: 325, text: "Drink if you've ever sent a photo you hope never resurfaces.", nsfwLevel: 'Extreme' },
  { id: 326, text: "Drink if there's someone here you've thought about while alone; make eye contact and take one more.", nsfwLevel: 'Extreme' },
  { id: 327, text: "Drink if you've ever kept going after someone walked in.", nsfwLevel: 'Extreme' },
  { id: 328, text: "Drink if you've broken a bed, a chair, or a house rule.", nsfwLevel: 'Extreme' },
  { id: 329, text: "Drink if you've done it somewhere your boss, your landlord, or your mother would object to.", nsfwLevel: 'Extreme' },

  // --- Extreme: Kissing ---
  { id: 330, text: "Kiss {{randomOtherPlayer}} slowly, no drinks to hide behind, or take 3.", nsfwLevel: 'Extreme' },
  { id: 331, text: "Make out with {{randomOtherPlayer}} for 15 seconds while the room counts.", nsfwLevel: 'Extreme' },
  { id: 332, text: "Kiss {{randomOtherPlayer}} like you mean it, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 333, text: "Let {{randomOtherPlayer}} kiss you anywhere above the waist they choose, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 334, text: "Hover your lips over {{randomOtherPlayer}}'s without touching for 20 seconds; first to close the gap wins, the other drinks.", nsfwLevel: 'Extreme' },
  { id: 335, text: "Kiss the last place you'd expect on {{randomOtherPlayer}}, their choice, or take 3.", nsfwLevel: 'Extreme' },
  { id: 336, text: "Demonstrate on {{randomOtherPlayer}} exactly how you like to be kissed, or drink 3.", nsfwLevel: 'Extreme' },
  { id: 337, text: "Pass an ice cube to {{randomOtherPlayer}} using only your mouth.", nsfwLevel: 'Extreme' },

  // --- Extreme: Neck, Marking & Body Kissing ---
  { id: 338, text: "Kiss {{randomOtherPlayer}}'s neck for 15 seconds, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 339, text: "Leave a mark on {{randomOtherPlayer}} somewhere only they'll find later, or take 4 drinks.", nsfwLevel: 'Extreme' },
  { id: 340, text: "Let {{randomOtherPlayer}} kiss a slow trail from your ear to your collarbone, or take 3.", nsfwLevel: 'Extreme' },
  { id: 341, text: "Kiss your way down {{randomOtherPlayer}}'s arm to their fingertips, or drink 3.", nsfwLevel: 'Extreme' },
  { id: 342, text: "Bite {{randomOtherPlayer}}'s earlobe and whisper one thing you'd do to them, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 343, text: "Let {{randomOtherPlayer}} choose one spot above the belt for you to kiss for 10 seconds, or drink 3.", nsfwLevel: 'Extreme' },

  // --- Extreme: Touch, Ice & Body Shots ---
  { id: 344, text: "Take a body shot off {{randomOtherPlayer}}; they pick the spot.", nsfwLevel: 'Extreme' },
  { id: 345, text: "Let {{randomOtherPlayer}} take a body shot off you; you pick the spot, they don't get to argue.", nsfwLevel: 'Extreme' },
  { id: 346, text: "Lick whipped cream off {{randomOtherPlayer}} wherever they dab it, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 347, text: "Run an ice cube across {{randomOtherPlayer}}'s skin using only your mouth; you choose where, or take 4 drinks.", nsfwLevel: 'Extreme' },
  { id: 348, text: "Let {{randomOtherPlayer}} slide a hand slowly up your thigh; you say when to stop, or drink 3.", nsfwLevel: 'Extreme' },
  { id: 349, text: "Explore {{randomOtherPlayer}} with your hands over clothes for 30 seconds, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 350, text: "Suck on {{randomOtherPlayer}}'s finger while holding eye contact, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 351, text: "Let {{randomOtherPlayer}} trace every inch of your neck and arms with their fingertips for a minute, or drink 3.", nsfwLevel: 'Extreme' },

  // --- Extreme: Lap Dances & Grinding ---
  { id: 352, text: "Give {{randomOtherPlayer}} a lap dance for a full song, or take 4 drinks.", nsfwLevel: 'Extreme' },
  { id: 353, text: "Receive a lap dance from {{randomOtherPlayer}} and keep a straight face, or take 4 drinks.", nsfwLevel: 'Extreme' },
  { id: 354, text: "Grind on {{randomOtherPlayer}} for 30 seconds, or take 4 drinks.", nsfwLevel: 'Extreme' },
  { id: 355, text: "Straddle {{randomOtherPlayer}} for 30 seconds and whisper what you're thinking, or drink 4.", nsfwLevel: 'Extreme' },
  { id: 356, text: "Sit facing {{randomOtherPlayer}} on their lap for the next two rounds.", nsfwLevel: 'Extreme' },

  // --- Extreme: Stripping & Strip Teases ---
  { id: 357, text: "Remove one item of clothing, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 358, text: "Let {{randomOtherPlayer}} choose which layer you lose, or take 4 drinks.", nsfwLevel: 'Extreme' },
  { id: 359, text: "Give {{randomOtherPlayer}} a strip tease to one full song, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 360, text: "Use only your teeth to take off one piece of {{randomOtherPlayer}}'s clothing, or take 4 drinks.", nsfwLevel: 'Extreme' },
  { id: 361, text: "Strip to your underwear for the next 3 rounds, or take 5 drinks.", nsfwLevel: 'Extreme' },
  { id: 362, text: "Swap one item of clothing with {{randomOtherPlayer}} and wear it until your next turn.", nsfwLevel: 'Extreme' },
  { id: 363, text: "Put on a song and let {{randomOtherPlayer}} undo one button, zipper, or clasp per line of the chorus, or drink 4.", nsfwLevel: 'Extreme' },
  { id: 364, text: "Send your top to the middle of the table for the next round, or take 4 drinks.", nsfwLevel: 'Extreme' },

  // --- Extreme: Spanking, Restraints & Power ---
  { id: 365, text: "Spank {{randomOtherPlayer}} once, hard, or take 2 drinks.", nsfwLevel: 'Extreme' },
  { id: 366, text: "Let {{randomOtherPlayer}} spank you and count it out loud, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 367, text: "Let {{randomOtherPlayer}} tie your hands with whatever's nearby for the next two rounds, or drink 3.", nsfwLevel: 'Extreme' },
  { id: 368, text: "Pin {{randomOtherPlayer}} against the nearest wall for 15 seconds, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 369, text: "Obey one command from {{randomOtherPlayer}} this round, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 370, text: "Get blindfolded while {{randomOtherPlayer}} plants one kiss somewhere; guess where after, or drink 3.", nsfwLevel: 'Extreme' },
  { id: 371, text: "Get blindfolded and let {{randomOtherPlayer}} guide your hands anywhere above the waist for 20 seconds, or take 3.", nsfwLevel: 'Extreme' },

  // --- Extreme: Simulated & Narrated ---
  { id: 372, text: "Recreate your go-to move on {{randomOtherPlayer}}, fully clothed, for 15 seconds, or take 4 drinks.", nsfwLevel: 'Extreme' },
  { id: 373, text: "Simulate your favorite position with {{randomOtherPlayer}} for 15 seconds, or take 4 drinks.", nsfwLevel: 'Extreme' },
  { id: 374, text: "Perform a convincing 10-second preview of your bedroom noises, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 375, text: "Whisper a play-by-play of what you'd do to {{randomOtherPlayer}} until they blush or tell you to stop, or drink 4.", nsfwLevel: 'Extreme' },
  { id: 376, text: "Narrate exactly how you'd undress {{randomOtherPlayer}} without touching them, or take 4 drinks.", nsfwLevel: 'Extreme' },
  { id: 377, text: "Demonstrate on {{randomOtherPlayer}}'s neck how you'd start the night if it were just the two of you, or drink 4.", nsfwLevel: 'Extreme' },

  // --- Extreme: Explicit Contact & High Heat ---
  { id: 378, text: "Let {{randomOtherPlayer}} rest a hand wherever they like for a full round; you can move it once, or take 4 drinks.", nsfwLevel: 'Extreme' },
  { id: 379, text: "Lie back and let {{randomOtherPlayer}} kiss from your collarbone to your waistband, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 380, text: "Let {{randomOtherPlayer}} bite you anywhere above the waist they choose, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 381, text: "Demonstrate your best oral technique on a finger, a bottle, or {{randomOtherPlayer}}'s choosing, or drink 4.", nsfwLevel: 'Extreme' },
  { id: 382, text: "Motorboat or be motorboated by {{randomOtherPlayer}}; pick a role, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 383, text: "Let {{randomOtherPlayer}} draw something on your bare stomach, clothing up, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 384, text: "Give {{randomOtherPlayer}} a 30-second massage anywhere they point, over clothes, or take 3 drinks.", nsfwLevel: 'Extreme' },

  // --- Extreme: Phone & Reveal (Explicit) ---
  { id: 385, text: "Show the group the last risqué photo in your phone, or take 5 drinks.", nsfwLevel: 'Extreme' },
  { id: 386, text: "Text your most recent hookup 'thinking about you' right now; screenshot the send or take 4 drinks.", nsfwLevel: 'Extreme' },
  { id: 387, text: "Take a photo you'd never post, keep it private, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 388, text: "Let {{randomOtherPlayer}} scroll your camera roll for 15 seconds, or take 5 drinks.", nsfwLevel: 'Extreme' },
  { id: 389, text: "Reveal the wildest thing in your nightstand, or drink 4.", nsfwLevel: 'Extreme' },
  { id: 390, text: "Confess the roleplay or scenario that never fails for you, or take 4 drinks.", nsfwLevel: 'Extreme' },

  // --- Extreme: Group & Private Escalation ---
  { id: 391, text: "Everyone strips one layer at the same time; last one undressed finishes their drink.", nsfwLevel: 'Extreme' },
  { id: 392, text: "Spin for it: whoever it lands on, make out for 20 seconds or you both take 4 drinks.", nsfwLevel: 'Extreme' },
  { id: 393, text: "Take {{randomOtherPlayer}} somewhere private for 3 minutes, or you both finish your drinks.", nsfwLevel: 'Extreme' },
  { id: 394, text: "Get seven minutes alone with {{randomOtherPlayer}}; the group sets the timer, or you both take 5 drinks.", nsfwLevel: 'Extreme' },
  { id: 395, text: "Let the group vote on one dare for you and {{randomOtherPlayer}} together; majority rules, no vetoes, or you both finish.", nsfwLevel: 'Extreme' },
  { id: 396, text: "Trade one dare with {{randomOtherPlayer}} that you both actually have to do, or you both finish your drinks.", nsfwLevel: 'Extreme' },
  { id: 397, text: "Kiss the two people beside you, one after the other, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 398, text: "Let the group choose one article of clothing you lose for the rest of the game.", nsfwLevel: 'Extreme' },

  // --- Extreme: Confess or Consequence ---
  { id: 399, text: "Name the two people here you'd pick for a fantasy scenario, and who does what, or take 5 drinks.", nsfwLevel: 'Extreme' },
  { id: 400, text: "Rank the room by who you'd most want to go home with tonight; say it out loud or take 5 drinks.", nsfwLevel: 'Extreme' },
  { id: 401, text: "Let {{randomOtherPlayer}} ask you any three questions about your sex life; lie once and you both drink.", nsfwLevel: 'Extreme' },
  { id: 402, text: "Let {{randomOtherPlayer}} whisper the filthiest thing they'd do to you; repeat it to the group or drink 4.", nsfwLevel: 'Extreme' },
  { id: 403, text: "Confess the closest you've ever come to a truly wild story, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 404, text: "Tell the group the one thing you'd never say sober, or take 5 drinks.", nsfwLevel: 'Extreme' },

  // --- Extreme: Final Escalation ---
  { id: 405, text: "Wear {{randomOtherPlayer}}'s choice of your remaining clothing until your next turn, or take 4 drinks.", nsfwLevel: 'Extreme' },
  { id: 406, text: "Let {{randomOtherPlayer}} decide: lose two layers or do their dare, no questions asked.", nsfwLevel: 'Extreme' },
  { id: 407, text: "Simulate a 15-second slow build with {{randomOtherPlayer}}: clothed, choreographed, committed, or drink 4.", nsfwLevel: 'Extreme' },
  { id: 408, text: "Let {{randomOtherPlayer}} leave one mark on you and choose where; hidden or not, or take 4 drinks.", nsfwLevel: 'Extreme' },
  { id: 409, text: "Give {{randomOtherPlayer}} the most convincing 10-second preview of your best move, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 410, text: "Let the group dare you to do one thing to {{randomOtherPlayer}}; majority rules, or you finish your drink.", nsfwLevel: 'Extreme' },
  { id: 411, text: "Whisper to {{randomOtherPlayer}} the one place you most want to be kissed, then let them decide, or drink 4.", nsfwLevel: 'Extreme' },
  { id: 412, text: "End the round your way: kiss {{randomOtherPlayer}} however you've been wanting to, or finish your drink.", nsfwLevel: 'Extreme' }
];
