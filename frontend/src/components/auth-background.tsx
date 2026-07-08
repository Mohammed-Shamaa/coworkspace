export default function AuthBackground() {
  return (
    <>
      <div
        className="fixed inset-0 -z-10 animate-gradient-shift bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-950 dark:via-blue-950/10 dark:to-gray-900"
        aria-hidden="true"
      />
      {/* Subtle grid pattern */}
      <div className="fixed inset-0 -z-10 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #1565C0 1px, transparent 1px)', backgroundSize: '32px 32px' }} aria-hidden="true" />
      <div className="pointer-events-none fixed inset-0 z-0 select-none overflow-hidden">
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="absolute -right-8 top-8 h-64 w-64 animate-float-slow text-gray-500 opacity-[0.10] dark:text-gray-500"
          style={{ animationDelay: '0s' }}
          aria-hidden="true"
        >
          <path d="M19 2H9c-1.1 0-2 .9-2 2v6H5c-1.1 0-2 .9-2 2v8c0 .55.45 1 1 1h5v-5h4v5h5c.55 0 1-.45 1-1v-8c0-1.1-.9-2-2-2h-2V4c0-1.1-.9-2-2-2zm-7 14H8v-2h4v2zm4 0h-4v-2h4v2z" />
        </svg>
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="absolute -bottom-20 -left-16 h-80 w-80 animate-float-medium text-gray-500 opacity-[0.09] dark:text-gray-500"
          style={{ animationDelay: '-3s' }}
          aria-hidden="true"
        >
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V18c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-1.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05.02.01.03.03.04.04 1.14.83 1.93 1.94 1.93 3.41V18c0 .35-.07.69-.18 1H21c.55 0 1-.45 1-1v-1.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="absolute left-1/4 top-1/4 h-40 w-40 animate-float-fast blur-sm text-gray-500 opacity-[0.08] dark:text-gray-500"
          style={{ animationDelay: '-7s' }}
          aria-hidden="true"
        >
          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
        </svg>
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="absolute bottom-1/3 right-1/4 h-48 w-48 animate-float-slow text-gray-500 opacity-[0.08] dark:text-gray-500"
          style={{ animationDelay: '-11s' }}
          aria-hidden="true"
        >
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
        </svg>
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="absolute left-10 top-1/3 h-36 w-36 animate-float-medium blur-sm text-gray-500 opacity-[0.09] dark:text-gray-500"
          style={{ animationDelay: '-5s' }}
          aria-hidden="true"
        >
          <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
        </svg>
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="absolute right-10 top-1/2 h-32 w-32 animate-float-fast text-gray-500 opacity-[0.07] dark:text-gray-500"
          style={{ animationDelay: '-2s' }}
          aria-hidden="true"
        >
          <path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4v-2z" />
        </svg>
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="absolute left-1/3 -bottom-10 h-44 w-44 animate-float-medium text-gray-500 opacity-[0.07] dark:text-gray-500"
          style={{ animationDelay: '-9s' }}
          aria-hidden="true"
        >
          <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
        </svg>
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="absolute right-1/4 top-3/4 h-40 w-40 animate-float-slow blur-sm text-gray-500 opacity-[0.08] dark:text-gray-500"
          style={{ animationDelay: '-15s' }}
          aria-hidden="true"
        >
          <path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H3V4h18v12z" />
        </svg>
      </div>
    </>
  )
}
