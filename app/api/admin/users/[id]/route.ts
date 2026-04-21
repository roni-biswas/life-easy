// app/api/admin/users/[id]/route.ts

import { dbConnect } from "@/database/db";
import { User } from "@/models/User";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await dbConnect();
    const { role } = await req.json();
    const { id } = await params;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { returnDocument: "after" },
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
