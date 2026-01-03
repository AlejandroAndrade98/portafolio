import type * as React from "react";
import type MagicBento from "@/components/animate-ui/MagicBento";
import type ProfileCard from "@/components/ProfileCard";
import type { RadialIntro } from "@/components/animate-ui/components/communityHome/radial-intro";
import type { useOrbit3D } from "@/hooks/useOrbit3D";

export type BentoCard = React.ComponentProps<typeof MagicBento>["cards"][number];
export type ProfileCardProps = React.ComponentProps<typeof ProfileCard>;
export type OrbitItems = React.ComponentProps<typeof RadialIntro>["orbitItems"];
export type Orbit3D = ReturnType<typeof useOrbit3D>;

export type HeroHeader = {
  logo: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  rightText: string;
};

export type HeroContent = {
  header: HeroHeader;
  profileCard: ProfileCardProps;
  magicBentoCards: BentoCard[];
};

export type IntroSectionProps = {
  hero: HeroContent;
  orbitItems: OrbitItems;
  orbit: Orbit3D;
};
