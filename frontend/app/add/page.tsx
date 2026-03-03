import { AddForm } from "@/components/forms/add-form"

export default function AddPage() {
  return (
    <div className="flex h-svh w-full items-center justify-center bg-background-weak p-6">
      <div className="w-full max-w-lg h-[60vh] bg-background rounded-xl shadow-sm overflow-hidden flex flex-col border border-border-weak">
        <AddForm />
      </div>
    </div>
  )
}
