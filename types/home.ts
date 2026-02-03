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
};

export type IntroSectionProps = {
  hero: HeroContent;
};
