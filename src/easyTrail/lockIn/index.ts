/**
 * Lock In home (A3). HoldPractice (Journal's hold practice) lives here; Journal keeps the gate and renders it.
 * RecallGate stays in its component file. The hold helpers live in the A4 trail home (trail/loop.ts).
 */
export { HoldPractice } from './HoldPractice'
export { RecallGate } from '../../components/RecallGate'
export { easyHoldFields, easyHoldPractice, easyHoldView } from '../trail/loop.ts'
