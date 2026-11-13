import React from 'react'

export const NutmegLogoIcon: React.FC = () => (
  <svg
    className="relative w-[20.32px] h-[25.24px] shrink-0"
    viewBox="0 0 21 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M10.5 2C6.5 6 4 10.5 4 14.5C4 18.09 6.91 21 10.5 21C14.09 21 17 18.09 17 14.5C17 10.5 14.5 6 10.5 2Z"
      stroke="#F4B75E"
      strokeWidth="1.6"
      fill="rgba(244, 183, 94, 0.18)"
    />
    <path
      d="M10.5 7.5C8.8 10 8 12.2 8 14.2C8 15.86 9.12 17.2 10.5 17.2C11.88 17.2 13 15.86 13 14.2C13 12.2 12.2 10 10.5 7.5Z"
      fill="#F4B75E"
    />
    <path
      d="M2 23.5C4.5 22 7.2 22 10.5 23.5C13.8 25 16.5 25 19 23.5"
      stroke="#F4B75E"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

export const ArrowUpRightIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M4.5 13.5L13.5 4.5M13.5 4.5H6M13.5 4.5V12"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const ArrowDownIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M8 3V13M8 13L12.5 8.5M8 13L3.5 8.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
