import { redirect } from 'next/navigation'

export default function AdminDashboard() {
  // Redirect dashboard to Items to avoid duplicate tabs UI
  redirect('/admin/menu')
}
