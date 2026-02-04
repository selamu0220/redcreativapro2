"use client";

import dynamic from "next/dynamic";

const MariaWidget = dynamic(
  () => import("./MariaWidget").catch(() => ({ default: () => null })),
  {
    ssr: false,
    loading: () => null
  }
);

export default function MariaWidgetClient() {
  return <MariaWidget />;
}
