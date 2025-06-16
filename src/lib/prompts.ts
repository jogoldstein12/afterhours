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
];
