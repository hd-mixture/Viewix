export const WISDOM_QUOTES: [string, string, string][] = [
  ["Every highlight", "marks a moment", "of understanding."],
  ["Clarity comes", "when you connect", "the right dots."],
  ["The best ideas", "are found between", "the margins."],
  ["Your workspace", "is an extension", "of your mind."],
  ["Great insights", "begin with a single", "annotation."],
  ["Read deeply,", "think clearly,", "create freely."],
  ["Knowledge grows", "when it is shared", "with others."],
  ["A single note", "can spark a", "thousand ideas."],
  ["Capture thoughts", "before they fade", "into the noise."],
  ["True wisdom", "lies in finding", "the right context."],
  ["Annotations build", "a bridge to", "future clarity."],
  ["The mind absorbs", "what the hand", "takes time to mark."],
  ["Design your thoughts", "as carefully as", "your workspace."],
  ["In collaboration,", "every perspective", "adds new depth."],
  ["A quiet space", "invites the loudest", "breakthroughs."],
  ["To understand fully,", "one must learn", "to read actively."],
  ["Leave a trail", "of insights for", "your future self."],
  ["Good design", "makes complexity", "feel effortless."],
  ["Ideas multiply", "when they are", "given structure."],
  ["The margin is", "where the true", "conversation happens."],
  ["Focus is the", "lens through which", "knowledge focuses."],
  ["Every document", "is a dialogue", "waiting to begin."],
  ["Highlighting is", "the art of", "distilling truth."],
  ["Your best work", "emerges from", "structured thought."],
  ["Do not just read;", "engage, question,", "and remember."],
  ["A workspace should", "calm the mind", "and spark the soul."],
  ["Wisdom is simply", "organized and", "applied knowledge."],
  ["Collaborate closely,", "communicate clearly,", "build together."],
  ["The cursor is", "the modern pen", "for digital minds."],
  ["Find the signal", "hidden within", "the daily noise."],
  ["Annotations turn", "passive reading", "into active learning."],
  ["A clear layout", "leads directly", "to clear thinking."],
  ["Knowledge shared", "is knowledge", "multiplied exponentially."],
  ["Capture the spark", "before the fire", "fades away."],
  ["Every PDF is", "a landscape of", "unexplored ideas."],
  ["The right tool", "gets out of", "your creative way."],
  ["Synthesize the old", "to create something", "entirely new."],
  ["Mark the text", "and let the text", "mark your mind."],
  ["Productivity is", "not speed, but", "focused direction."],
  ["A beautiful app", "inspires beautiful", "ways of thinking."],
  ["Keep it minimal.", "Keep it focused.", "Keep it yours."],
  ["The best interface", "is the one", "you barely notice."],
  ["Read with intent,", "annotate with care,", "review with joy."],
  ["Shared documents", "are the heartbeat", "of great teams."],
  ["A single highlight", "can illuminate", "an entire page."],
  ["Your notes are", "the architecture", "of your intellect."],
  ["Embrace the blank", "page; it is full", "of potential."],
  ["Design is not", "how it looks,", "but how it works."],
  ["Focus on the", "details, and the", "big picture forms."],
  ["Viewix is where", "your knowledge", "finds its home."]
];

/**
 * Returns a deterministic index based on the current local date.
 * This ensures the quote changes exactly once per day at midnight,
 * and remains consistent throughout that day.
 */
export function getDailyQuoteIndex(totalQuotes: number): number {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  
  // A simple deterministic pseudo-random number generator
  const x = Math.sin(seed) * 10000;
  const randomFraction = x - Math.floor(x);
  
  return Math.floor(randomFraction * totalQuotes);
}
