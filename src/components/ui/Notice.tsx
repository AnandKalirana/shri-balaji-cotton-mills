"use client";
import { Banner } from "@astryxdesign/core/Banner";

interface NoticeProps {
  tone?: "info" | "warning" | "success" | "error";
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

/** A short message box (saved, warning, error), built on the Astryx Banner. */
export function Notice({ tone = "info", children, action, className }: NoticeProps) {
  return <Banner status={tone} title={children} endContent={action} className={className} />;
}
