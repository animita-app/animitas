import { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { storySchema } from '@/hooks/use-create-memorial-form'

interface StoryStepProps {
  form: UseFormReturn<z.infer<typeof storySchema>>
  onSubmit: (values: z.infer<typeof storySchema>) => void
  apiError: string
}

export function StoryStep({ form, onSubmit, apiError }: StoryStepProps) {
  return (
    <Form {...form}>
      <form
        id="story-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 w-full max-w-sm"
      >
        <FormField
          control={form.control}
          name="story"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Historia (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Comparte una historia sobre la animita..."
                  className="resize-none rounded-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {apiError && <p className="text-sm text-destructive">{apiError}</p>}
      </form>
    </Form>
  )
}
