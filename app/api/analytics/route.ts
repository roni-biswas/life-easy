import { dbConnect } from "@/database/db";
import { Transaction } from "@/models/Transaction";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    await dbConnect();

    // 1. Monthly Stats (Income vs Total Deductions)
    const monthlyStats = await Transaction.aggregate([
      { $match: { userId: userObjectId } },
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
          // Expense + Savings (Deductions)
          expense: {
            $sum: {
              $cond: [
                {
                  $or: [
                    {
                      $and: [
                        { $ne: ["$category", "income"] },
                        { $ne: ["$type", "withdraw"] },
                      ],
                    },
                    { $eq: ["$category", "savings"] }, // Explicitly adding savings
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

    // 2. Category Breakdown (Including Savings as a Category)
    const categoryStats = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          category: { $ne: "income" },
          type: { $ne: "withdraw" }, // Withdraw analytics e asbe na, sudhu deposit savings asbe
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
