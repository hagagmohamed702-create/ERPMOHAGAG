// Server Component - remove client directive for error boundary behavior

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="relative inline-flex">
            <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30 rounded-full" />
            <h1 className="relative text-9xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              404
            </h1>
          </div>
        </div>
        {/* Static text content to avoid client-only components */}
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-2">الصفحة غير موجودة</h2>
          <p className="text-sm text-muted-foreground">
            عذراً، لا يمكننا العثور على الصفحة التي تبحث عنها. ربما تم نقلها أو حذفها.
          </p>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button className="btn-primary">العودة للرئيسية</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">لوحة التحكم</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}