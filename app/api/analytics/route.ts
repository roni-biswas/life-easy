import { dbConnect } from "@/database/db";
import { Transaction } from "@/models/Transaction";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET() {
  try {
    // 1. User Session Check
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id; // Logged-in user-er ID
    const userObjectId = new mongoose.Types.ObjectId(userId);

    await dbConnect();

    // 2. Aggregation for Monthly Data (ONLY for this user)
    const monthlyStats = await Transaction.aggregate([
      {
        $match: { userId: userObjectId },
      },
      {
        $group: {
          _id: {
            month: { $month: { $toDate: "$date" } },
            year: { $year: { $toDate: "$date" } },
          },
          income: {
            $sum: {
              $cond: [
                { $eq: ["$category", "income"] },
                { $convert: { input: "$amount", to: "double", onError: 0 } },
                0,
              ],
            },
          },
          expense: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$category", "income"] },
                    { $ne: ["$category", "savings"] },
                  ],
                },
                { $convert: { input: "$amount", to: "double", onError: 0 } },
                0,
              ],
            },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // 3. Aggregation for Category Breakdown (ONLY for this user)
    const categoryStats = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId, // SECURITY
          category: { $nin: ["income", "savings"] },
        },
      },
      {
        $group: {
          _id: "$category",
          total: {
            $sum: { $convert: { input: "$amount", to: "double", onError: 0 } },
          },
        },
      },
    ]);

    // 4. Format Data for Recharts
    const chartData = monthlyStats.map((stat) => ({
      name: new Date(2000, stat._id.month - 1).toLocaleString("default", {
        month: "short",
      }),
      income: stat.income,
      expense: stat.expense,
    }));

    const pieData = categoryStats.map((cat) => ({
      name: cat._id.charAt(0).toUpperCase() + cat._id.slice(1),
      value: cat.total,
    }));

    return NextResponse.json({ chartData, pieData });
  } catch (err) {
    const error = err as Error;
    console.error("Analytics Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
