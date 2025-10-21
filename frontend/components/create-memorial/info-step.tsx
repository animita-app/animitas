import { Plus, X } from 'lucide-react'
import { UseFieldArrayReturn, FieldArrayWithId, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Switch } from '@/components/ui/switch'
import { infoSchema } from '@/hooks/use-create-memorial-form'
import { AvatarUpload } from './avatar-upload'

interface InfoStepProps {
  form: any
  fields: FieldArrayWithId<any, 'people', 'id'>[]
  append: any
  remove: any
  onSubmit: (values: z.infer<typeof infoSchema>) => void
  uploadingIndex: number | null
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, index: number) => Promise<void>
  apiError: string
}

export function InfoStep({
  form,
  fields,
  append,
  remove,
  onSubmit,
  uploadingIndex,
  onImageUpload,
  apiError,
}: InfoStepProps) {
  return (
    <Form {...form}>
      <form
        id="info-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 w-full max-w-sm"
      >
        <div className="space-y-2">
          {fields.length > 0 && (
            <FormLabel required className="text-sm">
              Personas Recordadas
            </FormLabel>
          )}

          <Accordion type="single" collapsible className="w-full">
            {fields.map((field, index) => {
              const personName = form.watch(`people.${index}.name`)
              const showAddButton = index === fields.length - 1 && personName.length > 0

              return (
                <div key={field.id} className="space-y-2">
                  <AccordionItem value={`person-${index}`} className="pb-6 border-border-weak/60">
                    <AccordionTrigger className="gap-2 [&_svg]:text-foreground/50 hover:!no-underline">
                      <FormField
                        control={form.control}
                        name={`people.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="flex-1 m-0">
                            <FormControl>
                              <Input
                                placeholder={index === 0 ? "Nombre de la persona" : `Persona ${index + 1}`}
                                className="bg-transparent w-full"
                                onClick={(e) => e.stopPropagation()}
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            remove(index)
                          }}
                          className="text-destructive hover:text-destructive/80 transition-colors ml-auto"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </AccordionTrigger>

                    <AccordionContent className="p-0 space-y-2 pt-4">
                      <FormLabel className="text-xs">Foto</FormLabel>
                      <div className="mt-2 w-full flex justify-start items-start">
                        <AvatarUpload
                          image={form.getValues(`people.${index}.image`)}
                          onUpload={(e) => onImageUpload(e, index)}
                          isLoading={uploadingIndex === index}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <FormField
                          control={form.control}
                          name={`people.${index}.birthDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Nacimiento</FormLabel>
                              <FormControl>
                                <DatePicker
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder="Fecha"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`people.${index}.deathDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Muerte</FormLabel>
                              <FormControl>
                                <DatePicker
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder="Fecha"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {showAddButton && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => append({ name: '', birthDate: undefined, deathDate: undefined, image: undefined })}
                      className="w-full border border-accent text-accent hover:bg-accent/5 hover:border-accent hover:text-accent"
                    >
                      <Plus />
                      Añadir otra
                    </Button>
                  )}
                </div>
              )
            })}
          </Accordion>
        </div>

        <FormField
          control={form.control}
          name="customMemorialName"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between mt-6">
              <FormLabel>¿La Animita tiene otro nombre?</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {form.watch('customMemorialName') && (
          <FormField
            control={form.control}
            name="customName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre Personalizado de la Animita</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Animita del Cabo Gómez"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {apiError && <p className="text-sm text-destructive">{apiError}</p>}
      </form>
    </Form>
  )
}
