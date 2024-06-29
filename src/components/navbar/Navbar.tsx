import React from "react";
import { TypographyH3 } from "../typography/typography";
import { Button } from "../ui/button";
import { ModeToggle } from "../mode-toggle/mode-toggle";

export default function Navbar() {
  return (
    <div className="flex items-center justify-between bg-foreground px-5 py-3 dark:bg-foreground">
      <TypographyH3 className="text-secondary">ApplyBreeze</TypographyH3>
      <nav>
        <ul className="flex items-center space-x-5">
          <li>
            <a href="#" className="text-secondary">
              Jobs
            </a>
          </li>
          <li>
            <a href="#" className="text-secondary">
              Applications
            </a>
          </li>
        </ul>
      </nav>
      <div className="flex items-center justify-center gap-5">
        <ModeToggle />
        <Button>SignIn</Button>
      </div>
    </div>
  );
}
