import type { ComponentType } from 'react'
import type { PackageManager } from '@/lib/docs-commands'
import { cn } from 'cn'

// Brand marks inlined from Material Icon Theme
// (https://github.com/material-extensions/vscode-material-icon-theme), MIT
// licensed. The artwork keeps the upstream 32x32 viewBox and fills, and sizes
// itself from the wrapper so callers never touch the SVG attributes.

function BunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="size-full"
    >
      <path fill="#fff8e1" d="M30 17.045a9.8 9.8 0 0 0-.32-2.306l-.004.034a11.2 11.2 0 0 0-5.762-6.786c-3.495-1.89-5.243-3.326-6.8-3.811h.003c-1.95-.695-3.949.82-5.825 1.927c-4.52 2.481-9.573 5.45-9.28 11.417c.008-.029.017-.052.026-.08a9.97 9.97 0 0 0 3.934 7.257l-.01-.006C13.747 31.473 30.05 27.292 30 17.045" />
      <path fill="#37474f" d="M19.855 20.236A.8.8 0 0 0 19.26 20h-6.514a.8.8 0 0 0-.596.236a.51.51 0 0 0-.137.463a4.37 4.37 0 0 0 1.641 2.339a4.2 4.2 0 0 0 2.349.926a4.2 4.2 0 0 0 2.343-.926a4.37 4.37 0 0 0 1.642-2.339a.5.5 0 0 0-.132-.463Z" />
      <ellipse cx="22.5" cy="18.5" fill="#f8bbd0" rx="2.5" ry="1.5" />
      <ellipse cx="9.5" cy="18.5" fill="#f8bbd0" rx="2.5" ry="1.5" />
      <circle cx="10" cy="16" r="2" fill="#37474f" />
      <circle cx="22" cy="16" r="2" fill="#37474f" />
      <path fill="#455a64" d="M9.996 18A2 2 0 1 0 8 15.996V16a2 2 0 0 0 1.996 2" />
      <circle cx="9" cy="15" r="1" fill="#fafafa" />
      <circle cx="21" cy="15" r="1" fill="#fafafa" />
    </svg>
  )
}

function NpmIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="size-full"
    >
      <path fill="#e53935" d="M4 4v24h24V4Zm20 20h-4V12h-4v12H8V8h16Z" />
    </svg>
  )
}

function PnpmIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="size-full"
    >
      <path fill="#e0e0e0" d="M2 22h8v8H2zm10 0h8v8h-8zm10 0h8v8h-8zM12 12h8v8h-8z" />
      <path fill="#ffb300" d="M2 2h8v8H2zm10 0h8v8h-8zm10 0h8v8h-8zm0 10h8v8h-8z" />
    </svg>
  )
}

function YarnIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="size-full"
    >
      <path fill="#0288d1" d="M27.575 23.967a9.9 9.9 0 0 0-3.751 1.726a22.6 22.6 0 0 1-5.537 2.504a1.55 1.55 0 0 1-.931.52a59 59 0 0 1-6.11.548c-1.102.008-1.777-.282-1.965-.735a1.49 1.49 0 0 1 .82-1.965a3.6 3.6 0 0 1-.486-.359c-.163-.162-.334-.487-.385-.367c-.213.52-.324 1.794-.897 2.366c-.786.795-2.273.53-3.153.069c-.965-.513.069-1.718.069-1.718a.69.69 0 0 1-.94-.324a4.6 4.6 0 0 1-.632-2.794a5.2 5.2 0 0 1 1.674-2.76a8.84 8.84 0 0 1 .624-4.17a9.9 9.9 0 0 1 3-3.469S7.136 11.015 7.82 9.177c.444-1.196.623-1.187.769-1.239a3.44 3.44 0 0 0 1.375-.811a4.99 4.99 0 0 1 4.178-1.607s1.094-3.357 2.12-2.7a17.4 17.4 0 0 1 1.452 2.735s1.213-.71 1.35-.445a10.74 10.74 0 0 1 .495 5.81a13.3 13.3 0 0 1-2.46 5.127c-.129.214 1.47.889 2.477 3.683c.932 2.554.103 4.699.248 4.938c.026.043.034.06.034.06s1.068.085 3.213-1.24a8.05 8.05 0 0 1 4.05-1.52a1.026 1.026 0 0 1 .453 2Z" />
    </svg>
  )
}

const packageManagerIcons: Record<PackageManager, ComponentType> = {
  bun: BunIcon,
  npm: NpmIcon,
  pnpm: PnpmIcon,
  yarn: YarnIcon,
}

export interface PackageManagerIconProps {
  manager: PackageManager
  className?: string
}

/**
 * Brand mark for a package-manager tab. The tab label carries the meaning, so
 * the mark is decorative and hidden from assistive technology.
 */
export function PackageManagerIcon({
  manager,
  className,
}: PackageManagerIconProps) {
  const Icon = packageManagerIcons[manager]

  return (
    <span
      aria-hidden="true"
      data-slot="package-manager-icon"
      data-manager={manager}
      className={cn('inline-flex size-4 shrink-0 items-center', className)}
    >
      <Icon />
    </span>
  )
}
