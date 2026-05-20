import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession();

  // Protect the route - if no session, send them back home
  if (!session) {
    redirect("/");
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-lg">Welcome back, {session.user?.name}!</p>
        <p className="text-slate-600">You are successfully logged in to EduHub.</p>
      </div>
    </div>
  );
}