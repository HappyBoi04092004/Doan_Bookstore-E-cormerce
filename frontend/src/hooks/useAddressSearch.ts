import { useState, useEffect, useRef } from "react";

export interface AddressSuggestion {
  fullAddress: string;
  province: string;
  ward: string;
  provinceCode: number;
  wardCode: number;
}

export function useAddressSearch(debounceMs = 350) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const cache = useRef(new Map<string, AddressSuggestion[]>());

  useEffect(() => {
    const term = query.trim();

    if (!term || term.length < 1) {
      setResults([]);
      setLoading(false);
      return;
    }

    if (cache.current.has(term)) {
      setResults(cache.current.get(term) || []);
      return;
    }

    setLoading(true);

    const handler = setTimeout(async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/address/search?q=${encodeURIComponent(term)}`);
        if (!response.ok) throw new Error("API error");
        
        const data: AddressSuggestion[] = await response.json();
        cache.current.set(term, data);
        setResults(data);
      } catch (error) {
        console.error("Failed to fetch address suggestions", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [query, debounceMs]);

  return {
    query,
    setQuery,
    results,
    loading
  };
}
