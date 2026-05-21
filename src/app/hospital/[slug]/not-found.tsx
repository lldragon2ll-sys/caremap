import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-2">병원을 찾을 수 없습니다</h1>
      <p className="text-zinc-500 mb-6">URL이 잘못되었거나 데이터에 없는 병원입니다.</p>
      <Link href="/" className="text-blue-600 hover:underline">
        홈으로 돌아가기
      </Link>
    </div>
  );
}
