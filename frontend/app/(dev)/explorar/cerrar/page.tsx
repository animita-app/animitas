import { notFound } from 'next/navigation'
import { CloseOptions } from './close-options'

// Dev-only: options for the control that closes sheets and dialogs, side by side, to pick one.
export default function ExploreClosePage() {
  if (process.env.NODE_ENV !== 'development') notFound()
  return <CloseOptions />
}
