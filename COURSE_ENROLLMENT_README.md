# 🎓 نظام التسجيل في الدورات - أكاديمية الرضوان

## 📋 نظرة عامة

تم تطوير نظام شامل ومتطور للتسجيل في الدورات التعليمية باللغة العربية، يتضمن:
- واجهة مودال تفاعلية لتأكيد التسجيل
- نظام إدارة البيانات المحلية (JSON Server)
- رسائل نجاح وخطأ تفاعلية
- دعم قائمة الانتظار للدورات المكتملة
- تكامل مع لوحة التحكم

## 🏗️ هيكل المشروع

```
src/
├── components/
│   ├── modals/
│   │   ├── EnrollModal.tsx          # المودال الرئيسي
│   │   ├── EnrollModalHeader.tsx    # رأس المودال
│   │   ├── EnrollModalBody.tsx      # محتوى المودال
│   │   ├── EnrollModalActions.tsx   # أزرار المودال
│   │   └── index.ts                 # مُصدِّر المودالز
│   ├── enrollment/
│   │   ├── CourseEnrollmentManager.tsx  # مدير نظام التسجيل
│   │   ├── CourseList.tsx           # قائمة الدورات
│   │   └── index.ts                 # مُصدِّر مكونات التسجيل
│   └── ui/
│       ├── SuccessMessage.tsx       # رسائل النجاح
│       └── ErrorMessage.tsx         # رسائل الخطأ
├── types/
│   ├── enrollment.ts                # أنواع بيانات التسجيل
│   └── course.ts                    # أنواع بيانات الدورات
├── api/
│   └── enrollments.ts               # API التسجيلات
└── app/
    ├── courses/page.tsx             # صفحة الدورات المحدثة
    └── test-enrollment/page.tsx     # صفحة اختبار النظام
```

## 🚀 الميزات الرئيسية

### 1. نظام المودال التفاعلي
- **العرض المرئي**: عرض تفاصيل الدورة كاملة
- **التحقق الذكي**: فحص التسجيل المسبق
- **حالة التحميل**: مؤشرات بصرية أثناء المعالجة
- **الاستجابة**: تصميم متجاوب لجميع الشاشات

### 2. إدارة البيانات
- **قاعدة البيانات**: JSON Server للتطوير
- **العمليات الكاملة**: إنشاء، قراءة، تحديث، حذف
- **التحقق من الأخطاء**: معالجة شاملة للأخطاء
- **ربط البيانات**: ربط معلومات الدورة مع التسجيل

### 3. تجربة المستخدم
- **رسائل واضحة**: إشعارات نجاح وخطأ باللغة العربية
- **التوجيه الذكي**: إرشادات للخطوات القادمة
- **التصميم الإسلامي**: ألوان وأيقونات متناسبة مع الثقافة

## 🛠️ كيفية الاستخدام

### 1. استخدام مدير التسجيل

```tsx
import { CourseEnrollmentManager, CourseList } from "@/components/enrollment";
import { CourseWithDetails } from "@/types/course";

const MyCoursesPage = () => {
  const [courses, setCourses] = useState<CourseWithDetails[]>([]);

  return (
    <CourseEnrollmentManager studentId={currentStudentId}>
      <CourseList courses={courses} />
    </CourseEnrollmentManager>
  );
};
```

### 2. استخدام المودال مباشرة

```tsx
import { EnrollModal } from "@/components/modals";
import { useState } from "react";

const CustomComponent = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        التسجيل في الدورة
      </button>
      
      <EnrollModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        course={selectedCourse}
        studentId={123}
        onSuccess={(message) => alert(message)}
        onError={(error) => alert(error)}
      />
    </>
  );
};
```

## 📊 بنية قاعدة البيانات

### جدول التسجيلات (enrollments)
```json
{
  "id": 1,
  "studentId": "123",
  "courseId": "456", 
  "status": "pending | active | rejected",
  "paymentConfirmed": false,
  "createdAt": "2024-01-15T10:00:00Z",
  "amount": 250,
  "notes": "ملاحظات إضافية"
}
```

## 🔄 تدفق العمل

1. **اختيار الدورة**: الطالب يختار دورة من القائمة
2. **عرض التفاصيل**: المودال يعرض معلومات شاملة
3. **التحقق**: فحص التسجيل المسبق والأماكن المتاحة
4. **التأكيد**: الطالب يؤكد رغبته في التسجيل
5. **الحفظ**: حفظ طلب التسجيل في قاعدة البيانات
6. **الإشعار**: عرض رسالة نجاح مع التوجيهات

## 🎯 الخطوات القادمة

### المرحلة الثانية
- [ ] تكامل مع نظام المصادقة الحقيقي
- [ ] إضافة إشعارات فورية (Real-time notifications)
- [ ] تطوير لوحة تحكم الإدارة
- [ ] نظام الموافقات والرفض

### المرحلة الثالثة  
- [ ] نظام الدفع الإلكتروني
- [ ] تقارير تفصيلية للتسجيلات
- [ ] نظام التقييم والمراجعات
- [ ] إشعارات البريد الإلكتروني

## 🧪 الاختبار

يمكن اختبار النظام عبر الصفحة المخصصة:
```
/test-enrollment
```

## 📞 الدعم الفني

للاستفسارات والدعم الفني، يرجى التواصل مع فريق التطوير.

---

**تم التطوير بـ ❤️ لأكاديمية الرضوان**