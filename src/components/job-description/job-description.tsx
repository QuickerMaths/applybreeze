import React from "react";
import DOMPurify from 'isomorphic-dompurify';


interface JobDescriptionProps {
    description: string;
}

export default function JobDescription({ description }: JobDescriptionProps) {
    const sanitizedContent = DOMPurify.sanitize(description);
    return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
}
