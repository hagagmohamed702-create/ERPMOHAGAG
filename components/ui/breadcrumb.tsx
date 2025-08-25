"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  separator?: React.ReactNode
}

export function Breadcrumb({
  separator = <ChevronLeft className="h-4 w-4" />,
  className,
  ...props
}: BreadcrumbProps) {
  return (
    <nav
      aria-label="breadcrumb"
      className={cn("relative", className)}
      {...props}
    />
  )
}

export interface BreadcrumbListProps extends React.HTMLAttributes<HTMLOListElement> {}

export function BreadcrumbList({
  className,
  ...props
}: BreadcrumbListProps) {
  return (
    <ol
      className={cn(
        "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLLIElement> {}

export function BreadcrumbItem({
  className,
  ...props
}: BreadcrumbItemProps) {
  return (
    <li
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  )
}

export interface BreadcrumbLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string
  asChild?: boolean
}

export function BreadcrumbLink({
  href,
  className,
  ...props
}: BreadcrumbLinkProps) {
  const Comp = href ? Link : "span"
  
  return (
    <Comp
      href={href!}
      className={cn(
        "transition-colors hover:text-foreground",
        href && "cursor-pointer",
        className
      )}
      {...props}
    />
  )
}

export interface BreadcrumbPageProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function BreadcrumbPage({
  className,
  ...props
}: BreadcrumbPageProps) {
  return (
    <span
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-normal text-foreground", className)}
      {...props}
    />
  )
}

export interface BreadcrumbSeparatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode
}

export function BreadcrumbSeparator({
  children,
  className,
  ...props
}: BreadcrumbSeparatorProps) {
  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:h-3.5 [&>svg]:w-3.5 text-muted-foreground", className)}
      {...props}
    >
      {children ?? <ChevronLeft className="h-3.5 w-3.5" />}
    </span>
  )
}