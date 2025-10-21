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
import { Input } from '@/components/ui/input'
import { locationSchema } from '@/hooks/use-create-memorial-form'

interface LocationStepProps {
  form: UseFormReturn<z.infer<typeof locationSchema>>
  onSubmit: (values: z.infer<typeof locationSchema>) => void
  apiError: string
}

export function LocationStep({ form, onSubmit, apiError }: LocationStepProps) {
  return (
    <Form {...form}>
      <form
        id="location-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 w-full max-w-sm"
      >
        <FormField
          control={form.control}
          name="latitude"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Latitud</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="-33.8688"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="longitude"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Longitud</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="-71.1904"
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
