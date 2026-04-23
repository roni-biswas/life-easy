import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";
import { dbConnect } from "@/database/db";
import { Transaction } from "@/models/Transaction";

export async function GET() {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = new mongoose.Types.ObjectId(session.user.id as string);
    const now = new Date();

    // Date boundaries set kora
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Savings Stats Calculate
    const stats = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          category: "savings",
        },
      },
      {
        $group: {
          _id: null,
          // Net Total Balance:
          total: { $sum: { $toDouble: "$amount" } },

          // Today's Savings:
          today: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$date", startOfDay] },
                    { $eq: ["$type", "deposit"] },
                  ],
                },
                { $toDouble: "$amount" },
                0,
              ],
            },
          },

          // This Month Savings
          month: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$date", startOfMonth] },
                    { $eq: ["$type", "deposit"] },
                  ],
                },
                { $toDouble: "$amount" },
                0,
              ],
            },
          },
        },
      },
    ]);

    // Savings History (Latest first)
    const history = await Transaction.find({
      userId,
      category: "savings",
    }).sort({ date: -1 });

    return NextResponse.json({
      stats: stats[0] || { total: 0, today: 0, month: 0 },
      history,
    });
  } catch (error) {
    console.error("Savings API Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
