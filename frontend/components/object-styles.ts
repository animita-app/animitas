// The objects that stand in for controls, written once so every form uses the same ones.
// A road sign you press: green to move on, add `road-sign-blue` for an outside service. It sizes its own icon.
export const SIGN_ACTION = "road-sign road-sign-text road-sign-action inline-flex min-h-10 items-center justify-center gap-2 px-5 py-1.5 disabled:cursor-default disabled:opacity-60 [&_svg]:size-4 [&_svg]:shrink-0"

// A slip of paper you write on, for inputs and textareas. Add `paper-line` for a one-line field.
export const PAPER_FIELD = "paper-note rounded-none border-0 px-4 text-base shadow-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
