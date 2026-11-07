import { AppShell } from "@/app/components/ui";

export default function Loading() {
  return <AppShell><div className="skeleton skeleton-line short"/><div className="skeleton skeleton-hero"/><div className="detail-grid"><div className="skeleton skeleton-card"/><div className="skeleton skeleton-card"/></div></AppShell>;
}
