import { useState } from 'react'
import PageLayout from '../components/PageLayout'
import CardList from '../components/payment/CardList'
import AddCardModal from '../components/payment/AddCardModal'

export default function PaymentMethodsPage() {
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <PageLayout title="支付方式" subtitle="管理您的银行卡" showFooter={false}>
      <CardList onAddCard={() => setShowAddModal(true)} />
      <AddCardModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={() => setShowAddModal(false)} />
    </PageLayout>
  )
}
