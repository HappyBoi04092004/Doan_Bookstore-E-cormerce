Phần sửa data nên sử dụng phần index của phần FE kết nối với prisma của bên backend nên nếu có chuyển ở prisma phải chỉnh sửa table ở index để có thể kết nối 1 cách cụ thể hơn
npx prisma migrate reset --force; npx prisma generate; npx ts-node prisma/seedAddress.ts
