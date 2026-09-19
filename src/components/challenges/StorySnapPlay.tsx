import type { StoryPanel } from '../../lib/storyPanels'
import { StorySnapPlayView } from './StorySnapPlayView'

interface StorySnapPlayProps {
  lineId: string
  beats?: StoryPanel[]
  onMiss: () => void
  onClear?: () => void
  onEasyStop?: (dest: 'hold' | 'home') => void
}

/** Story Snap arcade — thin wrapper; view lives in StorySnapPlayView. */
export function StorySnapPlay(props: StorySnapPlayProps) {
  return <StorySnapPlayView {...props} />
}
