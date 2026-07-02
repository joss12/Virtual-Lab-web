import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const locales = ["en", "fr"] as const;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as "en" | "fr")) {
    notFound();
  }

  let messages;

  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      <Footer/>
    </NextIntlClientProvider>
  );
}
