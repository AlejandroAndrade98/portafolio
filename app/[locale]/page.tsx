import HomeClient from "@/components/home/HomeClient";
import { defaultLocale, isLocale } from "@/lib/i18n";
import { loadHomeContent } from "@/lib/contentHome";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  const data = await loadHomeContent(locale);

  return (
    <HomeClient
      locale={locale}
      hero={data.hero}
      about={data.about}
      aboutPixelCards={data.aboutPixelCards}
      stack={data.stack}
      projectsShowcase={data.projectsShowcase}
      projectsGalleries={data.projectsGalleries}
    />
  );
}