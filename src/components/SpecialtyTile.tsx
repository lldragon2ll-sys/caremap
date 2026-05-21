import Link from "next/link";

/** 진료과 타일 — code(예: IM/PD/DM)를 monospace 영문 약자로 표시 */
export function SpecialtyTile({
  code, name, href,
}: { code: string; name: string; href?: string }) {
  const content = (
    <>
      <span className="ico">{code}</span>
      {name}
    </>
  );
  if (href) return <Link href={href} className="cm-spec">{content}</Link>;
  return <button className="cm-spec" type="button">{content}</button>;
}
