import React from "react";

interface SavedSearchProps {
  params: {
    id: string;
  };
}

export default function SavedSearch({ params }: SavedSearchProps) {
  return <div>Saved search {params.id}</div>;
}
