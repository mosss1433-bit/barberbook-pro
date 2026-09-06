# BarberBook Pro

สร้างเว็บแอปพลิเคชันจองคิวร้านตัดผม (Barber Shop Booking Web Application) ที่ใช้งานได้จริง มีระบบฐานข้อมูลและระบบหลังบ้านสำหรับแอดมิน โดยมีรายละเอียดดังนี้:

1. ระบบเข้าสู่ระบบ (บังคับล็อกอินก่อนใช้งาน):

- เมื่อเปิดเว็บมาต้องเจอหน้าเข้าสู่ระบบ/สมัครสมาชิกทันที โดยผู้ใช้ไม่สามารถเข้าถึงหน้าอื่นได้จนกว่าจะเข้าสู่ระบบ

- ใช้แค่ "ชื่อผู้ใช้ (Username)" และ "เบอร์โทรศัพท์ (Phone Number)" ในการเข้าสู่ระบบเท่านั้น (ไม่ต้องใช้อีเมลหรือรหัสผ่าน)

- บันทึกสถานะการเข้าสู่ระบบของผู้ใช้ไว้

2. ธีมและการออกแบบ (โทนสีดำ-แดง):

- โทนสี: พื้นหลังสีดำเข้ม/เทาเข้ม (Dark mode / Charcoal) ตัดกับสีแดงเข้ม (Crimson Red / Blood Red) สำหรับปุ่มหลัก สถานะ active และหัวข้อสำคัญ

- ดีไซน์พรีเมียม ทันสมัย สไตล์ร้านตัดผมชาย (Barber Shop)

- รองรับการใช้งานทุกหน้าจอ (Responsive ทั้งมือถือและคอมพิวเตอร์) ใช้ Tailwind CSS และ Lucide React icons

3. ฟังก์ชันการทำงานหลัก:

- ฝั่งลูกค้า (Customer):

  - หน้าแสดงบริการ: รายการตัดผม, โกนหนวด, แต่งหนวดเครา พร้อมราคาและระยะเวลา

  - ระบบจองคิว: เลือกบริการ, เลือกวันที่และเวลาว่าง (ป้องกันการจองซ้ำเวลาเดียวกัน) และกดยืนยันการจอง

  - ประวัติการจอง: ดูรายการจองของฉัน และสามารถกดยกเลิกได้

- ฝั่งแอดมิน (Admin Dashboard - สำหรับเจ้าของร้าน):

  - จัดการบริการ: เพิ่ม, แก้ไข, ลบ รายการบริการ ราคา และเวลา

  - จัดการคิว: ดูรายการจองทั้งหมดของลูกค้า กรองตามสถานะ และอัปเดตสถานะการจอง (รอดำเนินการ, ยืนยันแล้ว, เสร็จสิ้น, ยกเลิก)

  - ภาพรวม: แสดงสรุปยอดจองและข้อมูลต่างๆ

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2a90d614-ac0d-4b55-82ba-355700693c92).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
