import { ModalWrapper } from '@/components/modal/modal-wrapper'
import { PricingTable } from '@/components/pricing/pricing-table'

export default function PricingModal() {
  return (
    <ModalWrapper title="Mejora tu plan" description="Accede a más funcionalidades en ÁNIMA">
      <PricingTable />
    </ModalWrapper>
  )
}
