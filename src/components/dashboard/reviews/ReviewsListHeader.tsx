"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useReviewFilters } from "@/components/dashboard/reviews/filters/useReviewFilters";
import { ReviewFiltersForm } from "@/components/dashboard/reviews/filters/ReviewFiltersForm";
import { ResponsiveFilterPanel } from "@/components/dashboard/reviews/filters/ResponsiveFilterPanel";
import { ActiveFilters } from "@/components/dashboard/reviews/filters/ActiveFilters";

export function ReviewsListHeader() {
  const tInbox = useTranslations("dashboard.reviews.inbox");
  const {
    filters,
    activeCount,
    isOpen,
    setIsOpen,
    handleFilterChange,
    handleReset,
    handleSearchChange,
    handleRemoveFilter,
  } = useReviewFilters();

  const committed = filters.search ?? "";
  const [searchValue, setSearchValue] = useState(committed);
  const [lastCommitted, setLastCommitted] = useState(committed);
  const [pending, setPending] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!pending && committed !== lastCommitted) {
    setLastCommitted(committed);
    setSearchValue(committed);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const onSearchChange = (value: string) => {
    setPending(true);
    setSearchValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPending(false);
      handleSearchChange(value);
    }, 350);
  };

  const clearSearch = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setPending(false);
    setSearchValue("");
    handleSearchChange("");
  };

  const replyStatus = filters.replyStatus ?? [];
  const activeTab =
    replyStatus.length === 0 ? "all" : replyStatus.length === 1 && replyStatus[0] === "pending" ? "pending" : "";

  const onTabChange = (value: string) => {
    handleFilterChange({ ...filters, replyStatus: value === "pending" ? ["pending"] : undefined });
  };

  return (
    <div className="flex flex-col gap-3 border-b border-hairline bg-card p-3">
      <div className="flex items-center gap-2">
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className="h-8 p-0.5">
            <TabsTrigger value="all" className="px-2.5 py-1 text-xs">
              {tInbox("tabs.all")}
            </TabsTrigger>
            <TabsTrigger value="pending" className="px-2.5 py-1 text-xs">
              {tInbox("tabs.pending")}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="ms-auto">
          <ResponsiveFilterPanel activeCount={activeCount} open={isOpen} onOpenChange={setIsOpen}>
            <ReviewFiltersForm filters={filters} onApply={handleFilterChange} onReset={handleReset} />
          </ResponsiveFilterPanel>
        </div>
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-ink-3"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={tInbox("searchPlaceholder")}
          className="h-9 bg-surface-2 ps-9 pe-9 [&::-webkit-search-cancel-button]:appearance-none"
          aria-label={tInbox("searchPlaceholder")}
        />
        {searchValue && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label={tInbox("searchPlaceholder")}
            className="absolute inset-y-0 end-2 my-auto flex size-6 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-surface-3 hover:text-ink"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {activeCount > 0 && (
        <ActiveFilters filters={filters} onRemove={handleRemoveFilter} onClearAll={handleReset} hideReplyStatus />
      )}
    </div>
  );
}
