import Image from "next/image";

import { Brand } from "@/feature/auth/components/brand";

export function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="grid min-h-svh bg-surface-warm lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)]">
      <aside className="relative hidden min-h-svh overflow-hidden bg-navy-dark lg:block">
        <Image
          src="/images/auth-room.jpg"
          alt="A warm living room with a mustard armchair"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-primary/30" />
        <div className="absolute inset-0 bg-linear-to-t from-primary/45 via-transparent to-primary/5" />

        <div className="absolute inset-x-10 bottom-10 z-10 max-w-2xl text-white xl:inset-x-14 xl:bottom-14">
          <h2 className="max-w-xl text-3xl leading-tight text-white xl:text-4xl">
            Your home,
            <br />
            reimagined in seconds.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/86 xl:text-md">
            AI redesigns, element-level edits, and shop-the-look products — all
            in your browser.
          </p>
        </div>
      </aside>

      <section className="flex min-h-svh items-center justify-center px-5 py-10 sm:px-10 lg:px-12">
        <div className="w-full max-w-100">
          <Brand />
          <div className="mt-10 sm:mt-12">{children}</div>
        </div>
      </section>
    </main>
  );
}
