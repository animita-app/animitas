import 'react'

declare module 'react' {
  interface ViewTransitionProps {
    name?: string
    children?: React.ReactNode
  }
  export const ViewTransition: React.FC<ViewTransitionProps>
}
