import { AddTransactionForm } from "@/components/dashboard/add-transaction-form";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { dbConnect } from "@/database/db";
import { authOptions } from "@/lib/auth";
import { Transaction } from "@/models/Transaction";
import mongoose from "mongoose";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Overview of your financial activity, income, expenses and savings at a glance.",
};

export default async function UserHomePage() {
  // check user are logged in
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth");

  // connect to database
  await dbConnect();

  // today date logic
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Fetch today's data from database
  const todayAllTransactions = await Transaction.find({
    userId: session.user.id,
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  // SUMMARY LOGIC (UPDATED)
  let income = 0;
  let cost = 0;

  todayAllTransactions.forEach((item) => {
    const amount = Number(item.amount) || 0;

    // Income
    if (item.category === "income") {
      income += amount;
    }
    // Category (e.g. food, medical)
    else if (item.type !== "withdraw") {
      cost += amount;
    }
  });

  const balance = income - cost;

  const rawData = await Transaction.find({
    userId: new mongoose.Types.ObjectId(session.user.id),
    date: { $gte: startOfDay, $lte: endOfDay },
    type: { $ne: "withdraw" },
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const recentHistory = JSON.parse(JSON.stringify(rawData));

  return (
    <div className="space-y-6">
      {/* 1. Header Cards */}
      <SummaryCards income={income} cost={cost} balance={balance} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* 2. Quick Add Section (Span 3 for layout) */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-zinc-900 border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Quick Entry</h2>
            <AddTransactionForm />
          </div>
        </div>

        {/* 3. Recent History (Span 4 for layout) */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-zinc-900 border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Today&apos;s History</h2>
              <button className="text-sm text-blue-600 hover:underline">
                <Link href={"/user/history"}>View All</Link>
              </button>
            </div>
            <RecentTransactions data={recentHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}
