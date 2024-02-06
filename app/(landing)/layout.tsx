import Navbar from "./components/Navbar";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <Navbar />
      <div className="flex-grow">{children}</div>
    </div>
  );
}
