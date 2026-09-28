import { redirect } from "next/navigation";

export default function StorageRedirect() {
    redirect("/dashboard/farmer/finance?tab=storage");
}
