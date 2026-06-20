import Image from "next/image";
import { LOCAL_IMAGES } from "@/lib/marketing/landing-images";

export function AuthBrandPanel() {
  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-brand-100 bg-gradient-to-br from-brand-50 to-violet-50">
      <Image
        src={LOCAL_IMAGES.heroStudents}
        alt=""
        width={400}
        height={220}
        className="h-32 w-full object-cover object-center sm:h-36"
        unoptimized
        aria-hidden
      />
      <p className="px-4 py-3 text-center text-sm font-medium text-brand-800">
        Your notes, turned into{" "}
        <span className="text-brand-600">study magic</span>
      </p>
    </div>
  );
}
