// app/api/admin/users/route.ts
import { dbConnect } from "@/database/db";
import { Transaction } from "@/models/Transaction";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    const summary = await Transaction.aggregate([
      {
        // Date ke string format-e niye asha (YYYY-MM-DD) jate grouping kora jay
        $addFields: {
          dateStr: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        },
      },
      {
        // User ebong Date - ei dui tar upor vitti kore group kora
        $group: {
          _id: { userId: "$userId", date: "$dateStr" },
          totalIncome: {
            $sum: {
              $cond: [
                { $eq: ["$category", "income"] },
                { $toDouble: "$amount" },
                0,
              ],
            },
          },
          totalCost: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$category", "income"] },
                    { $ne: ["$category", "savings"] },
                  ],
                },
                { $toDouble: "$amount" },
                0,
              ],
            },
          },
          totalSavings: {
            $sum: {
              $cond: [
                { $eq: ["$category", "savings"] },
                { $toDouble: "$amount" },
                0,
              ],
            },
          },
        },
      },
      {
        // User details join kora
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
          netBalance: {
            $subtract: [
              "$totalIncome",
              { $add: ["$totalCost", "$totalSavings"] },
            ],
          },
        },
      },
      { $sort: { date: -1 } }, // Newest date upore thakbe
    ]);

    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
