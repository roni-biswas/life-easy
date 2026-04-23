import { dbConnect } from "@/database/db";
import { authOptions } from "@/lib/auth";
import { transactionSchema } from "@/lib/validations";
import { Transaction } from "@/models/Transaction";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// 1. DELETE Method Update
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }, // Type hobe Promise
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await dbConnect();

    // params ke await korte hobe
    const { id } = await params;

    const deletedTransaction = await Transaction.findOneAndDelete({
      _id: id,
      userId: (session.user as any).id,
    });

    if (!deletedTransaction) {
      return NextResponse.json(
        { message: "Transaction not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting" }, { status: 500 });
  }
}

// 2. PATCH Method Update
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }, // Type hobe Promise
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // params ke await korte hobe
    const { id } = await params;

    const validation = transactionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.message },
        { status: 400 },
      );
    }
    const { title, amount, category } = validation.data;

    await dbConnect();

    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: id, userId: (session.user as any).id },
      { title, amount, category },
      { new: true },
    );

    if (!updatedTransaction) {
      return NextResponse.json(
        { message: "Transaction not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}
