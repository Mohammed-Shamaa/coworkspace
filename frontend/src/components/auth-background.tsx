export default function AuthBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 select-none overflow-hidden">
      {/* Building / Workspace - top right */}
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="absolute -right-12 -top-12 h-72 w-72 text-gray-400 opacity-[0.04] dark:text-gray-600"
        aria-hidden="true"
      >
        <path d="M19 2H9c-1.1 0-2 .9-2 2v6H5c-1.1 0-2 .9-2 2v8c0 .55.45 1 1 1h5v-5h4v5h5c.55 0 1-.45 1-1v-8c0-1.1-.9-2-2-2h-2V4c0-1.1-.9-2-2-2zm-7 14H8v-2h4v2zm4 0h-4v-2h4v2z" />
      </svg>

      {/* Users / Team - bottom left */}
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="absolute -bottom-16 -left-16 h-96 w-96 text-gray-400 opacity-[0.03] dark:text-gray-600"
        aria-hidden="true"
      >
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V18c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-1.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05.02.01.03.03.04.04 1.14.83 1.93 1.94 1.93 3.41V18c0 .35-.07.69-.18 1H21c.55 0 1-.45 1-1v-1.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>

      {/* Lock / Security - middle left */}
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="absolute left-1/4 top-1/3 h-48 w-48 text-gray-400 opacity-[0.025] dark:text-gray-600"
        aria-hidden="true"
      >
        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
      </svg>

      {/* Chart / Analytics - bottom right */}
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="absolute -bottom-8 right-1/3 h-56 w-56 text-gray-400 opacity-[0.03] dark:text-gray-600"
        aria-hidden="true"
      >
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
      </svg>
    </div>
  )
}
