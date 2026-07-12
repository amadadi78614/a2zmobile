import { notFound } from "next/navigation";
import Image from "next/image";
import { mockOrders } from "@/lib/data/orders";
import { formatZAR } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

const trackingSteps = ["pending", "paid", "packed", "shipped", "delivered"] as const;

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = mockOrders.find((o) => o.orderNumber === orderNumber);
  if (!order) notFound();

  const currentStepIndex = trackingSteps.indexOf(
    order.status as (typeof trackingSteps)[number]
  );

  return (
    <div>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{order.orderNumber}</h2>
        <p className="text-sm text-ink-400">
          Placed {new Date(order.placedAt).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {order.fulfilmentMethod === "delivery" && currentStepIndex >= 0 && (
        <div className="mt-8 flex items-center justify-between">
          {trackingSteps.map((step, i) => (
            <div key={step} className="flex flex-1 flex-col items-center gap-2 last:flex-none">
              <div className="flex w-full items-center">
                {i > 0 && (
                  <div className={`h-px flex-1 ${i <= currentStepIndex ? "bg-ink" : "bg-line"}`} />
                )}
                {i <= currentStepIndex ? (
                  <CheckCircle2 size={18} className="shrink-0 fill-ink text-paper" />
                ) : (
                  <Circle size={18} className="shrink-0 text-line" />
                )}
              </div>
              <span className="text-[10px] font-medium capitalize text-ink-400">{step}</span>
            </div>
          ))}
        </div>
      )}

      {order.trackingNumber && (
        <p className="mt-4 text-sm text-ink-400">
          Tracking number: <span className="font-medium text-ink">{order.trackingNumber}</span>
        </p>
      )}

      <div className="mt-10 divide-y divide-line border-y border-line">
        {order.items.map((item, i) => (
          <div key={i} className="flex gap-4 py-5">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-mist">
              <Image src={item.image} alt={item.title} fill sizes="80px" className="object-cover" />
            </div>
            <div className="flex flex-1 flex-col justify-center">
              <p className="text-sm font-medium">{item.title}</p>
              {item.colorway && <p className="mt-1 text-xs text-ink-400">Colour: {item.colorway}</p>}
              <p className="mt-1 text-xs text-ink-400">Qty {item.quantity}</p>
            </div>
            <span className="self-center text-sm font-semibold">
              {formatZAR(item.unitPrice * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-end gap-1 text-sm">
        <div className="flex w-48 justify-between text-ink-400">
          <span>Subtotal</span>
          <span>{formatZAR(order.subtotal)}</span>
        </div>
        <div className="flex w-48 justify-between text-ink-400">
          <span>Delivery</span>
          <span>{order.deliveryFee ? formatZAR(order.deliveryFee) : "Free"}</span>
        </div>
        <div className="flex w-48 justify-between border-t border-line pt-1 font-semibold">
          <span>Total</span>
          <span>{formatZAR(order.total)}</span>
        </div>
      </div>

      {order.fulfilmentMethod === "delivery" && order.address && (
        <div className="mt-10 border border-line p-5">
          <h3 className="text-sm font-semibold">Delivery Address</h3>
          <p className="mt-2 text-sm text-ink-400">
            {order.address.recipientName}
            <br />
            {order.address.line1}
            {order.address.line2 ? `, ${order.address.line2}` : ""}
            <br />
            {order.address.city}, {order.address.province} {order.address.postalCode}
          </p>
        </div>
      )}

      {order.fulfilmentMethod === "collection" && order.collectionStore && (
        <div className="mt-10 border border-line p-5">
          <h3 className="text-sm font-semibold">Collection Point</h3>
          <p className="mt-2 text-sm text-ink-400">{order.collectionStore}</p>
        </div>
      )}
    </div>
  );
}
