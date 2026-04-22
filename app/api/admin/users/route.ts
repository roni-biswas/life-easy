import { dbConnect } from "@/database/db";
import { Transaction } from "@/models/Transaction";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    const summary = await Transaction.aggregate([
      {
        $addFields: {
          dateStr: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        },
      },
      {
        $group: {
          _id: { userId: "$userId", date: "$dateStr" },
          // Total Income
          totalIncome: {
            $sum: {
              $cond: [
                { $eq: ["$category", "income"] },
                { $toDouble: "$amount" },
                0,
              ],
            },
          },
          // Total Cost
          totalCost: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$category", "income"] },
                    { $ne: ["$category", "savings"] },
                    { $ne: ["$type", "withdraw"] },
                  ],
                },
                { $toDouble: "$amount" },
                0,
              ],
            },
          },
          // Total Savings
          totalSavings: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$category", "savings"] },
                    { $eq: ["$type", "deposit"] },
                  ],
                },
                { $toDouble: "$amount" },
                0,
              ],
            },
          },
          // Total Withdraw
          totalWithdraw: {
            $sum: {
              $cond: [
                { $eq: ["$type", "withdraw"] },
                { $toDouble: "$amount" },
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id.userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          _id: 0,
          userId: "$_id.userId",
          date: "$_id.date",
          name: "$userDetails.name",
          email: "$userDetails.email",
          role: "$userDetails.role",
          totalIncome: 1,
          totalCost: 1,
          totalSavings: 1,
          totalWithdraw: 1,
          // Net Balance calculation
          netBalance: {
            $subtract: [
              "$totalIncome",
              { $add: ["$totalCost", "$totalSavings"] },
            ],
          },
        },
      },
      { $sort: { date: -1 } },
    ]);

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Admin Summary Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
