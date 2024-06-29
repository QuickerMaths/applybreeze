import React from 'react';
import { TypographyH3 } from '../typography/typography';

export default function Navbar() {
 return (
    <div className="flex items-center justify-between px-5 py-3 bg-foreground dark:bg-foreground">
        <TypographyH3 className='text-secondary'>ApplyBreeze</TypographyH3>
        <button>SignIn</button>
    </div>
  );
}
