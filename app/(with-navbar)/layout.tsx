'use client'
import { useEffect } from "react";
import Nav from "../component/nav";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import Loading from "../component/loading";

export default function WithNavbarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const router = useRouter();

  // const user = useAuthStore((state) => state.user);
  // const clearUser = useAuthStore((state) => state.clearUser);

  // const { data, isPending, status } = useCurrentUser();

  // const isUnauthenticated = status === "error" || !data;

  // useEffect(() => {
  //   if (!isPending && isUnauthenticated) {
  //     clearUser();
  //     router.replace("/");
  //   }
  // }, [isPending, isUnauthenticated, clearUser, router]);

  // if (isPending) {
  //   return <Loading />;
  // }

  // if (isUnauthenticated || !user) {
  //   return null;
  // }
  return (
    <>
      <main className="min-h-full flex">
        <Nav />
        {children}
      </main>
    </>
  );
}
