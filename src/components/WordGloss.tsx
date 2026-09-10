import type { WordSense } from '../lib/words'

interface WordGlossProps {
  words: WordSense[]
  extra?: { term: string; sense: string }
}

/** Kid-plain gloss before a hard word is used in play. */
export function WordGloss({ words, extra }: WordGlossProps) {
  const seen = new Set<string>()
  const list: { term: string; sense: string }[] = []
  for (const word of words) {
    if (seen.has(word.term)) continue
    seen.add(word.term)
    list.push(word)
  }
  if (extra && !seen.has(extra.term)) {
    list.push(extra)
  }
  if (list.length === 0) return null
  return (
    <ul className="word-school" aria-label="Words to know">
      {list.map((word) => (
        <li key={word.term}>
          <strong>{word.term}</strong> — {word.sense}
        </li>
      ))}
    </ul>
  )
}
