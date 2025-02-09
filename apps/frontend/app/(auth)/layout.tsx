export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh lg:min-h-svh w-full overflow-hidden bg-[#3A379F]/[0.975] bg-grid-small-[#fff]/[0.20]">
      {children}
    </div>
  );
}
