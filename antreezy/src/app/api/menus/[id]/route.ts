import errHandler from "@/helpers/errHandler";
import MenuModel from "@/db/models/MenuModel";
import { NewMenuItem } from "@/app/types";
import { generateNutritionalInfo } from "@/helpers/geminiAI";

interface ErrorWithStatus extends Error {
  status?: number;
  message: string;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body: NewMenuItem = await request.json();
    const menuId = (await params).id;

    if (body.composition && body.composition.trim()) {
      try {
        body.nutritionalInfo = await generateNutritionalInfo(body.composition);
        console.log("✅ Updated nutritional info:", body.nutritionalInfo);
      } catch (aiError) {
        console.error("❌ Failed to generate nutritional info:", aiError);
      }
    }

    const result = await MenuModel.updateMenuItem(menuId, body);
    if (!result) throw { status: 400, message: "Failed to update menu item" };

    return Response.json(
      { message: "Menu item updated successfully", data: result },
      { status: 200 }
    );
  } catch (error) {
    console.log("🚀 ~ PUT ~ error:", error);
    return errHandler(error as ErrorWithStatus);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const menuId = (await params).id;
    const result = await MenuModel.deleteMenuItem(menuId);
    if (!result) throw { status: 400, message: "Failed to delete menu item" };
    return Response.json({ message: result }, { status: 200 });
  } catch (error) {
    console.log("🚀 ~ DELETE ~ error:", error);
    return errHandler(error as ErrorWithStatus);
  }
}
