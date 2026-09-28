import { redirect } from "next/navigation";

export default function AnnualSummaryRedirect() {
    redirect("/dashboard/farmer/finance?tab=annual-summary");
}
