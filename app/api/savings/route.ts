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

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Savings Stats Calculate
    const stats = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          category: "savings",
        },
      },
      {
        $group: {
          _id: null,
          // Total Net Balance
          total: {
            $sum: {
              $cond: [
                { $gt: [{ $toDouble: "$amount" }, 0] },
                { $toDouble: "$amount" },
                0,
              ],
            },
          },

          // Today's Savings
          today: {
            $sum: {
              $cond: [
                { $gte: ["$date", startOfDay] },
                { $toDouble: "$amount" },
                0,
              ],
            },
          },

          // This Month: deposit or withdraw will be calculate
          month: {
            $sum: {
              $cond: [
                { $gte: ["$date", startOfMonth] },
                { $toDouble: "$amount" },
                0,
              ],
            },
          },
        },
      },
    ]);

    // ২. Savings History (Latest first)
    const history = await Transaction.find({
      userId,
      category: "savings",
    }).sort({ date: -1 });

    return NextResponse.json({
      stats: stats[0] || { total: 0, today: 0, month: 0 },
      history,
    });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
