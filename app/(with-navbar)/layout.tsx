import Nav from "../component/nav";

export default function WithNavbarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main className="min-h-full flex">
        <Nav />
        {children}
      </main>
    </>
  );
}