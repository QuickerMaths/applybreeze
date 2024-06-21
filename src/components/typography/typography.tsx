import React from 'react';
import { cn } from '~/lib/utils';

const tags = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    p: 'p',
    span: 'span'
}

interface TypographyProps {
    className?: string;
    children: React.ReactNode;
    tag?: keyof typeof tags;
}

export function TypographyH1({ className, children, tag }: TypographyProps) {
    const Tag = tag ? tags[tag] : tags.h1;

    return (
        //@ts-expect-error tag is not a valid prop for h1
        <Tag className={cn("scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl", className)}>
    {children}
    </Tag>
    )
}

export function TypographyH2({ className, children, tag }: TypographyProps) {
    const Tag = tag ? tags[tag] : tags.h2;

    return (
        //@ts-expect-error tag is not a valid prop for h2
        <Tag className={cn("scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0", className)}>
    {children}
    </Tag>
    )
}

export function TypographyH3({ className, children, tag }: TypographyProps) {
    const Tag = tag ? tags[tag] : tags.h3;

    return (
        //@ts-expect-error tag is not a valid prop for h3
        <Tag className={cn("scroll-m-20 text-2xl font-semibold tracking-tight", className)}>
    {children}
    </Tag>
    )
}

export function TypographyH4({ className, children, tag }: TypographyProps) {
    const Tag = tag ? tags[tag] : tags.h4;

    return (
        //@ts-expect-error tag is not a valid prop for h4
        <Tag className={cn("scroll-m-20 text-xl font-semibold tracking-tight", className)}>
    {children}
    </Tag>
    )
}

export function TypographyP({ className, children, tag }: TypographyProps) {
    const Tag = tag ? tags[tag] : tags.p;

    return (
        //@ts-expect-error tag is not a valid prop for p
        <Tag className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}>
    {children}
    </Tag>
    )
}
