import { useState, useRef, useEffect } from "react";
import { useAddressSearch } from "../../hooks/useAddressSearch";
import type { AddressSuggestion } from "../../hooks/useAddressSearch";
import { Loader2, MapPin, X } from "lucide-react";

interface Props {
  onSelect: (selected: AddressSuggestion) => void;
  error?: string;
  placeholder?: string;
  defaultValue?: string;
}

export default function AddressAutocomplete({ onSelect, error, placeholder = "Tìm phường/xã theo địa giới mới...", defaultValue = "" }: Props) {
  const { query, setQuery, results, loading } = useAddressSearch();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState(defaultValue);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync internal input value with the query for the hook.
  useEffect(() => {
    setQuery(inputValue);
  }, [inputValue, setQuery]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSelect = (item: AddressSuggestion) => {
    setInputValue(item.fullAddress);
    setIsOpen(false);
    onSelect(item);
  };

  const clearInput = () => {
    setInputValue("");
    setQuery("");
    setIsOpen(false);
  };

  // Helper to highlight matched text (case-insensitive)
  const renderHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return (
      <span>
        {parts.map((p, i) =>
          p.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-indigo-100 text-indigo-700 font-medium px-0.5 rounded">
              {p}
            </mark>
          ) : (
            <span key={i}>{p}</span>
          )
        )}
      </span>
    );
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            if (inputValue.length >= 1) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`block w-full rounded-lg border py-2.5 px-4 pr-10 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
            error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300"
          }`}
          role="combobox"
          aria-expanded={isOpen}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          ) : inputValue ? (
            <button
              type="button"
              onClick={clearInput}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {isOpen && (inputValue.length >= 1) && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
          {results.length === 0 && !loading ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              Không tìm thấy địa chỉ phù hợp
            </div>
          ) : (
            results.map((item, index) => (
              <div
                key={`${item.ward}-${item.province}-${index}`}
                onClick={() => handleSelect(item)}
                className={`cursor-pointer px-4 py-2 flex items-start gap-3 transition-colors ${
                  index === selectedIndex ? "bg-indigo-50" : "hover:bg-gray-50"
                }`}
              >
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {renderHighlightedText(item.ward || item.province, query)}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {item.fullAddress}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
