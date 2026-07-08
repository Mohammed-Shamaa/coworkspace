'use client'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { X } from 'lucide-react'
import MemberForm from '@/components/member-form'
import type { Member } from '@/types'

interface EditMemberModalProps {
  isOpen: boolean
  onClose: () => void
  member: Member | null
  onSuccess: () => void
}

export default function EditMemberModal({ isOpen, onClose, member, onSuccess }: EditMemberModalProps) {
  const { t } = useTranslation()
  if (!isOpen || !member) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div
        className="card-premium p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">{t('members.editMember')}</h2>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-200 rounded-lg p-1.5 hover:bg-[var(--hover-bg)] cursor-pointer"
            aria-label={t('common.close')}
          >
            <X size={20} />
          </button>
        </div>
        <MemberForm
          initialData={member}
          memberId={member.id}
          onSuccess={() => { onSuccess(); onClose() }}
        />
      </div>
    </div>
  )
}
