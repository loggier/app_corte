'use client';

import { Input } from '@/components/ui/input';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface VehicleSearchBarProps {
  initialSearchTerm: string;
  onSearchTermChange: (term: string) => void;
}

export default function VehicleSearchBar({
  initialSearchTerm,
  onSearchTermChange,
}: VehicleSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [search, setSearch] = useState(initialSearchTerm || initialSearch);

  // Effect to update the search state if the URL changes externally
   useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    if (search !== currentSearch) {
      setSearch(currentSearch);
    }
  }, [searchParams]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = event.target.value;

    setSearch(newSearch);

    // Update URL with search parameter
    const params = new URLSearchParams(searchParams.toString());
    if (newSearch) {
      params.set('search', newSearch);
    } else {
      params.delete('search');
    }

    onSearchTermChange(newSearch);

    router.replace(`?${params.toString()}`);
  };

  return (
    <Input
      type="search"
      className="w-full"
      placeholder="Buscar por marca o modelo..."
      value={search}
      onChange={handleInputChange}
    />
  );
}
