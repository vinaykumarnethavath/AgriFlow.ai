import { redirect } from "next/navigation";

export default function SeasonComparisonRedirect() {
    redirect("/dashboard/farmer/finance?tab=season-comparison");
}
