import { TypographyH3 } from "../typography/typography";
import { ModeToggle } from "../mode-toggle/mode-toggle";
import Link from "next/link";
import { MobileMenu } from "../mobile-menu/mobile-menu";
import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import { Button } from "../ui/button";

export default function Navbar() {
    return (
        <header className="flex items-center justify-between bg-foreground px-5 py-3 dark:bg-foreground">
            <TypographyH3 className="text-secondary">ApplyBreeze</TypographyH3>
            <nav className="hidden sm:block">
                <ul className="flex items-center space-x-5">
                    <li>
                        <Link href="/" className="text-secondary">
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link href="/find-jobs" className="text-secondary">
                            Find Jobs
                        </Link>
                    </li>
                    <li>
                        <Link href="/jobs" className="text-secondary">
                            Jobs
                        </Link>
                    </li>
                </ul>
            </nav>
            <div className="flex items-center justify-center gap-5">
                <SignedOut>
                    <SignInButton>
                        <Button className="text-black dark:bg-white" variant="outline">
                            Sign In
                        </Button>
                    </SignInButton>
                </SignedOut>
                <SignedIn>
                    <UserButton />
                </SignedIn>
                <ModeToggle className="hidden sm:flex" />
                <MobileMenu className="dark:bg-white sm:hidden" />
            </div>
        </header>
    );
}
