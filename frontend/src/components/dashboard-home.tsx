'use client'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import MemberForm from '@/components/member-form'
import Image from 'next/image'

export default function DashboardHome() {
  const { t } = useTranslation()

  return (
    <div>
      <div className="relative w-full h-[320px] sm:h-[380px] md:h-[460px] lg:h-[500px] rounded-xl overflow-hidden mb-8">
        <Image
          src="/dash_place.png"
          alt="DesKora Workspace"
          fill
          className="object-cover"
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 85vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="px-6 sm:px-8 md:px-12 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-3 md:mb-4">
              Des<span className="text-amber-400">K</span>ora
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/85 max-w-lg leading-relaxed">
              Manage your coworking space smarter with powerful tools built for modern workspaces.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] p-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-5">
          {t('dashboard.registerNewMember')}
        </h2>
        <MemberForm onSuccess={() => {}} />
      </div>
    </div>
  )
}
