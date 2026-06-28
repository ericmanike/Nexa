import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import AgentStore from "@/models/AgentStore";
import StoreBundle from "@/models/StoreBundle";
import Bundle from "@/models/Bundle";
import User from "@/models/User";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    await dbConnect();

    // Query active storefront
    const store = await AgentStore.findOne({ slug: slug.trim(), isActive: true });
    if (!store) {
      return NextResponse.json({ error: "Storefront not found or suspended." }, { status: 404 });
    }

    // Verify owner agent exists
    const agent = await User.findById(store.user);
    if (!agent) {
      return NextResponse.json({ error: "Store owner account not found." }, { status: 404 });
    }

    // Fetch custom pricing configs set by this agent
    const storeBundles = await StoreBundle.find({ agent: agent._id });
    
    // Map custom prices for fast lookup by original bundle ID
    const customPricesMap = new Map();
    storeBundles.forEach((sb) => {
      customPricesMap.set(sb.bundle.toString(), {
        customPrice: sb.customPrice,
        isActive: sb.isActive,
      });
    });

    // Query active standard bundles (audience: user)
    const bundles = await Bundle.find({ isActive: true, audience: "user" }).sort({
      network: 1,
      price: 1,
    });

    // Merge custom settings and filter based on reseller choice
    const mergedBundles = bundles
      .map((b) => {
        const customSetting = customPricesMap.get(b._id.toString());
        return {
          id: b._id.toString(),
          network: b.network,
          name: b.name,
          basePrice: b.price,
          // Custom price if set, else base price
          price: customSetting ? customSetting.customPrice : b.price,
          // Custom visibility if set, else default to visible (true)
          isActive: customSetting ? customSetting.isActive : true,
        };
      })
      // Only return packages the agent has kept active/visible
      .filter((b) => b.isActive);

    return NextResponse.json({
      store: {
        name: store.storeName,
        description: store.description,
        slug: store.slug,
        whatsappSupport: store.whatsappSupport || "",
        agentId: agent._id.toString(),
      },
      bundles: mergedBundles,
    });
  } catch (error: any) {
    console.error("Error fetching public storefront details:", error);
    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
