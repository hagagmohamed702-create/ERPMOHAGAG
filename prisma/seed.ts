import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 بدء عملية البذر...')

  // 1. إنشاء الحسابات الأساسية
  console.log('📊 إنشاء الحسابات الأساسية...')
  
  const accounts = await Promise.all([
    prisma.account.create({
      data: {
        code: 'ACC-001',
        name: 'الصندوق الرئيسي',
        type: 'asset',
        description: 'الصندوق النقدي الرئيسي للشركة'
      }
    }),
    prisma.account.create({
      data: {
        code: 'ACC-002',
        name: 'البنك الأهلي',
        type: 'asset',
        description: 'حساب البنك الأهلي التجاري'
      }
    }),
    prisma.account.create({
      data: {
        code: 'ACC-003',
        name: 'حساب العملاء',
        type: 'asset',
        description: 'حساب مديونية العملاء'
      }
    }),
    prisma.account.create({
      data: {
        code: 'ACC-004',
        name: 'حساب الموردين',
        type: 'liability',
        description: 'حساب مديونية الموردين'
      }
    })
  ])

  console.log(`✅ تم إنشاء ${accounts.length} حسابات`)

  // 2. إنشاء الصندوق
  console.log('💰 إنشاء الصندوق...')
  
  const cashbox = await prisma.cashbox.create({
    data: {
      code: 'CB-001',
      name: 'الصندوق الرئيسي',
      type: 'main',
      balance: 0,
      description: 'الصندوق النقدي الرئيسي'
    }
  })

  console.log('✅ تم إنشاء الصندوق')

  // 3. إنشاء المخزن الرئيسي
  console.log('🏭 إنشاء المخزن...')
  
  const warehouse = await prisma.warehouse.create({
    data: {
      code: 'WH-001',
      name: 'المخزن الرئيسي',
      location: 'الرياض'
    }
  })

  console.log('✅ تم إنشاء المخزن')

  // 4. إنشاء بعض المواد الأساسية
  console.log('📦 إنشاء المواد الأساسية...')
  
  const materials = await Promise.all([
    prisma.material.create({
      data: {
        code: 'MAT-001',
        name: 'أسمنت',
        unit: 'كيس',
        lastPrice: 25,
        minQuantity: 100,
        currentQty: 0,
        category: 'مواد بناء'
      }
    }),
    prisma.material.create({
      data: {
        code: 'MAT-002',
        name: 'حديد تسليح',
        unit: 'طن',
        lastPrice: 5000,
        minQuantity: 10,
        currentQty: 0,
        category: 'مواد بناء'
      }
    }),
    prisma.material.create({
      data: {
        code: 'MAT-003',
        name: 'رمل',
        unit: 'متر مكعب',
        lastPrice: 80,
        minQuantity: 50,
        currentQty: 0,
        category: 'مواد بناء'
      }
    })
  ])

  console.log(`✅ تم إنشاء ${materials.length} مواد أساسية`)



  console.log('\n🎉 تمت عملية البذر بنجاح!')
  
  // عرض ملخص
  console.log('\n📊 ملخص البيانات المنشأة:')
  console.log(`- الحسابات: ${accounts.length}`)
  console.log(`- الصناديق: 1`)
  console.log(`- المخازن: 1`)
  console.log(`- المواد: ${materials.length}`)

}

main()
  .catch((e) => {
    console.error('❌ خطأ في عملية البذر:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })