import BalanceTicker from "@/components/BalanceTicker";

export default function TopNav() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-6 z-50 -translate-x-1/2">
      <BalanceTicker />
    </div>
  );
}
