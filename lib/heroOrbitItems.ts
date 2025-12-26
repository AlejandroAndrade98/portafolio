import type * as React from "react";

type OrbitItems = React.ComponentProps<
  typeof import("@/components/animate-ui/components/communityHome/radial-intro").RadialIntro
>["orbitItems"];

const RAW_ORBIT_ITEMS = [
  {
    id: "next",
    label: "Next.js",
    sublabel: "App Router",
    iconSrc: "/next.svg",
  },
  {
    id: "mysql",
    label: "MySQL",
    sublabel: "Database",
    iconSrc: "/mysql.svg",
    // iconScale: 1.3,
  },
  {
    id: "aws",
    label: "AWS",
    sublabel: "Cloud",
    iconSrc: "/aws.svg",
  },
  {
    id: "nodejs",
    label: "Node.js",
    sublabel: "APIs",
    iconSrc: "/nodedotjs.svg",
    // iconScale: 1.3,
  },
  {
    id: "React",
    label: "React",
    sublabel: "UI",
    iconSrc: "/react.svg",
  },
  {
    id: "github",
    label: "Git",
    sublabel: "GitHub",
    iconSrc: "/github.svg",
  },
];

export const orbitItems = RAW_ORBIT_ITEMS as unknown as OrbitItems;
