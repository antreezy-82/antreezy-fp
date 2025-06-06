import { NextRequest, NextResponse } from "next/server";
import ReviewModel from "@/db/models/ReviewModel";
import errHandler from "@/helpers/errHandler";

type ErrorWithStatus = {
  status?: number;
  message: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, rating, comment, tableId } = body;

    // Validate required fields
    if (!orderId || !rating || !tableId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new review using ReviewModel
    const review = await ReviewModel.createReview({
      orderId,
      rating,
      comment: comment || "",
      tableId,
    });

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    return errHandler(error as ErrorWithStatus);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get("tableId");
    const orderId = searchParams.get("orderId");

    let reviews;

    if (tableId) {
      reviews = await ReviewModel.getReviewsByTableId(tableId);
    } else if (orderId) {
      reviews = await ReviewModel.getReviewsByOrderId(orderId);
    } else {
      reviews = await ReviewModel.getAllReviews();
    }

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return errHandler(error as ErrorWithStatus);
  }
}
