import { Input } from "@/components/ui/input";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

export function SearchInput({ 
  placeholder = "Search for your favorite Event Centre and more...", 
  className = "",
  onSearch
}: SearchInputProps) {
  const [query, setQuery] = useState("");
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        type="text"
        placeholder={placeholder}
        className="pl-10 pr-3 py-2 rounded-full text-sm"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  );
}
