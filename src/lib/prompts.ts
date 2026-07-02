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
  { id: 44, text: "Everyone votes: who's most likely to get famous, and for what? Winner gives out 2 drinks.", nsfwLevel: 'Mild' },
  { id: 45, text: "Hold eye contact with {{randomOtherPlayer}} for 20 seconds; first to laugh drinks.", nsfwLevel: 'Mild' },
  { id: 46, text: "Compliment everyone in the room in one breath; miss someone and drink twice.", nsfwLevel: 'Mild' },
  { id: 47, text: "Confess which player you'd want beside you in a crisis, and why.", nsfwLevel: 'Mild' },
  { id: 48, text: "Do your signature dance move like the whole room is watching, because they are.", nsfwLevel: 'Mild' },

  // --- Mild: More Icebreakers & Wit ---
  { id: 49, text: "What's the most irrational fear you have that you know makes no sense?", nsfwLevel: 'Mild' },
  { id: 50, text: "If you had to delete one app right now, which one would actually hurt?", nsfwLevel: 'Mild' },
  { id: 51, text: "What's a trend you pretended to understand just to fit in?", nsfwLevel: 'Mild' },
  { id: 52, text: "What's the pettiest thing that instantly makes you judge someone?", nsfwLevel: 'Mild' },
  { id: 53, text: "Describe your last group-chat drama in exactly one sentence.", nsfwLevel: 'Mild' },
  { id: 54, text: "What's a compliment you got once that you still think about?", nsfwLevel: 'Mild' },
  { id: 55, text: "What's the one word your friends would use to describe you behind your back?", nsfwLevel: 'Mild' },

  // --- Mild: More Light Confessions ---
  { id: 56, text: "Admit the last time you pretended to be busy to get out of something.", nsfwLevel: 'Mild' },
  { id: 57, text: "What's the most embarrassing thing you've done while completely sober?", nsfwLevel: 'Mild' },
  { id: 58, text: "Confess a lie you've told to seem cooler than you actually are.", nsfwLevel: 'Mild' },
  { id: 59, text: "What's the pettiest revenge you've ever taken?", nsfwLevel: 'Mild' },
  { id: 60, text: "Tell the group your most embarrassing autocorrect disaster.", nsfwLevel: 'Mild' },
  { id: 61, text: "What's something everyone seems to love that you secretly can't stand?", nsfwLevel: 'Mild' },

  // --- Mild: More This or That ---
  { id: 62, text: "Would you rather always say exactly what you're thinking or never speak your mind again?", nsfwLevel: 'Mild' },
  { id: 63, text: "Would you rather be slightly too honest or slightly too fake for a year?", nsfwLevel: 'Mild' },
  { id: 64, text: "Would you rather relive your most embarrassing moment or your worst-ever haircut?", nsfwLevel: 'Mild' },
  { id: 65, text: "Would you rather have every text you've sent read aloud or every photo shown?", nsfwLevel: 'Mild' },

  // --- Mild: More Light Flirtation ---
  { id: 66, text: "Tell {{randomOtherPlayer}} the most attractive thing about their personality.", nsfwLevel: 'Mild' },
  { id: 67, text: "What's the biggest green flag in someone you're into?", nsfwLevel: 'Mild' },
  { id: 68, text: "Guess {{randomOtherPlayer}}'s love language; they tell you if you nailed it.", nsfwLevel: 'Mild' },
  { id: 69, text: "What's the fastest way to your heart, in your experience?", nsfwLevel: 'Mild' },
  { id: 70, text: "Describe your ideal partner in three words, then look at who's closest in the room.", nsfwLevel: 'Mild' },
  { id: 71, text: "What's a small thing someone can do that you find weirdly attractive?", nsfwLevel: 'Mild' },

  // --- Mild: More Drink If (Social) ---
  { id: 72, text: "Everyone who's re-read a text after sending it just to check the tone, drink.", nsfwLevel: 'Mild' },
  { id: 73, text: "Anyone who's ghosted someone this year, drink twice.", nsfwLevel: 'Mild' },
  { id: 74, text: "Everyone who gives relationship advice they don't actually follow, drink.", nsfwLevel: 'Mild' },
  { id: 75, text: "Anyone who's saved a screenshot to overanalyze later, drink.", nsfwLevel: 'Mild' },
  { id: 76, text: "Everyone who's ever left someone on read on purpose, drink.", nsfwLevel: 'Mild' },

  // --- Mild: More Playful Dares ---
  { id: 77, text: "Let {{randomOtherPlayer}} choose an accent you have to keep until your next turn; slip and drink.", nsfwLevel: 'Mild' },
  { id: 78, text: "Text the third person in your recent messages a single heart emoji; screenshot the send or drink 2.", nsfwLevel: 'Mild' },
  { id: 79, text: "Do your most convincing fake laugh until someone else laughs for real.", nsfwLevel: 'Mild' },
  { id: 80, text: "Give the group your honest first impression of {{randomOtherPlayer}}.", nsfwLevel: 'Mild' },
  { id: 81, text: "Let the group ask you one embarrassing question; answer honestly or drink 2.", nsfwLevel: 'Mild' },
  { id: 82, text: "Show the group your screen time for today, no hiding, or drink 2.", nsfwLevel: 'Mild' },

  // ============================================================================
  // MEDIUM (IDs 100-264) - Flirty, spicy confessions & sensual dares, escalating
  // ============================================================================

  // --- Medium: Spicy Confessions & Stories ---
  { id: 100, text: "Describe the most awkward hookup you've ever had; spare no cringe.", nsfwLevel: 'Medium' },
  { id: 101, text: "What's the worst place you've ever been caught making out?", nsfwLevel: 'Medium' },
  { id: 102, text: "Confess the wildest thing you've done to impress someone you wanted.", nsfwLevel: 'Medium' },
  { id: 103, text: "Tell the story of your worst date, the one that became a group legend.", nsfwLevel: 'Medium' },
  { id: 104, text: "What's the boldest way you've ever shot your shot?", nsfwLevel: 'Medium' },
  { id: 105, text: "Confess the most trouble a crush has ever gotten you into.", nsfwLevel: 'Medium' },
  { id: 106, text: "Read the dirtiest text you've ever sent, verbatim, or drink 3.", nsfwLevel: 'Medium' },
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
  { id: 120, text: "Point to who you'd least want to see your search history; they drink 2.", nsfwLevel: 'Medium' },
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
  { id: 138, text: "Everyone vote: who here is secretly the wildest in private? They drink 2.", nsfwLevel: 'Medium' },
  { id: 139, text: "Vote for who gives the best hugs; the winner earns a demonstration or gives out 2 drinks.", nsfwLevel: 'Medium' },
  { id: 140, text: "Who's most likely to have a spicy secret account? They drink 3, or prove you wrong.", nsfwLevel: 'Medium' },
  { id: 141, text: "Everyone point at once: who's the best kisser in the room? The winner gives out 5.", nsfwLevel: 'Medium' },
  { id: 142, text: "Vote for who's most likely to break a heart this year; they drink 2.", nsfwLevel: 'Medium' },
  { id: 143, text: "Everyone votes for who they'd trust with their phone unlocked; least trusted drinks 4.", nsfwLevel: 'Medium' },
  { id: 144, text: "Who here could talk anyone into anything? They give out 3 drinks.", nsfwLevel: 'Medium' },
  { id: 145, text: "Vote: who's most likely to text an ex tonight? They hand over their phone or drink 3.", nsfwLevel: 'Medium' },
  { id: 146, text: "Everyone votes: who's the biggest flirt at this table? They give out 3 drinks.", nsfwLevel: 'Medium' },

  // --- Medium: Sensual Dares (Light) ---
  { id: 147, text: "Whisper something you find attractive about {{randomOtherPlayer}} in their ear, or drink 1.", nsfwLevel: 'Medium' },
  { id: 148, text: "Give {{randomOtherPlayer}} a 20-second shoulder massage like you mean it.", nsfwLevel: 'Medium' },
  { id: 149, text: "Trace a slow line from {{randomOtherPlayer}}'s wrist to their elbow, or take 1 drinks.", nsfwLevel: 'Medium' },
  { id: 150, text: "Hold {{randomOtherPlayer}}'s gaze and describe how you'd greet them after a year apart.", nsfwLevel: 'Medium' },
  { id: 151, text: "Feed {{randomOtherPlayer}} the next sip of your drink.", nsfwLevel: 'Medium' },
  { id: 152, text: "Let {{randomOtherPlayer}} whisper something scandalous in your ear; keep a straight face or drink.", nsfwLevel: 'Medium' },
  { id: 153, text: "Slow dance with {{randomOtherPlayer}} to whatever plays next, no matter the tempo.", nsfwLevel: 'Medium' },
  { id: 154, text: "Give {{randomOtherPlayer}} your best bedroom eyes for 10 seconds without laughing.", nsfwLevel: 'Medium' },
  { id: 155, text: "Sit on {{randomOtherPlayer}}'s lap until your next turn, or take 2 drinks.", nsfwLevel: 'Medium' },
  { id: 156, text: "Compliment {{randomOtherPlayer}}'s best physical feature while holding eye contact, or drink 1.", nsfwLevel: 'Medium' },
  { id: 157, text: "Let {{randomOtherPlayer}} write a word on your arm with a fingertip; guess it or drink.", nsfwLevel: 'Medium' },
  { id: 158, text: "Do your best impression of {{randomOtherPlayer}} flirting; they rate it or drink 1.", nsfwLevel: 'Medium' },

  // --- Medium: Reveals (Incentivized) ---
  { id: 159, text: "Reveal your go-to pickup line to give out 3 drinks, or drink 1 to keep it secret.", nsfwLevel: 'Medium' },
  { id: 160, text: "Say your body count out loud to give out 3 drinks, or drink 2 to keep the mystery.", nsfwLevel: 'Medium' },
  { id: 161, text: "Show the group the last spicy text you sent to give out 3 drinks.", nsfwLevel: 'Medium' },
  { id: 162, text: "Name the ick that ends things for you instantly; anyone guilty of it drinks.", nsfwLevel: 'Medium' },
  { id: 163, text: "Describe your ideal night in with someone in enough detail to give out 3 drinks.", nsfwLevel: 'Medium' },
  { id: 164, text: "Reveal the wildest place you'd be willing to get frisky to give out 3 drinks.", nsfwLevel: 'Medium' },
  { id: 165, text: "Admit which player you'd swipe right on to give out 3 drinks, or drink 1.", nsfwLevel: 'Medium' },
  { id: 166, text: "Confess a crush you had that would genuinely surprise everyone here, or drink 2.", nsfwLevel: 'Medium' },

  // --- Medium: Phone & Reveal Stunts ---
  { id: 167, text: "Text your most recent crush a single 👀 and show the group the send, or drink 3.", nsfwLevel: 'Medium' },
  { id: 168, text: "Show the group your most recent selfie, the one you didn't post, or drink 2.", nsfwLevel: 'Medium' },
  { id: 169, text: "Read your boldest DM out loud, or drink 3.", nsfwLevel: 'Medium' },
  { id: 170, text: "Let the group ask you one yes-or-no question about your love life; answer or drink 2.", nsfwLevel: 'Medium' },
  { id: 171, text: "Trade phones with {{randomOtherPlayer}} for one round; no deleting.", nsfwLevel: 'Medium' },
  { id: 172, text: "Let {{randomOtherPlayer}} post a one-word story to your close friends, or drink 3.", nsfwLevel: 'Medium' },

  // --- Medium: Social Drink Commands ---
  { id: 173, text: "Everyone showing skin below the collarbone right now, drink twice.", nsfwLevel: 'Medium' },
  { id: 174, text: "The last person here to hook up with someone, drink 2; welcome back.", nsfwLevel: 'Medium' },
  { id: 175, text: "Everyone single by choice, drink. Everyone single by circumstance, drink twice.", nsfwLevel: 'Medium' },
  { id: 176, text: "Anyone who's ever dated someone in this room, or wanted to, drink.", nsfwLevel: 'Medium' },
  { id: 177, text: "The most recently heartbroken person here finishes their drink; the group toasts you.", nsfwLevel: 'Medium' },
  { id: 178, text: "Everyone born under a fire sign, drink 2 and act surprised.", nsfwLevel: 'Medium' },
  { id: 179, text: "Anyone who thinks they're the best-looking person in the room, drink; bold move.", nsfwLevel: 'Medium' },
  { id: 180, text: "Anyone who's ever been called a heartbreaker, give out 2 drinks.", nsfwLevel: 'Medium' },
  { id: 181, text: "Take a drink for every year since your last relationship; round up.", nsfwLevel: 'Medium' },
  { id: 182, text: "Everyone wearing black tonight, drink; you know exactly what you're doing.", nsfwLevel: 'Medium' },
  { id: 183, text: "Anyone not wearing socks right now, take a drink.", nsfwLevel: 'Medium' },
  { id: 184, text: "The person who's checked their phone most this round drinks twice.", nsfwLevel: 'Medium' },

  // --- Medium: Flirty Challenges ---
  { id: 185, text: "Reenact the face you make when a text from a crush lights up your phone.", nsfwLevel: 'Medium' },
  { id: 186, text: "Whisper the number of people you've kissed to {{randomOtherPlayer}}; they decide if the group finds out.", nsfwLevel: 'Medium' },
  { id: 187, text: "Rank the room by who you'd want stranded on an island with; most romantic reasons win a drink to give out.", nsfwLevel: 'Medium' },
  { id: 188, text: "Admit the pettiest thing you've done after a breakup, or drink 2.", nsfwLevel: 'Medium' },
  { id: 189, text: "Let {{randomOtherPlayer}} choose one word you have to work into conversation until your next turn; fail and drink.", nsfwLevel: 'Medium' },
  { id: 190, text: "Describe your worst kiss ever without naming who it was with.", nsfwLevel: 'Medium' },
  { id: 191, text: "Everyone vote for the biggest tease in the room; they give out 3 drinks.", nsfwLevel: 'Medium' },
  { id: 192, text: "Confess the last thing that made you blush, or drink 2.", nsfwLevel: 'Medium' },
  { id: 193, text: "Look at {{randomOtherPlayer}} and finish this sentence out loud: 'If we were alone right now...'", nsfwLevel: 'Medium' },
  { id: 194, text: "Give {{randomOtherPlayer}} a genuine, uninterrupted 15-second compliment; no jokes allowed.", nsfwLevel: 'Medium' },
  { id: 195, text: "Reveal the most attractive thing about the last person you dated, or drink 1.", nsfwLevel: 'Medium' },
  { id: 196, text: "Everyone who's ever kept a hookup a secret from this exact group, drink.", nsfwLevel: 'Medium' },

  // --- Medium: More Spicy Confessions ---
  { id: 197, text: "Confess the most inappropriate time you've caught yourself flirting.", nsfwLevel: 'Medium' },
  { id: 198, text: "What's the wildest thing you've done just because someone dared you?", nsfwLevel: 'Medium' },
  { id: 199, text: "Describe your worst 'what was I thinking' hookup, no names.", nsfwLevel: 'Medium' },
  { id: 200, text: "What's the pettiest reason you've ever swiped left on someone?", nsfwLevel: 'Medium' },
  { id: 201, text: "Confess the last time you flirted purely for the attention.", nsfwLevel: 'Medium' },
  { id: 202, text: "What's the most embarrassing thing you've done to keep someone interested?", nsfwLevel: 'Medium' },
  { id: 203, text: "Tell the group about the one that got away, or drink 2.", nsfwLevel: 'Medium' },
  { id: 204, text: "What's the closest you've ever come to a public scandal?", nsfwLevel: 'Medium' },
  { id: 205, text: "Confess the boldest lie you've told to get out of a bad date.", nsfwLevel: 'Medium' },
  { id: 206, text: "Describe the moment you realized you were way too into someone.", nsfwLevel: 'Medium' },
  { id: 207, text: "What's a hookup story your friends still won't let you live down?", nsfwLevel: 'Medium' },
  { id: 208, text: "What's the most trouble a text has ever gotten you into?", nsfwLevel: 'Medium' },

  // --- Medium: More Flirty Questions ---
  { id: 209, text: "Who in this room would you most want to be stranded with overnight?", nsfwLevel: 'Medium' },
  { id: 210, text: "What's the most attractive thing {{randomOtherPlayer}} is wearing right now?", nsfwLevel: 'Medium' },
  { id: 211, text: "If you had to kiss someone here to save your life, who and where?", nsfwLevel: 'Medium' },
  { id: 212, text: "What's your most shameless move when you're actually interested in someone?", nsfwLevel: 'Medium' },
  { id: 213, text: "Who here has the most dangerous smile? They give out 2 drinks.", nsfwLevel: 'Medium' },
  { id: 214, text: "What's the quickest someone has ever turned you on without touching you?", nsfwLevel: 'Medium' },
  { id: 215, text: "If {{randomOtherPlayer}} asked you out right now, what's your honest answer?", nsfwLevel: 'Medium' },
  { id: 216, text: "Who in this room is most your type physically? Say it or drink 2.", nsfwLevel: 'Medium' },
  { id: 217, text: "What's an outfit that instantly gets your attention on someone?", nsfwLevel: 'Medium' },
  { id: 218, text: "What would your perfect night alone with someone you wanted actually look like?", nsfwLevel: 'Medium' },
  { id: 219, text: "Rate how good a kisser you think you are, then find someone here to confirm it.", nsfwLevel: 'Medium' },
  { id: 220, text: "Who here would you trust to pick your outfit for a first date? They give out 2 drinks.", nsfwLevel: 'Medium' },

  // --- Medium: More Drink If (Sexual History) ---
  { id: 221, text: "Drink if you've ever had a crush on a friend's ex.", nsfwLevel: 'Medium' },
  { id: 222, text: "Drink if you've ever kissed someone within an hour of meeting them.", nsfwLevel: 'Medium' },
  { id: 223, text: "Drink if you've ever pretended to like someone just for the attention.", nsfwLevel: 'Medium' },
  { id: 224, text: "Drink if you've been caught checking someone out tonight.", nsfwLevel: 'Medium' },
  { id: 225, text: "Drink if you've ever left a party with someone you'd just met.", nsfwLevel: 'Medium' },
  { id: 226, text: "Drink if you've had a hookup you'd repeat but would never admit to.", nsfwLevel: 'Medium' },
  { id: 227, text: "Drink if you've ever saved someone's number under a fake name.", nsfwLevel: 'Medium' },
  { id: 228, text: "Take a sip for every person here you've considered as more than a friend.", nsfwLevel: 'Medium' },
  { id: 229, text: "Drink if you've ever sent a risky text and immediately regretted it.", nsfwLevel: 'Medium' },
  { id: 230, text: "Drink if you've shot your shot at someone way out of your league.", nsfwLevel: 'Medium' },
  { id: 231, text: "Anyone who's ever had a serious work crush, drink twice.", nsfwLevel: 'Medium' },
  { id: 232, text: "Drink if you've re-downloaded a dating app out of pure boredom.", nsfwLevel: 'Medium' },

  // --- Medium: More Voting & Group Heat ---
  { id: 233, text: "Everyone vote: who's most likely to say yes to a spontaneous adventure? They give out 2 drinks.", nsfwLevel: 'Medium' },
  { id: 234, text: "Who here has the best trouble energy? They drink 2.", nsfwLevel: 'Medium' },
  { id: 235, text: "Vote for who'd last longest on a dating show; the winner gives out 3 drinks.", nsfwLevel: 'Medium' },
  { id: 236, text: "Who in this room is the biggest secret romantic? They drink 2.", nsfwLevel: 'Medium' },
  { id: 237, text: "Everyone point at once: who's most likely to fall in love this year? They drink 2.", nsfwLevel: 'Medium' },
  { id: 238, text: "Who here would be the most dangerous to share a hotel room with? They give out 3 drinks.", nsfwLevel: 'Medium' },
  { id: 239, text: "Everyone vote: whose DMs are the most chaotic? They hand over their phone or drink 3.", nsfwLevel: 'Medium' },
  { id: 240, text: "Who's most likely to make the first move tonight? They drink 2.", nsfwLevel: 'Medium' },

  // --- Medium: More Sensual Dares (Light) ---
  { id: 241, text: "Rest your head on {{randomOtherPlayer}}'s shoulder for the next two rounds.", nsfwLevel: 'Medium' },
  { id: 242, text: "Give {{randomOtherPlayer}} a compliment so smooth the whole room groans, or drink 2.", nsfwLevel: 'Medium' },
  { id: 243, text: "Hold hands with {{randomOtherPlayer}} until your next turn; let go early and drink.", nsfwLevel: 'Medium' },
  { id: 244, text: "Look {{randomOtherPlayer}} dead in the eyes and say something you'd usually only dare to text.", nsfwLevel: 'Medium' },
  { id: 245, text: "Whisper your favorite thing about tonight into {{randomOtherPlayer}}'s ear.", nsfwLevel: 'Medium' },
  { id: 246, text: "Let {{randomOtherPlayer}} slowly fix your hair or collar, or take 2 drinks.", nsfwLevel: 'Medium' },
  { id: 247, text: "Tell {{randomOtherPlayer}} exactly how you'd plan a date to impress them.", nsfwLevel: 'Medium' },
  { id: 248, text: "Trace the outline of {{randomOtherPlayer}}'s hand with your finger while holding eye contact.", nsfwLevel: 'Medium' },
  { id: 249, text: "Let {{randomOtherPlayer}} pick a pet name to call you for the rest of the game.", nsfwLevel: 'Medium' },
  { id: 250, text: "Slow dance with {{randomOtherPlayer}} close enough to whisper, or drink 2.", nsfwLevel: 'Medium' },

  // --- Medium: More Reveals & Phone ---
  { id: 251, text: "Show the group the last search you'd be a little embarrassed by, or drink 3.", nsfwLevel: 'Medium' },
  { id: 252, text: "Read your last outgoing text in the voice of someone seducing a stranger.", nsfwLevel: 'Medium' },
  { id: 253, text: "Reveal the pet name saved for your most recent crush, or drink 2.", nsfwLevel: 'Medium' },
  { id: 254, text: "Show the last person you texted 'goodnight', or drink 3.", nsfwLevel: 'Medium' },
  { id: 255, text: "Let {{randomOtherPlayer}} scroll to your oldest saved photo and react to it.", nsfwLevel: 'Medium' },
  { id: 256, text: "Read the first line of your last flirty conversation out loud, or drink 3.", nsfwLevel: 'Medium' },
  { id: 257, text: "Reveal how many unread dating-app messages you have right now, or drink 2.", nsfwLevel: 'Medium' },
  { id: 258, text: "Hand your phone to {{randomOtherPlayer}} and let them send one emoji to anyone, or drink 3.", nsfwLevel: 'Medium' },

  // --- Medium: More Social Commands ---
  { id: 259, text: "Everyone wearing something they'd happily take off if it got warmer, drink.", nsfwLevel: 'Medium' },
  { id: 260, text: "The best-dressed person here gives out 2 drinks; everyone else votes on who.", nsfwLevel: 'Medium' },
  { id: 261, text: "Anyone who's thought about someone in this room in a not-so-friendly way, drink.", nsfwLevel: 'Medium' },
  { id: 262, text: "Everyone who came out tonight secretly hoping something might happen, drink twice.", nsfwLevel: 'Medium' },
  { id: 263, text: "Anyone who's flirted with someone in this room before tonight, drink.", nsfwLevel: 'Medium' },
  { id: 264, text: "Everyone who's ever caught feelings faster than they'd admit, drink.", nsfwLevel: 'Medium' },

  // ============================================================================
  // EXTREME (IDs 300-538) - Escalating heat: confessions, dares & explicit play
  // ============================================================================

  // --- Extreme: Explicit Confessions ---
  { id: 300, text: "Describe, in detail, the filthiest thing you've ever done, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 301, text: "What's the kinkiest thing you've tried and would absolutely do again?", nsfwLevel: 'Extreme' },
  { id: 302, text: "Reveal the fantasy you've never said out loud, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 303, text: "Tell the group exactly what you'd do to {{randomOtherPlayer}} if the room were empty, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 304, text: "What's the riskiest place you've ever finished what you started?", nsfwLevel: 'Extreme' },
  { id: 305, text: "Confess the wildest thing you've been talked into in bed.", nsfwLevel: 'Extreme' },
  { id: 306, text: "Name the person in this room you'd break your own rules for, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 307, text: "Describe how you like to be touched, then let {{randomOtherPlayer}} demonstrate, or drink 2.", nsfwLevel: 'Extreme' },
  { id: 308, text: "What's the most people you've been with in a single week? Drink that number if you'd rather not say.", nsfwLevel: 'Extreme' },
  { id: 309, text: "Whisper your dirtiest fantasy to {{randomOtherPlayer}}, or take 2 drinks.", nsfwLevel: 'Extreme' },
  { id: 310, text: "Confess the most scandalous thing on your phone right now, or hand it to {{randomOtherPlayer}} for 30 seconds.", nsfwLevel: 'Extreme' },
  { id: 311, text: "Reveal the roleplay you'd actually want to try, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 312, text: "What are you into that you'd never admit on a first date? Say it or take 3.", nsfwLevel: 'Extreme' },
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
  { id: 330, text: "Kiss {{randomOtherPlayer}} slowly, no drinks to hide behind, or take 2.", nsfwLevel: 'Extreme' },
  { id: 331, text: "Make out with {{randomOtherPlayer}} for 15 seconds while the room counts.", nsfwLevel: 'Extreme' },
  { id: 332, text: "Kiss {{randomOtherPlayer}} like you mean it, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 333, text: "Let {{randomOtherPlayer}} kiss you anywhere above the waist they choose, or take 2 drinks.", nsfwLevel: 'Extreme' },
  { id: 334, text: "Hover your lips over {{randomOtherPlayer}}'s without touching for 20 seconds; first to close the gap wins, the other drinks.", nsfwLevel: 'Extreme' },
  { id: 335, text: "Kiss the last place you'd expect on {{randomOtherPlayer}}, their choice, or take 2.", nsfwLevel: 'Extreme' },
  { id: 336, text: "Demonstrate on {{randomOtherPlayer}} exactly how you like to be kissed, or drink 2.", nsfwLevel: 'Extreme' },
  { id: 337, text: "Pass an ice cube to {{randomOtherPlayer}} using only your mouth.", nsfwLevel: 'Extreme' },

  // --- Extreme: Neck, Marking & Body Kissing ---
  { id: 338, text: "Kiss {{randomOtherPlayer}}'s neck for 15 seconds, or take 2 drinks.", nsfwLevel: 'Extreme' },
  { id: 339, text: "Leave a mark on {{randomOtherPlayer}} somewhere only they'll find later, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 340, text: "Let {{randomOtherPlayer}} kiss a slow trail from your ear to your collarbone, or take 2.", nsfwLevel: 'Extreme' },
  { id: 341, text: "Kiss your way down {{randomOtherPlayer}}'s arm to their fingertips, or drink 2.", nsfwLevel: 'Extreme' },
  { id: 342, text: "Bite {{randomOtherPlayer}}'s earlobe and whisper one thing you'd do to them, or take 2 drinks.", nsfwLevel: 'Extreme' },
  { id: 343, text: "Let {{randomOtherPlayer}} choose one spot above the belt for you to kiss for 10 seconds, or drink 2.", nsfwLevel: 'Extreme' },

  // --- Extreme: Touch, Ice & Body Shots ---
  { id: 344, text: "Take a body shot off {{randomOtherPlayer}}; they pick the spot.", nsfwLevel: 'Extreme' },
  { id: 345, text: "Let {{randomOtherPlayer}} take a body shot off you; you pick the spot, they don't get to argue.", nsfwLevel: 'Extreme' },
  { id: 346, text: "Lick whipped cream off {{randomOtherPlayer}} wherever they dab it, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 347, text: "Run an ice cube across {{randomOtherPlayer}}'s skin using only your mouth; you choose where, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 348, text: "Let {{randomOtherPlayer}} slide a hand slowly up your thigh; you say when to stop, or drink 2.", nsfwLevel: 'Extreme' },
  { id: 349, text: "Explore {{randomOtherPlayer}} with your hands over clothes for 30 seconds, or take 2 drinks.", nsfwLevel: 'Extreme' },
  { id: 350, text: "Suck on {{randomOtherPlayer}}'s finger while holding eye contact, or take 2 drinks.", nsfwLevel: 'Extreme' },
  { id: 351, text: "Let {{randomOtherPlayer}} trace every inch of your neck and arms with their fingertips for a minute, or drink 2.", nsfwLevel: 'Extreme' },

  // --- Extreme: Lap Dances & Grinding ---
  { id: 352, text: "Give {{randomOtherPlayer}} a lap dance for a full song, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 353, text: "Receive a lap dance from {{randomOtherPlayer}} and keep a straight face, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 354, text: "Grind on {{randomOtherPlayer}} for 30 seconds, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 355, text: "Straddle {{randomOtherPlayer}} for 30 seconds and whisper what you're thinking, or drink 3.", nsfwLevel: 'Extreme' },
  { id: 356, text: "Sit facing {{randomOtherPlayer}} on their lap for the next two rounds.", nsfwLevel: 'Extreme' },

  // --- Extreme: Stripping & Strip Teases ---
  { id: 357, text: "Remove one item of clothing, or take 2 drinks.", nsfwLevel: 'Extreme' },
  { id: 358, text: "Let {{randomOtherPlayer}} choose which layer you lose, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 359, text: "Give {{randomOtherPlayer}} a strip tease to one full song, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 360, text: "Use only your teeth to take off one piece of {{randomOtherPlayer}}'s clothing, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 361, text: "Strip to your underwear for the next 3 rounds, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 362, text: "Swap one item of clothing with {{randomOtherPlayer}} and wear it until your next turn.", nsfwLevel: 'Extreme' },
  { id: 363, text: "Put on a song and let {{randomOtherPlayer}} undo one button, zipper, or clasp per line of the chorus, or drink 3.", nsfwLevel: 'Extreme' },
  { id: 364, text: "Send your top to the middle of the table for the next round, or take 3 drinks.", nsfwLevel: 'Extreme' },

  // --- Extreme: Spanking, Restraints & Power ---
  { id: 365, text: "Spank {{randomOtherPlayer}} once, hard, or take 1 drinks.", nsfwLevel: 'Extreme' },
  { id: 366, text: "Let {{randomOtherPlayer}} spank you and count it out loud, or take 2 drinks.", nsfwLevel: 'Extreme' },
  { id: 367, text: "Let {{randomOtherPlayer}} tie your hands with whatever's nearby for the next two rounds, or drink 2.", nsfwLevel: 'Extreme' },
  { id: 368, text: "Pin {{randomOtherPlayer}} against the nearest wall for 15 seconds, or take 2 drinks.", nsfwLevel: 'Extreme' },
  { id: 369, text: "Obey one command from {{randomOtherPlayer}} this round, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 370, text: "Get blindfolded while {{randomOtherPlayer}} plants one kiss somewhere; guess where after, or drink 2.", nsfwLevel: 'Extreme' },
  { id: 371, text: "Get blindfolded and let {{randomOtherPlayer}} guide your hands anywhere above the waist for 20 seconds, or take 2.", nsfwLevel: 'Extreme' },

  // --- Extreme: Simulated & Narrated ---
  { id: 372, text: "Recreate your go-to move on {{randomOtherPlayer}}, fully clothed, for 15 seconds, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 373, text: "Simulate your favorite position with {{randomOtherPlayer}} for 15 seconds, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 374, text: "Perform a convincing 10-second preview of your bedroom noises, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 375, text: "Whisper a play-by-play of what you'd do to {{randomOtherPlayer}} until they blush or tell you to stop, or drink 3.", nsfwLevel: 'Extreme' },
  { id: 376, text: "Narrate exactly how you'd undress {{randomOtherPlayer}} without touching them, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 377, text: "Demonstrate on {{randomOtherPlayer}}'s neck how you'd start the night if it were just the two of you, or drink 3.", nsfwLevel: 'Extreme' },

  // --- Extreme: Explicit Contact & High Heat ---
  { id: 378, text: "Let {{randomOtherPlayer}} rest a hand wherever they like for a full round; you can move it once, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 379, text: "Lie back and let {{randomOtherPlayer}} kiss from your collarbone to your waistband, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 380, text: "Let {{randomOtherPlayer}} bite you anywhere above the waist they choose, or take 2 drinks.", nsfwLevel: 'Extreme' },
  { id: 381, text: "Demonstrate your best oral technique on a finger, a bottle, or {{randomOtherPlayer}}'s choosing, or drink 3.", nsfwLevel: 'Extreme' },
  { id: 382, text: "Motorboat or be motorboated by {{randomOtherPlayer}}; pick a role, or take 2 drinks.", nsfwLevel: 'Extreme' },
  { id: 383, text: "Let {{randomOtherPlayer}} draw something on your bare stomach, clothing up, or take 2 drinks.", nsfwLevel: 'Extreme' },
  { id: 384, text: "Give {{randomOtherPlayer}} a 30-second massage anywhere they point, over clothes, or take 2 drinks.", nsfwLevel: 'Extreme' },

  // --- Extreme: Phone & Reveal (Explicit) ---
  { id: 385, text: "Show the group the last risqué photo in your phone, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 386, text: "Text your most recent hookup 'thinking about you' right now; screenshot the send or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 387, text: "Take a photo you'd never post, keep it private, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 388, text: "Let {{randomOtherPlayer}} scroll your camera roll for 15 seconds, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 389, text: "Reveal the wildest thing in your nightstand, or drink 3.", nsfwLevel: 'Extreme' },
  { id: 390, text: "Confess the roleplay or scenario that never fails for you, or take 3 drinks.", nsfwLevel: 'Extreme' },

  // --- Extreme: Group & Private Escalation ---
  { id: 391, text: "Everyone strips one layer at the same time; last one undressed finishes their drink.", nsfwLevel: 'Extreme' },
  { id: 392, text: "Spin for it: whoever it lands on, make out for 20 seconds or you both take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 393, text: "Take {{randomOtherPlayer}} somewhere private for 3 minutes, or you both finish your drinks.", nsfwLevel: 'Extreme' },
  { id: 394, text: "Get seven minutes alone with {{randomOtherPlayer}}; the group sets the timer, or you both take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 395, text: "Let the group vote on one dare for you and {{randomOtherPlayer}} together; majority rules, no vetoes, or you both finish.", nsfwLevel: 'Extreme' },
  { id: 396, text: "Trade one dare with {{randomOtherPlayer}} that you both actually have to do, or you both finish your drinks.", nsfwLevel: 'Extreme' },
  { id: 397, text: "Kiss the two people beside you, one after the other, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 398, text: "Let the group choose one article of clothing you lose for the rest of the game.", nsfwLevel: 'Extreme' },

  // --- Extreme: Confess or Consequence ---
  { id: 399, text: "Name the two people here you'd pick for a fantasy scenario, and who does what, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 400, text: "Rank the room by who you'd most want to go home with tonight; say it out loud or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 401, text: "Let {{randomOtherPlayer}} ask you any three questions about your sex life; lie once and you both drink.", nsfwLevel: 'Extreme' },
  { id: 402, text: "Let {{randomOtherPlayer}} whisper the filthiest thing they'd do to you; repeat it to the group or drink 3.", nsfwLevel: 'Extreme' },
  { id: 403, text: "Confess the closest you've ever come to a truly wild story, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 404, text: "Tell the group the one thing you'd never say sober, or take 3 drinks.", nsfwLevel: 'Extreme' },

  // --- Extreme: Final Escalation ---
  { id: 405, text: "Wear {{randomOtherPlayer}}'s choice of your remaining clothing until your next turn, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 406, text: "Let {{randomOtherPlayer}} decide: lose two layers or do their dare, no questions asked.", nsfwLevel: 'Extreme' },
  { id: 407, text: "Simulate a 15-second slow build with {{randomOtherPlayer}}: clothed, choreographed, committed, or drink 3.", nsfwLevel: 'Extreme' },
  { id: 408, text: "Let {{randomOtherPlayer}} leave one mark on you and choose where; hidden or not, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 409, text: "Give {{randomOtherPlayer}} the most convincing 10-second preview of your best move, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 410, text: "Let the group dare you to do one thing to {{randomOtherPlayer}}; majority rules, or you finish your drink.", nsfwLevel: 'Extreme' },
  { id: 411, text: "Whisper to {{randomOtherPlayer}} the one place you most want to be kissed, then let them decide, or drink 3.", nsfwLevel: 'Extreme' },
  { id: 412, text: "End the round your way: kiss {{randomOtherPlayer}} however you've been wanting to, or finish your drink.", nsfwLevel: 'Extreme' },

  // --- Extreme: More Explicit Confessions ---
  { id: 413, text: "Describe the most memorable thing someone's ever done to you in bed, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 414, text: "What's a hard limit you'd secretly renegotiate for the right person?", nsfwLevel: 'Extreme' },
  { id: 415, text: "Confess the wildest place you've ever wanted to be taken, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 416, text: "Tell {{randomOtherPlayer}} the first thing you'd take off them, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 417, text: "What's the most trouble you've ever gotten into over something in the bedroom?", nsfwLevel: 'Extreme' },
  { id: 418, text: "Reveal the fantasy you'd be too shy to ask a partner for, or drink 3.", nsfwLevel: 'Extreme' },
  { id: 419, text: "What's the boldest thing you've ever done to turn someone on?", nsfwLevel: 'Extreme' },
  { id: 420, text: "Confess the loudest you've ever been, and whether the neighbors knew, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 421, text: "Name the celebrity you'd throw all your standards away for, and exactly what you'd do.", nsfwLevel: 'Extreme' },
  { id: 422, text: "What's the quickest you've ever gone from just talking to something a lot more?", nsfwLevel: 'Extreme' },
  { id: 423, text: "Describe your ideal way to be woken up by someone, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 424, text: "Tell the group the most daring thing you've ever texted, word for word, or take 3 drinks.", nsfwLevel: 'Extreme' },

  // --- Extreme: More Drink If (Explicit) ---
  { id: 425, text: "Drink if you've hooked up somewhere semi-public and got away with it.", nsfwLevel: 'Extreme' },
  { id: 426, text: "Drink if you've ever left marks on someone, or been left with them.", nsfwLevel: 'Extreme' },
  { id: 427, text: "Drink if you've ever used ice, wax, or something hotter or colder than expected.", nsfwLevel: 'Extreme' },
  { id: 428, text: "Drink if you've had a hookup last until sunrise.", nsfwLevel: 'Extreme' },
  { id: 429, text: "Drink if you've ever done a striptease for someone in private.", nsfwLevel: 'Extreme' },
  { id: 430, text: "Drink if you've ever kept a souvenir from a hookup.", nsfwLevel: 'Extreme' },
  { id: 431, text: "Drink if you've sent a photo you'd panic about if it ever leaked.", nsfwLevel: 'Extreme' },
  { id: 432, text: "Drink if you've ever hooked up to a specific song on purpose.", nsfwLevel: 'Extreme' },
  { id: 433, text: "Drink if you've done something tonight you'd deny in the morning.", nsfwLevel: 'Extreme' },
  { id: 434, text: "Drink if you've ever played a character to spice things up.", nsfwLevel: 'Extreme' },
  { id: 435, text: "Drink if you've ever been the loud one and had to be shushed.", nsfwLevel: 'Extreme' },
  { id: 436, text: "Drink if you've had a hookup so good you texted a friend about it immediately.", nsfwLevel: 'Extreme' },

  // --- Extreme: More Kissing & Necking ---
  { id: 437, text: "Kiss {{randomOtherPlayer}} the way you'd kiss someone you'd waited all night for, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 438, text: "Give {{randomOtherPlayer}} three kisses, each somewhere different above the shoulders, or drink 3.", nsfwLevel: 'Extreme' },
  { id: 439, text: "Let {{randomOtherPlayer}} decide how long your next kiss lasts, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 440, text: "Kiss {{randomOtherPlayer}} slowly while the group counts to ten, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 441, text: "Trade one lingering kiss with {{randomOtherPlayer}}, eyes open the whole time, or drink 3.", nsfwLevel: 'Extreme' },
  { id: 442, text: "Let {{randomOtherPlayer}} guide your chin and kiss you however they like, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 443, text: "Whisper a countdown into {{randomOtherPlayer}}'s ear, then kiss them on zero, or drink 3.", nsfwLevel: 'Extreme' },

  // --- Extreme: More Marking & Body Kissing ---
  { id: 444, text: "Leave a slow kiss along {{randomOtherPlayer}}'s jaw, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 445, text: "Kiss the inside of {{randomOtherPlayer}}'s wrist and work your way up to the elbow, or drink 3.", nsfwLevel: 'Extreme' },
  { id: 446, text: "Let {{randomOtherPlayer}} choose a spot on your shoulders or back to mark, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 447, text: "Kiss {{randomOtherPlayer}}'s neck and tell them exactly what you're thinking, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 448, text: "Let {{randomOtherPlayer}} press their lips just below your ear for ten seconds, or drink 3.", nsfwLevel: 'Extreme' },
  { id: 449, text: "Give {{randomOtherPlayer}} a kiss that starts at the cheek and ends somewhere braver, or take 3 drinks.", nsfwLevel: 'Extreme' },

  // --- Extreme: More Touch, Ice & Food ---
  { id: 450, text: "Run a single ice cube from {{randomOtherPlayer}}'s collarbone to wherever they allow, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 451, text: "Let {{randomOtherPlayer}} feed you something using only their fingers, or drink 3.", nsfwLevel: 'Extreme' },
  { id: 452, text: "Trace slow circles on {{randomOtherPlayer}}'s lower back for 20 seconds, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 453, text: "Let {{randomOtherPlayer}} guide your hands to show you exactly how they like to be held, or drink 3.", nsfwLevel: 'Extreme' },
  { id: 454, text: "Take a shot from {{randomOtherPlayer}}'s collarbone with no hands, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 455, text: "Let {{randomOtherPlayer}} drip a little of their drink and lick it off your wrist, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 456, text: "Let {{randomOtherPlayer}} warm their hands on your back, under your shirt, for 15 seconds, or drink 3.", nsfwLevel: 'Extreme' },

  // --- Extreme: More Grinding, Lap & Movement ---
  { id: 457, text: "Dance behind {{randomOtherPlayer}} with your hands on their hips for one song, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 458, text: "Give {{randomOtherPlayer}} a 20-second lap dance with actual commitment, or drink 3.", nsfwLevel: 'Extreme' },
  { id: 459, text: "Let {{randomOtherPlayer}} lead a slow grind for 15 seconds while you follow, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 460, text: "Sit on {{randomOtherPlayer}}'s lap and feed them their next sip, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 461, text: "Press your back to {{randomOtherPlayer}}'s chest and sway for a full song, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 462, text: "Straddle {{randomOtherPlayer}}'s knee and hold eye contact for 15 seconds, or drink 3.", nsfwLevel: 'Extreme' },

  // --- Extreme: More Stripping ---
  { id: 463, text: "Let {{randomOtherPlayer}} remove one accessory from you using only their teeth, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 464, text: "Take off two layers in the sexiest way you can manage, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 465, text: "Peel off one layer while holding eye contact with {{randomOtherPlayer}}, or drink 3.", nsfwLevel: 'Extreme' },
  { id: 466, text: "Trade shirts with {{randomOtherPlayer}} and wear theirs for the rest of the game, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 467, text: "Give {{randomOtherPlayer}} a lap dance and let them remove one item, or finish your drink.", nsfwLevel: 'Extreme' },

  // --- Extreme: More Spanking, Restraints & Power ---
  { id: 468, text: "Let {{randomOtherPlayer}} hold your wrists above your head for 15 seconds, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 469, text: "Give {{randomOtherPlayer}} one firm spank and let them return it, or drink 3.", nsfwLevel: 'Extreme' },
  { id: 470, text: "Do whatever {{randomOtherPlayer}} tells you for the next full round, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 471, text: "Kneel in front of {{randomOtherPlayer}} and ask permission for your next move, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 472, text: "Let {{randomOtherPlayer}} blindfold you and trace one word on your skin to guess, or drink 3.", nsfwLevel: 'Extreme' },
  { id: 473, text: "Hand {{randomOtherPlayer}} full control of your next two turns, or finish your drink.", nsfwLevel: 'Extreme' },

  // --- Extreme: More Simulated & Narrated ---
  { id: 474, text: "Narrate, step by step, how you'd spend an hour alone with {{randomOtherPlayer}}, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 475, text: "Whisper the filthiest thing you'd say in the moment to {{randomOtherPlayer}}, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 476, text: "Demonstrate the pace you prefer using only your hands on the table, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 477, text: "Give a 10-second preview of your best moves against {{randomOtherPlayer}}'s back, or drink 3.", nsfwLevel: 'Extreme' },
  { id: 478, text: "Describe, in detail, exactly how you'd take {{randomOtherPlayer}} apart, or finish your drink.", nsfwLevel: 'Extreme' },

  // --- Extreme: More Phone & Reveal ---
  { id: 479, text: "Show {{randomOtherPlayer}} the spiciest thing in your phone; they decide if the group sees, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 480, text: "Text your last hookup one word that would get an immediate reply, or drink 3.", nsfwLevel: 'Extreme' },
  { id: 481, text: "Reveal the wildest thing you've ever agreed to over text, or finish your drink.", nsfwLevel: 'Extreme' },

  // --- Extreme: More Group & Private Escalation ---
  { id: 482, text: "Pick two people to join you for a 15-second group slow dance, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 483, text: "Disappear with {{randomOtherPlayer}} for two minutes; the group guesses what happened, or you both finish your drinks.", nsfwLevel: 'Extreme' },
  { id: 484, text: "Everyone locks eyes with the person they'd most want right now; hold it for ten seconds or drink 2.", nsfwLevel: 'Extreme' },
  { id: 485, text: "Let the group pick two people to swap one dare; both must do it, or both finish your drinks.", nsfwLevel: 'Extreme' },
  { id: 486, text: "Kiss the two people beside you, then let them decide who kissed better, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 487, text: "Take {{randomOtherPlayer}} out of the room and come back with one item of clothing swapped, or finish your drink.", nsfwLevel: 'Extreme' },

  // --- Extreme: Final Escalation ---
  { id: 488, text: "Let {{randomOtherPlayer}} write one dare on your skin that you have to complete before your next turn, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 489, text: "Give {{randomOtherPlayer}} the most convincing preview of what a night with you looks like, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 490, text: "Let {{randomOtherPlayer}} choose: two layers gone or their dare, no questions asked.", nsfwLevel: 'Extreme' },
  { id: 491, text: "Close the round however you want with {{randomOtherPlayer}}, as long as it's bolder than your last turn, or finish your drink.", nsfwLevel: 'Extreme' },

  // --- Extreme: Drink If (Explicit Acts) ---
  { id: 492, text: "Drink if you've ever swallowed; if you never have, take 2 instead.", nsfwLevel: 'Extreme' },
  { id: 493, text: "Drink if you've ever let someone finish on your face.", nsfwLevel: 'Extreme' },
  { id: 494, text: "Drink if you've ever been double-penetrated.", nsfwLevel: 'Extreme' },
  { id: 495, text: "Drink if you've ever given or received a golden shower.", nsfwLevel: 'Extreme' },
  { id: 496, text: "Drink if you've ever been fisted, or done the fisting.", nsfwLevel: 'Extreme' },
  { id: 497, text: "Drink if you've ever had sex on your period.", nsfwLevel: 'Extreme' },
  { id: 498, text: "Drink if you've ever done anal without lube; respect.", nsfwLevel: 'Extreme' },
  { id: 499, text: "Drink if you've ever used a butt plug in the bedroom.", nsfwLevel: 'Extreme' },
  { id: 500, text: "Drink if you've ever been spit on in bed and liked it.", nsfwLevel: 'Extreme' },
  { id: 501, text: "Drink if you've ever squirted, or made someone else.", nsfwLevel: 'Extreme' },
  { id: 502, text: "Drink if you've ever had a hand around your throat and asked for more.", nsfwLevel: 'Extreme' },
  { id: 503, text: "Drink if you've ever finished more than once in a single session.", nsfwLevel: 'Extreme' },
  { id: 504, text: "Drink if you've ever deep-throated, dare or otherwise.", nsfwLevel: 'Extreme' },
  { id: 505, text: "Drink if you've ever tasted yourself.", nsfwLevel: 'Extreme' },
  { id: 506, text: "Drink if you've ever rimmed someone, or been rimmed.", nsfwLevel: 'Extreme' },
  { id: 507, text: "Drink if you've ever pegged someone, or been pegged.", nsfwLevel: 'Extreme' },
  { id: 508, text: "Drink if you've ever left nail marks down someone's back.", nsfwLevel: 'Extreme' },
  { id: 509, text: "Drink if you've ever come so hard you saw stars.", nsfwLevel: 'Extreme' },

  // --- Extreme: Drink If (Taboo & Wild) ---
  { id: 510, text: "Drink if you've ever had sex in a church, temple, or anywhere holy.", nsfwLevel: 'Extreme' },
  { id: 511, text: "Drink if you've ever hooked up at a funeral or a wedding.", nsfwLevel: 'Extreme' },
  { id: 512, text: "Drink if you've ever hooked up with a family member's friend.", nsfwLevel: 'Extreme' },
  { id: 513, text: "Drink if you've ever slept with someone 15+ years older or younger than you.", nsfwLevel: 'Extreme' },
  { id: 514, text: "Drink if you've ever slept with a friend's ex and never confessed.", nsfwLevel: 'Extreme' },
  { id: 515, text: "Drink if you've ever had sex at your workplace after hours.", nsfwLevel: 'Extreme' },
  { id: 516, text: "Drink if you've ever hooked up with someone twice your age.", nsfwLevel: 'Extreme' },
  { id: 517, text: "Drink if you've ever been the other person in an affair.", nsfwLevel: 'Extreme' },
  { id: 518, text: "Drink if you've ever hooked up with two people in the same night.", nsfwLevel: 'Extreme' },
  { id: 519, text: "Drink if you've ever hooked up with someone you wouldn't dare name out loud.", nsfwLevel: 'Extreme' },
  { id: 520, text: "Drink if you've ever had sex in your childhood bedroom as a grown adult.", nsfwLevel: 'Extreme' },

  // --- Extreme: Drink If (Paid & Provocative) ---
  { id: 521, text: "Drink if you've ever been paid for anything sexual; strip a layer if yes.", nsfwLevel: 'Extreme' },
  { id: 522, text: "Drink if you've ever had a sugar daddy or sugar mommy; lose a layer if it's still active.", nsfwLevel: 'Extreme' },
  { id: 523, text: "Drink if you've ever paid for sex; admit it or lose a layer.", nsfwLevel: 'Extreme' },
  { id: 524, text: "Drink if you've ever made money from a photo of yourself.", nsfwLevel: 'Extreme' },
  { id: 525, text: "Drink if you've ever had a spicy subscription account, or paid for someone else's.", nsfwLevel: 'Extreme' },

  // --- Extreme: Explicit Dares (Hands & Simulation) ---
  { id: 526, text: "Let {{randomOtherPlayer}} slip a hand into your waistband for 10 seconds, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 527, text: "Slide a hand under {{randomOtherPlayer}}'s clothes and tease for 15 seconds, or drink 3.", nsfwLevel: 'Extreme' },
  { id: 528, text: "Let {{randomOtherPlayer}} undo your pants and slip a hand exactly where they like, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 529, text: "Suck {{randomOtherPlayer}}'s toe like you actually mean it, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 530, text: "Guide {{randomOtherPlayer}}'s hand exactly where you'd want it and hold it there for 10 seconds, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 531, text: "Let {{randomOtherPlayer}} decide where your hands go for the next 20 seconds, or drink 3.", nsfwLevel: 'Extreme' },
  { id: 532, text: "Simulate going down on {{randomOtherPlayer}} for 10 seconds, fully clothed, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 533, text: "Let {{randomOtherPlayer}} grind against your thigh until the song changes, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 534, text: "Whisper to {{randomOtherPlayer}} exactly how you'd finish them off, or drink 3.", nsfwLevel: 'Extreme' },
  { id: 535, text: "Put two fingers in {{randomOtherPlayer}}'s mouth and let them show you what they'd do, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 536, text: "Kiss and bite your way down {{randomOtherPlayer}}'s stomach to their waistband, or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 537, text: "Press against {{randomOtherPlayer}} from behind and set the pace for 15 seconds, or drink 3.", nsfwLevel: 'Extreme' },
  { id: 538, text: "Let {{randomOtherPlayer}} slide your underwear off using only their teeth, or take 3 drinks.", nsfwLevel: 'Extreme' }
];
