import { Plus } from 'lucide-react'
import Image from 'next/image'

interface AvatarUploadProps {
  image?: string
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  isLoading?: boolean
}

export function AvatarUpload({ image, onUpload, isLoading }: AvatarUploadProps) {
  return (
    <div className="relative size-16 shrink-0">
      <input
        type="file"
        id="person-image-upload"
        accept="image/*"
        onChange={onUpload}
        className="hidden"
        disabled={isLoading}
      />
      <label
        htmlFor="person-image-upload"
        className="cursor-pointer relative w-full h-full flex items-center justify-center"
      >
        {image ? (
          <>
            <Image
              src={image}
              alt="person"
              width={32}
              height={32}
              className="w-full h-full object-cover rounded-full border-2 border-muted"
            />
          </>
        ) : (
          <div className="w-full h-full rounded-full border-muted flex items-center justify-center bg-background-weaker">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
      </label>
    </div>
  )
}
