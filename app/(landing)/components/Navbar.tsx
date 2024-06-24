import { SignInButton, UserButton, currentUser } from "@clerk/nextjs";
import { User } from "@clerk/nextjs/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import logo from "@/public/logo.png"

async function Navbar() {
  const user: User | null = await currentUser();
  return (
    // <nav className="flex w-screen items-center justify-between p-6">
    //   <div>
    //     <Link href="/" className="text-2xl font-bold text-black no-underline">
    //       <Image
    //         src={logo}
    //         width={125}
    //         height={125}
    //         alt="ReviNotion"
    //       />
    //     </Link>
    //   </div>
    //   <div className="text-black font-semibold text-lg">
    //     {user ? (
    //       <div className="flex flex-row gap-x-4 items-center">
    //         <Link href="/main">
    //           <Button variant="outline">Open App</Button>
    //         </Link>
    //         <UserButton />
    //         <h2>{user.emailAddresses[0].emailAddress}</h2>
    //       </div>
    //     ) : (
    //       <SignInButton />
    //     )}
    //   </div>
    // </nav>
    <header className="px-4 lg:px-6 h-14 flex items-center mt-4">
      <Link href="#" className="flex items-center justify-center" prefetch={false}>
        {/* <BookIcon className="h-6 w-6" /> */}
        <Image src="/logo.png" alt="logo" height={125} width={125} />
        <span className="sr-only">LeetCode Revise</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        <Link href="/signup" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
          Signup/Signin
        </Link>
        <div className="text-black font-semibold text-lg">
          {user ? (
            <div className="flex flex-row gap-x-4 items-center">
              <Link href="/main">
                <Button variant="outline">Open App</Button>
              </Link>
              <UserButton />
              <h2>{user.emailAddresses[0].emailAddress}</h2>
            </div>
          ) : (
            <></>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
