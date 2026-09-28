import { redirect } from "next/navigation";

export default function CreditRedirect() {
    redirect("/dashboard/farmer/finance?tab=credit");
}
