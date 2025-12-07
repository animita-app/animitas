import { Header } from '@/components/headers/header'
import { PricingTable } from '@/components/pricing/pricing-table'

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-12 p-6 items-start justify-start min-h-screen">

      <h2 className="text-xl md:text-2xl [&_span]:font-ibm-plex-mono leading-relaxed font-normal text-black">
        <span>[ÁNIMA]</span> — una infraestructura para el patrimonio y la memoria del territorio. <br /><br />
        Colaborativa, viva y diseñada para preservar.
      </h2>

      <PricingTable />
    </div>
  )
}
