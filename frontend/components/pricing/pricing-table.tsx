"use client"

import * as React from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useUser } from '@/contexts/user-context'
import { ROLES } from '@/types/roles'

type BillingPeriod = 'monthly' | 'yearly'

const PRICING_PLANS = [
  {
    id: 'free',
    name: 'Gratis',
    description: 'Explora animitas y patrimonio cultural intangible',
    price: {
      monthly: '$0',
      yearly: '$0'
    },

    features: [
      'Explora animitas y patrimonio cultural intangible',
      'Colabora registrando entradas',
      'Navega historias y fotografías sin herramientas GIS'
    ],
    buttonText: 'Pruébalo gratis',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Para investigadores y entusiastas',
    price: {
      monthly: '$5.000',
      yearly: '$50.000'
    },
    period: {
      monthly: '/mes',
      yearly: '/año'
    },
    badge: 'Más popular',
    features: [
      'Incluye todo lo de Gratis, más:',
      'Exporta a GeoJSON, GeoTIFF y PDF',
      'Visualizaciones avanzadas',
      'Hasta 3 métricas activas'
    ],
    buttonText: 'Pruébalo gratis',
    highlight: true
  },
  {
    id: 'institutional',
    name: 'Institucional',
    description: 'Para organizaciones y gobierno',
    price: {
      monthly: '$150.000',
      yearly: '$1.500.000'
    },

    priceLabel: 'desde',
    features: [
      'Incluye todo lo de Pro, más:',
      'Carga de mapas y capas externas',
      'Métricas ilimitadas',
      '5 usuarios'
    ],
    buttonText: 'Pruébalo gratis',
  }
]

export function PricingTable() {
  const [billingPeriod, setBillingPeriod] = React.useState<BillingPeriod>('monthly')
  const { role, currentUser } = useUser()

  const isCurrentPlan = (planId: string) => {
    if (!currentUser) return false
    if (planId === 'free' && (!role || role === ROLES.FREE)) return true
    if (planId === 'pro' && role === ROLES.PRO) return true
    if (planId === 'institutional' && role === ROLES.INSTITUTIONAL) return true
    return false
  }

  return (
    <>
      <div className="flex items-center justify-center p-1 bg-muted rounded-full w-fit sr-only">
        <button
          onClick={() => setBillingPeriod('monthly')}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
            billingPeriod === 'monthly' ? "bg-white shadow text-black" : "text-muted-foreground hover:text-black"
          )}
        >
          Mensual
        </button>
        <button
          onClick={() => setBillingPeriod('yearly')}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
            billingPeriod === 'yearly' ? "bg-white shadow text-black" : "text-muted-foreground hover:text-black"
          )}
        >
          Anual
        </button>
      </div>

      {billingPeriod === 'yearly' && (
        <p className="text-sm text-accent font-normal -mt-6 mb-6">2 meses gratis con el plan anual</p>
      )}

      <div className="flex flex-col md:grid md:grid-cols-3 gap-6 w-full">
        {PRICING_PLANS.map((plan) => {
          const isCurrent = isCurrentPlan(plan.id)
          return (
            <Card
              key={plan.id}
              className={cn(
                "select-none relative overflow-visible flex flex-col h-full flex-1 bg-background",
                plan.highlight && "border-accent ring-1 ring-accent"
              )}
            >
              <CardHeader className="flex flex-col items-start justify-start gap-0">
                <div className="flex justify-between items-start w-full">
                  <CardTitle className="text-xl font-medium">{plan.name}</CardTitle>
                  {(isCurrent || plan.badge) && (
                    <Badge variant={plan.highlight && !isCurrent ? "default" : "secondary"} className="rounded-full">
                      {isCurrent ? "Plan actual" : plan.badge}
                    </Badge>
                  )}
                </div>

                <div className="mt-4 flex flex-col items-start gap-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-medium font-ibm-plex-mono text-black slashed-zero">
                      {plan.price[billingPeriod]}
                    </span>
                    {plan.price[billingPeriod] !== '$0' && (
                      <span className="-translate-y-0.5 text-sm font-normal text-muted-foreground">
                        {plan.period ? plan.period[billingPeriod] : '/mes'}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-4 pb-2">
                <div className="space-y-4 pb-4">
                  <Button
                    className={cn(
                      "w-full",
                      isCurrent && "bg-muted text-muted-foreground disabled:!opacity-100 brightness-95"
                    )}
                    disabled={isCurrent}
                  >
                    {isCurrent ? "Este es tu plan actual" : plan.buttonText}
                  </Button>
                </div>

                <div className="space-y-4 pt-8 border-t">
                  {plan.features.some(f => f.startsWith('Todo lo de') || f.startsWith('Incluye todo lo de')) && (
                    <p className="text-sm font-normal">
                      {plan.features.find(f => f.startsWith('Todo lo de') || f.startsWith('Incluye todo lo de'))}
                    </p>
                  )}
                  <ul className="space-y-4 text-sm">
                    {plan.features
                      .filter(f => !f.startsWith('Todo lo de') && !f.startsWith('Incluye todo lo de'))
                      .map((feature, i) => (
                        <li key={i} className="flex items-center gap-2.5">
                          <div className="bg-accent rounded-full p-0.5 shrink-0">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-accent leading-tight">{feature}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </>
  )
}
