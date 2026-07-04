import Image from 'next/image'

export default function AboutPage() {
  return (
    <section className="relative min-h-screen w-full">
      <Image
        src="/hero-bg.png"
        alt="About Coworkspace"
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
    </section>
  )
}
