
export function MarketCard({ label, value }: { label: string; value?: string }) {
    if (!value) return null;
    return (
        <div className="bg-[#f8fafc] rounded-md p-2 border border-[#03334c]/5 text-center">
            <div className="text-[10px] font-semibold text-[#5a6b7f] mb-0.5">{label}</div>
            <div className="text-xs font-bold text-[#03334c] truncate" title={value}>
                {value}
            </div>
        </div>
    );
}
