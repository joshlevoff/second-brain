export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-zinc-900 p-8 shadow-xl ring-1 ring-zinc-800">
        <div className="mb-6 text-center">
          <span className="text-lg font-semibold text-zinc-50">
            Second Brain
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
