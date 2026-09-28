import { redirect } from "next/navigation";

export default function InsuranceRedirect() {
    redirect("/dashboard/farmer/finance?tab=insurance");
}
