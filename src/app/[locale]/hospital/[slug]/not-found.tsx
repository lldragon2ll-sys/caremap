import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-2">{t("title")}</h1>
      <p className="text-zinc-500 mb-6">{t("description")}</p>
      <Link href="/" className="text-blue-600 hover:underline">
        {t("back")}
      </Link>
    </div>
  );
}
