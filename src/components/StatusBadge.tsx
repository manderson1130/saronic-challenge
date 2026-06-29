import type { DemoCategory } from "@/types";

interface Props {
    category: DemoCategory;
}

// created a reusable component that each day can use to show its status
export function StatusBadge({category}: Props){
    const styles = {
        "go": "bg-green-100 text-green-800 border border-green-300",
        "iffy": "bg-yellow-100 text-yellow-800 border border-yellow-300",
        "no-go": "bg-red-100 text-red-800 border border-red-300"
    };

    const labels = {
        "go": "GO",
        "iffy": "IFFY",
        "no-go": "NO-GO"
    };

    // define the html output
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[category]}`}>
            {labels[category]}
        </span>
    );
}