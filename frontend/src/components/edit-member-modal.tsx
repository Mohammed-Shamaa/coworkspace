'use client'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import MemberForm from '@/components/member-form'

interface EditMemberModalProps {
  isOpen: boolean
  onClose: () => void
  member: any
  onSuccess: () => void
}

export default function EditMemberModal({ isOpen, onClose, member, onSuccess }: EditMemberModalProps) {
  const { t } = useTranslation()
  if (!isOpen || !member) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">{t('members.editMember')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer" aria-label={t('common.close')}>
            <X size={24} />
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
