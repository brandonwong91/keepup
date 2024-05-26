"use client";
import {
  SignedOut,
  SignInButton,
  SignedIn,
  UserButton,
  SignOutButton,
} from "@clerk/nextjs";
import React from "react";
import {} from "@radix-ui/react-navigation-menu";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuContent,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { cn } from "~/lib/utils";

interface PathType {
  label: string;
  href: string;
}

const paths: PathType[] = [{ label: "Workout", href: "/workout" }];

const NavBar = () => {
  const pathname = usePathname();
  return (
    <div className="container z-auto flex h-fit w-full flex-row border-b border-b-secondary p-4">
      <div className="sticky flex items-center gap-4">
        <h1 className="scroll-m-20 whitespace-nowrap text-4xl font-extrabold tracking-tight lg:text-5xl">
          <a href="/">Keep Up</a>
        </h1>
      </div>

      <div className=" flex w-full items-center justify-end md:justify-between">
        <NavigationMenu>
          <NavigationMenuList>
            {paths.map(({ label, href }) => {
              return (
                <NavigationMenuItem
                  key={label}
                  className="hidden md:flex md:flex-row"
                >
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
            {/* <NavigationMenuItem className="block md:hidden">
              <NavigationMenuTrigger>
                <HamburgerMenuIcon />
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="flex flex-col items-center gap-3 p-4">
                  <li className="row-span-1">
                    <SignedOut>
                      <Button>
                        <SignInButton />
                      </Button>
                    </SignedOut>
                    <SignedIn>
                      <UserButton />
                    </SignedIn>
                  </li>
                  {paths.map(({ label, href }) => {
                    return (
                      <ListItem
                        key={label}
                        title={label}
                        href={href}
                      ></ListItem>
                    );
                  })}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem> */}
          </NavigationMenuList>
        </NavigationMenu>
        <div className="hidden md:block">
          <SignedOut>
            <Button>
              <SignInButton />
            </Button>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
        <div className="block md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <HamburgerMenuIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <SignedOut>
                  <Button>
                    <SignInButton />
                  </Button>
                </SignedOut>
                <SignedIn>
                  <SignOutButton />
                </SignedIn>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {paths.map(({ label, href }) => {
                return (
                  <DropdownMenuItem key={label}>
                    <Link href={href}>{label}</Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default NavBar;

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
