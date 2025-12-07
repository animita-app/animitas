"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Camera } from "lucide-react"
import { LocationPicker } from "./location-picker"
import {
  InputGroup,
  InputGroupTextarea,
  InputGroupAddon,
} from "@/components/ui/input-group"
import {
  SpeechInput,
  SpeechInputRecordButton,
  SpeechInputPreview,
} from "@/components/ui/speech-input"
import { getScribeToken } from "@/app/actions/get-scribe-token"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { InputGroupButton } from "@/components/ui/input-group"

// Define the schema
const formSchema = z.object({
  photos: z.array(z.any()).min(1, "Sube al menos 1 foto"), // Using z.any() for File for now, refine if needed
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  location: z.object({
    address: z.string(),
    cityRegion: z.string(),
    lat: z.number(),
    lng: z.number(),
  }),
  story: z.string().min(10, "La historia debe tener al menos 10 caracteres"),
})

export default function AddPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      photos: [],
      name: "",
      story: "",
    },
    mode: "onChange",
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  // Mock photo upload handler
  const handleAddPhoto = () => {
    // Simulate adding a file
    const currentPhotos = form.getValues("photos")
    form.setValue("photos", [...currentPhotos, new File([""], "mock.jpg")], { shouldValidate: true }) // Mock file
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

        {/* 1. Photos */}
        <FormField
          control={form.control}
          name="photos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fotos</FormLabel>
              <FormControl>
                <div className="grid grid-cols-3 gap-3">
                  {/* Add Button */}
                  <button
                    type="button"
                    onClick={handleAddPhoto}
                    className="flex flex-col gap-1.5 hover:brightness-90 cursor-pointer items-center justify-center aspect-square rounded-md border border-border-weak bg-muted"
                  >
                    <Camera className="size-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Agregar</span>
                  </button>

                  {/* Render uploaded photos */}
                  {field.value.map((_: any, i: number) => (
                    <div key={i} className="aspect-square rounded-md border border-border-weak bg-muted" />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 2. Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Animita de Romualdito"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 3. Location */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ubicación</FormLabel>
              <FormControl>
                <LocationPicker
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 4. Story */}
        <FormField
          control={form.control}
          name="story"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Historia</FormLabel>
              <FormControl>
                <InputGroup className="relative">
                  <InputGroupTextarea
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="z-0 min-h-[150px] resize-none border-0 focus-visible:ring-0 p-3 pt-3 text-base w-full bg-transparent relative"
                  />
                  <InputGroupAddon align="block-end" className="w-full justify-start p-2">
                    <SpeechInput
                      getToken={getScribeToken}
                      onError={(e) => console.error("SpeechInput error:", e)}
                      onStop={(data) => {
                        const currentValue = field.value || ""
                        const newValue = (currentValue + " " + data.transcript).trim()
                        field.onChange(newValue)
                      }}
                      size="icon-xs"
                    >
                      <SpeechInputPreview />
                      <SpeechInputRecordButton type="button" />
                    </SpeechInput>
                  </InputGroupAddon>
                </InputGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Publish Button */}
        <div className="w-full flex justify-end">
          <Button
            type="submit"
            disabled={!form.formState.isValid}
          >
            Publicar
          </Button>
        </div>
      </form>
    </Form>
  )
}
