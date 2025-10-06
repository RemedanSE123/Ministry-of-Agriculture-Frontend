// import UserManagement from "@/components/dashboard/user-management";
import UserManagement from "@/components/dashboard/user-management";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function UsersPage() {
  return (
    <ProtectedRoute requireSuperAdmin={true}>
      <UserManagement />
    </ProtectedRoute>
  );
}