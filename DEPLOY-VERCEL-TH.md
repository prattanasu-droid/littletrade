# นำ Little Trade ขึ้น GitHub และ Vercel

ไฟล์ชุดนี้เป็นซอร์ส React + Phaser + Vite พร้อมภาพ เพลง ฟอนต์ และเควสหลัก 12 เควส ใช้ Node.js 22.x มี `vercel.json` ตั้งค่าการ build ให้แล้ว

## 1. เตรียมไฟล์ใน GitHub

1. แตกไฟล์ `little-trade-github-vercel.zip` จะได้โฟลเดอร์ `little-trade`
2. สร้าง repository ใหม่ใน GitHub ตั้งชื่อ เช่น `little-trade` เลือก Public หรือ Private ตามต้องการ
3. เปิด **Add file → Upload files** แล้วอัปโหลดเนื้อหาภายในโฟลเดอร์ที่แตกออกมา พร้อมโฟลเดอร์ `src`, `public`, `supabase`, `tests`, `scripts` และไฟล์ตั้งค่าทั้งหมด จากนั้นกด **Commit changes**
4. ตรวจว่า `package.json`, `package-lock.json`, `index.html`, `vite.config.js` และ `vercel.json` อยู่ที่ระดับแรกของ repository

ไฟล์ `.gitignore`, `.nvmrc` และ `.env.example` เป็นไฟล์ที่อาจถูกซ่อนในตัวจัดการไฟล์ ให้รวมเข้า repository ด้วย ชุด ZIP ไม่รวม node_modules, dist, ประวัติ Git, ไฟล์ .env จริง หรือข้อมูลการโฮสต์ Sites เดิม

## 2. Deploy บน Vercel

1. เข้า Vercel → **Add New → Project** → เชื่อม GitHub และเลือก repository ที่เพิ่งสร้าง
2. ให้ Root Directory เป็นโฟลเดอร์ที่มี `package.json` (ถ้าอัปโหลดเนื้อหาที่ root ใช้ค่าเริ่มต้นได้เลย; ถ้าอัปโหลดทั้งโฟลเดอร์ ให้เลือก `little-trade`)
3. ตรวจค่าต่อไปนี้:

| รายการ | ค่า |
| --- | --- |
| Framework Preset | Vite |
| Node.js | 22.x |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

4. หน้าเว็บพร้อมใช้งานโดยไม่ต้องเพิ่ม Environment Variables เพิ่มการตั้งค่า Supabase ตามข้อ 4 ก่อนลงทะเบียนออนไลน์ กด **Deploy** แล้วเปิด URL ที่ Vercel ให้มา
5. การแก้ไขและ push/commit ลง branch ที่ Vercel เชื่อมไว้จะสร้าง deployment ใหม่โดยอัตโนมัติ

## 3. ย้ายเซฟจากเว็บเดิมไป Vercel

บัญชี Supabase ใช้ข้ามโดเมนได้ ส่วนบัญชีในเครื่องเดิมและเซฟในเครื่องผูกกับโดเมนและเบราว์เซอร์ เซฟจะไม่ย้ายไป URL ใหม่อัตโนมัติ และไม่ได้อยู่ในไฟล์ซอร์สเกม

1. บนเว็บเดิม เลือกตัวละคร → เมนูพักเกม → **เลือกตัวละคร / จัดการเซฟ → ดาวน์โหลดเซฟ** เก็บไฟล์ JSON ของแต่ละตัวละคร
2. บนเว็บ Vercel ลงทะเบียนบัญชีออนไลน์ (หรือเลือกบัญชีในเครื่อง) และสร้างตัวละครเริ่มต้นให้เข้าเกมได้
3. เปิดเมนูพักเกม → **เลือกตัวละคร / จัดการเซฟ → นำเข้าเซฟ** แล้วเลือกไฟล์ JSON เดิม จะเล่นต่อด้วยรูปลักษณ์และความก้าวหน้าเดิมได้
4. ใช้ URL หลัก Vercel เดิมในการเล่นต่อ เพราะ Preview URL และโดเมนอื่นเก็บบัญชี/เซฟในเครื่องแยกกัน

## 4. ตั้งค่า Supabase สำหรับ username + รหัสผ่าน

โปรเจกต์เดิมมี URL และ publishable key ใน src/backend.js แล้ว ตั้งค่าครั้งเดียวโดยเจ้าของ:

1. รัน `supabase/schema.sql` ใน SQL Editor; ถ้าติดตั้งตารางเซฟแล้ว ใช้ `supabase/username-auth.sql` เพื่อเพิ่มเฉพาะบัญชีได้
2. Authentication → Sign In / Providers → Email: เปิด Email provider และ **ปิด Confirm email** พร้อมเปิดรับสมัครผู้ใช้ใหม่
3. ตั้ง Site URL เป็นโดเมน Vercel หลัก และเพิ่ม URL ที่ใช้จริงใน Redirect URLs
4. ลงทะเบียนในหน้าแรกโดยเลือก **ออนไลน์ Supabase** ชื่อจะอยู่ใน Table Editor → `player_profiles` บัญชีและรหัสผ่านจัดการโดย Supabase Auth
5. หลังสร้างตัวละคร กดบันทึกออนไลน์จากเมนูรูปเมฆ ความก้าวหน้าจะอยู่ใน `trade_game_saves`

ระบบนี้ไม่ใช้อีเมลนักเรียน ใช้ alias แบบ hash ของ username ภายใน Auth จึงต้องปิดการยืนยันอีเมล และไม่มีกู้รหัสผ่านทางอีเมล บัญชีในเครื่องเดิมไม่ถูกแปลงอัตโนมัติ เลือกโหมดบัญชีในเครื่องเพื่อดาวน์โหลดเซฟแล้วนำเข้าบัญชีออนไลน์ใหม่ได้

หากเปลี่ยน Supabase project ให้เพิ่มค่าทั้งสองใน Vercel → Project Settings → Environment Variables แล้ว Redeploy:

- `VITE_SUPABASE_URL`: URL หลัก เช่น `https://YOUR_PROJECT.supabase.co` (ไม่ต่อ `/rest/v1/`)
- `VITE_SUPABASE_PUBLISHABLE_KEY`: publishable key หรือ anon key สำหรับ frontend

ตัวแปร `VITE_` จะถูกฝังใน JavaScript ที่ผู้เล่นดาวน์โหลด ใช้เฉพาะคีย์สาธารณะ; secret/service_role key ใช้กับ frontend ไม่ได้

## 5. รันและตรวจในเครื่อง

ติดตั้ง Node.js 22.x เปิด terminal ในโฟลเดอร์ที่มี package.json:

```sh
npm ci
npm run dev
```

ตรวจการ build สำหรับ production:

```sh
npm run build
```

รันชุดทดสอบด้วย `npm test` ได้ (esbuild สร้างโฟลเดอร์ work ชั่วคราวให้) การแก้ไฟล์ภาพหรือเพลงใน public จะรวมไปกับ build โดยอัตโนมัติ

ถ้า Vercel แจ้งหา package.json ไม่เจอ ให้ตรวจ Root Directory ถ้าตั้งค่า Supabase ใหม่แล้วเว็บยังใช้ค่าเดิม ให้ Redeploy เพราะค่า VITE_ ถูกอ่านตอน build
