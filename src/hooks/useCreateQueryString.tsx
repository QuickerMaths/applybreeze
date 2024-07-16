import { useCallback } from "react";

export default function useCreateQueryString() {
    const createQueryString = useCallback(
        (params: Record<string, string | number | boolean>) => {
            const queryString = Object.entries(params)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
                .join("&");
            return queryString;
        },
        []
    );

    return createQueryString;
}
