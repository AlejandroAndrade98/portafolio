// lib/heroNavItems.ts
import type * as React from "react";
import { User, Layers3, FolderKanban } from "lucide-react";

// ✅ Tipamos directamente desde el componente real (SIN importar runtime)
type RadialNavItems = React.ComponentProps<
  typeof import("@/components/animate-ui/components/communityHome/radial-nav").RadialNav
>["items"];

/**
 * ✅ Items del RadialNav
 * - icon: se pasa como COMPONENTE (User) NO como JSX (<User />)
 * - angle: controla la posición del item
 */
export const heroNavItems = [
  { id: 1, label: "About", icon: User, angle: -80 },
  { id: 2, label: "Stack", icon: Layers3, angle: -10 },
  { id: 3, label: "Projects", icon: FolderKanban, angle: 60 },
] satisfies RadialNavItems;

/**
 * ✅ Mapa id -> target
 * El RadialNav nos va a decir el "id" activo.
 * Nosotros decidimos a qué sección scrollear.
 */
export const heroNavTargets: Record<number, string> = {
  1: "#about",
  2: "#stack",
  3: "#projects",
};
