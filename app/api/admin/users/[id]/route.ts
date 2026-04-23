// app/api/admin/users/[id]/route.ts

import { dbConnect } from "@/database/db";
import { User } from "@/models/User";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  // Type change: params ekhon ekta Promise
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();

    // Params await kora thik ache
    const { id } = await params;
    const { role } = await req.json();

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }, // 'returnDocument: after' er bodole 'new: true' use kora mongoose e standard
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Admin PATCH Error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
