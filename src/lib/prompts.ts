
export type NsfwLevel = 'Mild' | 'Medium' | 'Extreme';

export type Prompt = {
  id: number;
  text: string;
  nsfwLevel: NsfwLevel;
};

export const PROMPTS: Prompt[] = [
  // Mild
  { id: 1, text: "Share your most embarrassing childhood nickname and the story behind it.", nsfwLevel: 'Mild' },
  { id: 2, text: "What's your go-to karaoke song, even if you can't sing?", nsfwLevel: 'Mild' },
  { id: 3, text: "If you could have any superpower, what would it be and why?", nsfwLevel: 'Mild' },
  { id: 4, text: "Describe your dream vacation in detail.", nsfwLevel: 'Mild' },
  { id: 5, text: "What's a weird food combination you secretly enjoy?", nsfwLevel: 'Mild' },

  // Medium
  { id: 6, text: "Describe the most awkward first date you've ever been on.", nsfwLevel: 'Medium' },
  { id: 7, text: "What's a white lie you've told that spiraled out of control?", nsfwLevel: 'Medium' },
  { id: 8, text: "If you had to choose, would you rather give up cheese or oral sex for a year?", nsfwLevel: 'Medium' },
  { id: 9, text: "What's the most trouble you got into as a teenager?", nsfwLevel: 'Medium' },
  { id: 10, text: "Share a secret you've never told anyone in this room.", nsfwLevel: 'Medium' },

  // Extreme
  { id: 11, text: "What's the kinkiest thing you've ever considered trying?", nsfwLevel: 'Extreme' },
  { id: 12, text: "Describe your most scandalous public display of affection.", nsfwLevel: 'Extreme' },
  { id: 13, text: "Who in this room would you most likely have a one-night stand with, and why?", nsfwLevel: 'Extreme' },
  { id: 14, text: "What's the riskiest place you've ever had sex?", nsfwLevel: 'Extreme' },
  { id: 15, text: "Share your raunchiest, most NSFW fantasy in detail.", nsfwLevel: 'Extreme' },
  { id: 16, text: "Truth: Have you ever sent a nude to the wrong person? Dare: Send a flirty text to your latest contact.", nsfwLevel: 'Extreme' },
  { id: 17, text: "What's the most embarrassing thing on your phone right now?", nsfwLevel: 'Extreme' },
  { id: 18, text: "Lick someone’s nipples for 10 seconds.", nsfwLevel: 'Extreme' },
  { id: 19, text: "If you’ve had a threesome, take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 20, text: "Remove one piece of clothing for each person here you’ve kissed.", nsfwLevel: 'Extreme' },
  { id: 21, text: "Pour a shot into someone’s belly button and drink it.", nsfwLevel: 'Extreme' },
  { id: 22, text: "Give someone a hickey for 15 seconds.", nsfwLevel: 'Extreme' },
  { id: 23, text: "Spank someone — hard.", nsfwLevel: 'Extreme' },
  { id: 24, text: "Reveal your dirtiest sexual fantasy or take 4 drinks.", nsfwLevel: 'Extreme' },
  { id: 25, text: "Blindfold someone and kiss them somewhere unexpected.", nsfwLevel: 'Extreme' },
  { id: 26, text: "Sit on someone’s lap for the next 5 rounds.", nsfwLevel: 'Extreme' },
  { id: 27, text: "Remove someone’s top.", nsfwLevel: 'Extreme' },
  { id: 28, text: "If you’ve ever filmed yourself having sex, take 2 drinks.", nsfwLevel: 'Extreme' },
  { id: 29, text: "Swap underwear with someone for the next 10 minutes.", nsfwLevel: 'Extreme' },
  { id: 30, text: "Suck on someone’s finger slowly.", nsfwLevel: 'Extreme' },
  { id: 31, text: "Take a body shot off someone.", nsfwLevel: 'Extreme' },
  { id: 32, text: "Whisper the last dirty text you sent into someone’s ear.", nsfwLevel: 'Extreme' },
  { id: 33, text: "Pick someone to give you a lap dance.", nsfwLevel: 'Extreme' },
  { id: 34, text: "Strip down to your underwear for the next 3 rounds.", nsfwLevel: 'Extreme' },
  { id: 35, text: "If you’ve had sex outdoors, take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 36, text: "Flash the group or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 37, text: "Make out with someone for 15 seconds.", nsfwLevel: 'Extreme' },
  { id: 38, text: "Share your most recent sex dream or take 3 shots.", nsfwLevel: 'Extreme' },
  { id: 39, text: "Put ice down your underwear for the next round.", nsfwLevel: 'Extreme' },
  { id: 40, text: "Lick whipped cream off someone’s neck.", nsfwLevel: 'Extreme' },
  { id: 41, text: "Tell the group how many people you’ve slept with.", nsfwLevel: 'Extreme' },
  { id: 42, text: "If you've ever joined the mile high club, take 4 drinks.", nsfwLevel: 'Extreme' },
  { id: 43, text: "Remove someone’s pants using only your teeth.", nsfwLevel: 'Extreme' },
  { id: 44, text: "Suck on someone’s toe or take 2 shots.", nsfwLevel: 'Extreme' },
  { id: 45, text: "Call your last hookup and say “I miss your body” or take 4 drinks.", nsfwLevel: 'Extreme' },
  { id: 46, text: "Show the group the last nude you received (or take 5 drinks).", nsfwLevel: 'Extreme' },
  { id: 47, text: "Massage someone’s inner thighs for 30 seconds.", nsfwLevel: 'Extreme' },
  { id: 48, text: "Get handcuffed to a chair for the next 5 rounds.", nsfwLevel: 'Extreme' },
  { id: 49, text: "Take a naked selfie (not shared) or finish your drink.", nsfwLevel: 'Extreme' },
  { id: 50, text: "Put an ice cube in your mouth and kiss someone.", nsfwLevel: 'Extreme' },
  { id: 51, text: "Strip completely naked for the next round or take 5 drinks.", nsfwLevel: 'Extreme' },
  { id: 52, text: "Get blindfolded and allow someone to touch you wherever they want for 15 seconds.", nsfwLevel: 'Extreme' },
  { id: 53, text: "Give someone a strip tease for one full song.", nsfwLevel: 'Extreme' },
  { id: 54, text: "French kiss someone while the group watches.", nsfwLevel: 'Extreme' },
  { id: 55, text: "Tell the group your biggest sexual secret or take 4 shots.", nsfwLevel: 'Extreme' },
  { id: 56, text: "If you’ve had a one-night stand this year, remove one item of clothing.", nsfwLevel: 'Extreme' },
  { id: 57, text: "Kiss everyone in the room on the lips.", nsfwLevel: 'Extreme' },
  { id: 58, text: "Let someone draw something on your chest — clothing off.", nsfwLevel: 'Extreme' },
  { id: 59, text: "Demonstrate your favorite sex position (fully clothed) or take 3 shots.", nsfwLevel: 'Extreme' },
  { id: 60, text: "If you’ve ever slept with someone in this room, say who or take 5 drinks.", nsfwLevel: 'Extreme' },
  { id: 61, text: "Lick someone’s inner thigh.", nsfwLevel: 'Extreme' },
  { id: 62, text: "Wear nothing but your underwear for the rest of the game.", nsfwLevel: 'Extreme' },
  { id: 63, text: "Swap a piece of clothing with someone.", nsfwLevel: 'Extreme' },
  { id: 64, text: "Describe the kinkiest thing you’ve done, or take 3 drinks.", nsfwLevel: 'Extreme' },
  { id: 65, text: "Get spanked with a belt or take 3 shots.", nsfwLevel: 'Extreme' },
  { id: 66, text: "Perform a fake orgasm for 10 seconds.", nsfwLevel: 'Extreme' },
  { id: 67, text: "Let someone tie you up with whatever’s in the room.", nsfwLevel: 'Extreme' },
];
