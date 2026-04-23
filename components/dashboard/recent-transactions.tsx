"use client";

import {
  Pill,
  Home,
  Heart,
  Wallet,
  Banknote,
  MoreVertical,
} from "lucide-react";
import { ActionMenu } from "./action-menu";
import { useEffect, useState } from "react";

const getCategoryDetails = (category: string) => {
  switch (category) {
    case "income":
      return {
        icon: <Banknote className="h-4 w-4" />,
        label: "Income",
        color: "text-green-600 bg-green-50 dark:bg-green-900/20",
      };
    case "medicine":
      return {
        icon: <Pill className="h-4 w-4" />,
        label: "Medicine",
        color: "text-red-600 bg-red-50 dark:bg-red-900/20",
      };
    case "family":
      return {
        icon: <Home className="h-4 w-4" />,
        label: "Family",
        color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
      };
    case "savings":
      return {
        icon: <Wallet className="h-4 w-4" />,
        label: "Savings",
        color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
      };
    default:
      return {
        icon: <Heart className="h-4 w-4" />,
        label: "Personal",
        color: "text-zinc-600 bg-zinc-50 dark:bg-zinc-800/50",
      };
  }
};

export function RecentTransactions({ data: initialData }: { data: any[] }) {
  const [transactions, setTransactions] = useState(initialData);

  // 3. initialData change hole state update kora (Next.js server-side sync)
  useEffect(() => {
    setTransactions(initialData);
  }, [initialData]);

  // Delete handler
  const handleDeleteSuccess = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t._id !== id));
  };
  // Update handler
  const handleUpdateSuccess = (updatedItem: any) => {
    setTransactions((prev) =>
      prev.map((item) => (item._id === updatedItem._id ? updatedItem : item)),
    );
  };

  return (
    <div className="w-full space-y-2">
      {/* Table Header - Desktop-e 5 columns kora hoyeche */}
      <div className="hidden md:grid grid-cols-5 px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border rounded-t-lg font-semibold text-sm">
        <div className="col-span-1">Description</div>
        <div>Date</div>
        <div>Category</div>
        <div className="text-right">Amount</div>
        <div className="text-right pr-2">Action</div>
      </div>

      {/* Transactions List */}
      <div className="space-y-2 md:space-y-0 md:border md:rounded-b-lg overflow-hidden">
        {transactions.map((item) => {
          const details = getCategoryDetails(item.category);
          return (
            <div
              key={item._id}
              className="flex flex-col md:grid md:grid-cols-5 p-4 md:px-4 md:py-3 bg-white dark:bg-zinc-950 border md:border-0 md:border-b last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all rounded-lg md:rounded-none items-center"
            >
              {/* 1. Description & Action (Mobile) */}
              <div className="flex justify-between items-start md:block w-full md:col-span-1">
                <div className="flex flex-col">
                  <span className="font-medium text-sm md:text-base line-clamp-1">
                    {item.title}
                  </span>
                  {/* Mobile-e title-er niche subtle date */}
                  <span className="text-[10px] text-zinc-500 md:hidden mt-0.5">
                    {new Date(item.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                </div>
                <div className="md:hidden">
                  {item.category !== "savings" && (
                    <ActionMenu
                      item={item}
                      onDeleteSuccess={handleDeleteSuccess}
                      onUpdateSuccess={handleUpdateSuccess}
                    />
                  )}
                </div>
              </div>

              {/* 2. Date (Only Desktop View) */}
              <div className="hidden md:flex items-center text-sm text-zinc-600">
                {new Date(item.date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                })}
              </div>

              {/* 3. Category */}
              <div className="mt-2 md:mt-0 w-full md:w-auto">
                <div
                  className={`flex items-center gap-1.5 w-fit px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium border ${details.color} border-current/10`}
                >
                  {details.icon}
                  <span>{details.label}</span>
                </div>
              </div>

              {/* 4. Amount */}
              <div
                className={`mt-1 md:mt-0 w-full md:w-auto md:text-right font-bold text-base ${item.category === "income" ? "text-green-600" : "text-red-600"}`}
              >
                <span className="md:hidden text-[10px] text-zinc-400 font-normal mr-1">
                  Amount:
                </span>
                {item.category === "income" ? "+" : "-"}{" "}
                {item.amount.toLocaleString()}
              </div>

              {/* 5. Desktop Action */}
              <div className="hidden md:flex justify-end">
                {item.category !== "savings" && (
                  <ActionMenu
                    item={item}
                    onDeleteSuccess={handleDeleteSuccess}
                    onUpdateSuccess={handleUpdateSuccess}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
