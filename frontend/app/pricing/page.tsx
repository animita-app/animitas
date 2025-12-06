import { Header } from '@/components/headers/header'
import { PricingTable } from '@/components/pricing/pricing-table'

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-12 p-6 items-start justify-center min-h-screen">
      <Header className="absolute top-4 inset-x-4" variant="default" />

      <h2 className="[&_span]:font-ibm-plex-mono leading-relaxed font-medium text-black md:text-2xl">
        <span>[ÁNIMA]</span> — una infraestructura para el patrimonio y la memoria del territorio. <br />
        Colaborativa, viva y diseñada para preservar.
      </h2>

      <PricingTable />
    </div>
  )
}
