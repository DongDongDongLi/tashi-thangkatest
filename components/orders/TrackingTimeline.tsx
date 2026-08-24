import type { TrackingCheckpoint } from "@/lib/order-types";

type TrackingTimelineProps = {
  checkpoints: TrackingCheckpoint[];
  status?: string;
  expectedDelivery?: string;
};

export function TrackingTimeline({
  checkpoints,
  status,
  expectedDelivery,
}: TrackingTimelineProps) {
  if (!checkpoints.length) {
    return (
      <p className="text-sm text-stone">
        Tracking information will appear here once the carrier updates the shipment.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {status && (
        <p className="text-sm font-medium text-charcoal">Status: {status}</p>
      )}
      {expectedDelivery && (
        <p className="text-sm text-stone">
          Estimated delivery: {new Date(expectedDelivery).toLocaleDateString()}
        </p>
      )}
      <ol className="relative space-y-6 border-l border-gold/30 pl-6">
        {checkpoints.map((cp, index) => (
          <li key={`${cp.time}-${index}`} className="relative">
            <span className="absolute -left-[1.6rem] top-1 h-3 w-3 rounded-full bg-burgundy" />
            <p className="text-xs text-stone">
              {new Date(cp.time).toLocaleString()}
            </p>
            <p className="text-sm font-medium text-charcoal">{cp.message}</p>
            {cp.location && (
              <p className="text-sm text-stone">{cp.location}</p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
