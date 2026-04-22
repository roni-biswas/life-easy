import { dbConnect } from "@/database/db";
import { authOptions } from "@/lib/auth";
import { Transaction } from "@/models/Transaction";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    await dbConnect();

    let query: any = {
      userId: new mongoose.Types.ObjectId((session.user as any).id),
    };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Statement-er jonno latest data upore thakbe
    const transactions = await Transaction.find(query).sort({ date: -1 });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Statement API Error:", error);
    return NextResponse.json(
      { message: "Error fetching statement" },
      { status: 500 },
    );
  }
}
