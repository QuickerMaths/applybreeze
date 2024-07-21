import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Button } from "~/components/ui/button";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
    SheetTrigger,
} from "~/components/ui/sheet";
import { ModeToggle } from "../mode-toggle/mode-toggle";
import Link from "next/link";
import { TypographyH2 } from "../typography/typography";

interface MobileMenuProps {
    className?: string;
}

export function MobileMenu({ className }: MobileMenuProps) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button className={className} variant="outline">
                    <HamburgerMenuIcon className="text-black" />
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col items-center justify-center">
                <nav>
                    <ul className="flex flex-col items-center justify-center space-y-5">
                        <li>
                            <SheetClose asChild>
                                <Link href="/" className="text-secondary">
                                    <TypographyH2 tag="p" className="dark:text-white">
                                        Home
                                    </TypographyH2>
                                </Link>
                            </SheetClose>
                        </li>
                        <li>
                            <li>
                                <SheetClose asChild>
                                    <Link href="/find-jobs" className="text-secondary">
                                        <TypographyH2 tag="p" className="dark:text-white">
                                            Find Jobs
                                        </TypographyH2>
                                    </Link>
                                </SheetClose>
                            </li>
                            <SheetClose asChild>
                                <Link href="/jobs" className="text-secondary">
                                    <TypographyH2 tag="p" className="dark:text-white">
                                        Jobs
                                    </TypographyH2>
                                </Link>
                            </SheetClose>
                        </li>
                    </ul>
                </nav>
                <SheetFooter className="absolute bottom-5 right-5">
                    <ModeToggle />
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
