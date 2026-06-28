import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Bundle from "@/models/Bundle";
import StoreBundle from "@/models/StoreBundle";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById((session.user as any).id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }


    // Get all active standard bundles (which are sold to public storefront users)
    const bundles = await Bundle.find({ isActive: true, audience: "user" }).sort({
      network: 1,
      price: 1,
    });

    // Get custom storefront prices configured by this agent
    const storeBundles = await StoreBundle.find({ agent: user._id });

    // Map store bundles for fast lookup
    const customPricesMap = new Map();
    storeBundles.forEach((sb) => {
      customPricesMap.set(sb.bundle.toString(), {
        customPrice: sb.customPrice,
        isActive: sb.isActive,
      });
    });

    // Merge custom settings with the original bundles
    const mergedBundles = bundles.map((b) => {
      const customSetting = customPricesMap.get(b._id.toString());
      return {
        id: b._id,
        network: b.network,
        name: b.name,
        basePrice: b.price,
        customPrice: customSetting ? customSetting.customPrice : b.price,
        isActive: customSetting ? customSetting.isActive : true,
      };
    });

    return NextResponse.json({ bundles: mergedBundles });
  } catch (error: any) {
    console.error("Error fetching agent storefront prices:", error);
    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById((session.user as any).id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }


    const { prices } = await req.json();

    if (!prices || !Array.isArray(prices)) {
      return NextResponse.json(
        { error: "Invalid payload format. Expected pricing array." },
        { status: 400 }
      );
    }

    // Process and save custom pricing configurations
    for (const item of prices) {
      const { bundleId, customPrice, isActive } = item;

      if (!bundleId || customPrice === undefined || customPrice === null) {
        return NextResponse.json(
          { error: "Missing required bundle ID or price configuration." },
          { status: 400 }
        );
      }

      // Fetch the original base bundle to obtain the base price and validate it
      const originalBundle = await Bundle.findById(bundleId);
      if (!originalBundle) {
        return NextResponse.json(
          { error: `Bundle with ID ${bundleId} not found.` },
          { status: 404 }
        );
      }

      const numericCustomPrice = Number(customPrice);
      if (isNaN(numericCustomPrice) || numericCustomPrice <= 0) {
        return NextResponse.json(
          { error: `Invalid custom price for bundle: ${originalBundle.name}` },
          { status: 400 }
        );
      }

      if (numericCustomPrice < originalBundle.price) {
        return NextResponse.json(
          {
            error: `Price for ${originalBundle.network} ${originalBundle.name} cannot be lower than the base price of GH₵ ${originalBundle.price}.`,
          },
          { status: 400 }
        );
      }

      // Upsert the custom storefront bundle
      await StoreBundle.findOneAndUpdate(
        { agent: user._id, bundle: bundleId },
        {
          basePrice: originalBundle.price,
          customPrice: numericCustomPrice,
          isActive: isActive !== undefined ? isActive : true,
        },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({ success: true, message: "Storefront prices updated successfully." });
  } catch (error: any) {
    console.error("Error saving storefront prices:", error);
    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
