import Order from "@/models/Order";

export async function createOrder(session: any, data: any) {
  const ref = data.reference.trim();

  return await Order.create({
    ...(session?.user?.id ? { user: session.user.id } : {}),
    transaction_id: "paid_" + ref,
    network: data.network,
    agent: data.agent || null,
    bundleName: data.bundleName,
    payment_id: ref,
    price: data.price,
    phoneNumber: data.phoneNumber,
    status: "processing",
  });
}