"use client";
import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import React from "react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@radix-ui/react-navigation-menu";
import Link from "next/link";
import { navigationMenuTriggerStyle } from "./ui/navigation-menu";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";

interface PathType {
  label: string;
  href: string;
}

const paths: PathType[] = [
  { label: "Home", href: "/" },
  { label: "Workout", href: "/workout" },
];

const NavBar = () => {
  const pathname = usePathname();
  return (
    <div className="container z-auto flex h-fit w-full flex-row justify-between border-b border-b-secondary p-4">
      <div className="sticky flex items-center gap-4">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          <a href="/">Keep Up</a>
        </h1>
        <NavigationMenu>
          <NavigationMenuList className="flex flex-row">
            {paths.map(({ label, href }) => {
              return (
                <NavigationMenuItem key={label}>
                  <Link href={href} legacyBehavior passHref>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                      active={pathname === href}
                    >
                      {label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="flex items-center">
        <SignedOut>
          <Button>
            <SignInButton />
          </Button>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
};

export default NavBar;
