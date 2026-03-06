const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.order.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.product.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const sellerPassword = await bcrypt.hash('seller123', 10);
  const optPassword = await bcrypt.hash('doctor123', 10);

  const admin = await prisma.user.create({
    data: { email: 'admin@optica.com', password: adminPassword, name: 'Admin Principal', role: 'ADMIN' },
  });
  const seller = await prisma.user.create({
    data: { email: 'vendedor@optica.com', password: sellerPassword, name: 'María García', role: 'SELLER' },
  });
  const optometrist = await prisma.user.create({
    data: { email: 'doctor@optica.com', password: optPassword, name: 'Dr. Carlos López', role: 'OPTOMETRIST' },
  });

  // Create suppliers
  const suppliers = await Promise.all([
    prisma.supplier.create({ data: { name: 'Essilor', contact: 'Juan Pérez', phone: '+52 55 1234 5678', email: 'ventas@essilor.mx' } }),
    prisma.supplier.create({ data: { name: 'Luxottica', contact: 'Ana Ruiz', phone: '+52 55 8765 4321', email: 'pedidos@luxottica.mx' } }),
    prisma.supplier.create({ data: { name: 'Hoya Vision', contact: 'Pedro Martín', phone: '+52 55 2468 1357', email: 'ventas@hoya.mx' } }),
    prisma.supplier.create({ data: { name: 'Carl Zeiss', contact: 'Laura Sánchez', phone: '+52 55 1357 2468', email: 'info@zeiss.mx' } }),
  ]);

  // Create products
  const products = await Promise.all([
    prisma.product.create({ data: { name: 'Ray-Ban Aviator Classic', brand: 'Ray-Ban', type: 'FRAME', price: 3200, cost: 1800, stock: 15, minStock: 3, supplierId: suppliers[1].id } }),
    prisma.product.create({ data: { name: 'Oakley Holbrook', brand: 'Oakley', type: 'FRAME', price: 2800, cost: 1500, stock: 8, minStock: 3, supplierId: suppliers[1].id } }),
    prisma.product.create({ data: { name: 'Prada VPR 17M', brand: 'Prada', type: 'FRAME', price: 5200, cost: 2900, stock: 5, minStock: 2, supplierId: suppliers[1].id } }),
    prisma.product.create({ data: { name: 'Tom Ford FT5401', brand: 'Tom Ford', type: 'FRAME', price: 4800, cost: 2700, stock: 3, minStock: 2, supplierId: suppliers[1].id } }),
    prisma.product.create({ data: { name: 'Lente Progresivo Varilux', brand: 'Essilor', type: 'LENS', price: 4500, cost: 2200, stock: 20, minStock: 5, supplierId: suppliers[0].id } }),
    prisma.product.create({ data: { name: 'Lente Monofocal CR-39', brand: 'Essilor', type: 'LENS', price: 800, cost: 350, stock: 50, minStock: 10, supplierId: suppliers[0].id } }),
    prisma.product.create({ data: { name: 'Lente Bifocal FT-28', brand: 'Hoya', type: 'LENS', price: 1800, cost: 800, stock: 2, minStock: 5, supplierId: suppliers[2].id } }),
    prisma.product.create({ data: { name: 'Acuvue Oasys (caja 6)', brand: 'Johnson & Johnson', type: 'CONTACT_LENS', price: 850, cost: 500, stock: 30, minStock: 8, supplierId: suppliers[0].id } }),
    prisma.product.create({ data: { name: 'Air Optix Plus (caja 6)', brand: 'Alcon', type: 'CONTACT_LENS', price: 780, cost: 450, stock: 25, minStock: 8, supplierId: suppliers[0].id } }),
    prisma.product.create({ data: { name: 'Estuche Premium', brand: 'Generic', type: 'ACCESSORY', price: 250, cost: 80, stock: 40, minStock: 10 } }),
    prisma.product.create({ data: { name: 'Kit de Limpieza Lentes', brand: 'Zeiss', type: 'ACCESSORY', price: 180, cost: 60, stock: 35, minStock: 10, supplierId: suppliers[3].id } }),
    prisma.product.create({ data: { name: 'Cordón para Lentes', brand: 'Generic', type: 'ACCESSORY', price: 120, cost: 30, stock: 50, minStock: 15 } }),
  ]);

  // Create patients
  const patients = await Promise.all([
    prisma.patient.create({ data: { firstName: 'Roberto', lastName: 'Hernández', phone: '+52 55 1111 2222', email: 'roberto@email.com', address: 'Av. Reforma 123, CDMX', birthDate: new Date('1985-03-15'), notes: 'Paciente frecuente' } }),
    prisma.patient.create({ data: { firstName: 'Ana', lastName: 'Martínez', phone: '+52 55 3333 4444', email: 'ana.mtz@email.com', address: 'Col. Roma Sur 456, CDMX', birthDate: new Date('1990-07-22') } }),
    prisma.patient.create({ data: { firstName: 'Carlos', lastName: 'Ruiz', phone: '+52 55 5555 6666', email: 'cruiz@email.com', address: 'Polanco 789, CDMX', birthDate: new Date('1978-11-08'), notes: 'Alergia a silicón' } }),
    prisma.patient.create({ data: { firstName: 'Sofía', lastName: 'López', phone: '+52 55 7777 8888', email: 'sofia.lopez@email.com', address: 'Coyoacán 321, CDMX', birthDate: new Date('1995-01-30') } }),
    prisma.patient.create({ data: { firstName: 'Miguel', lastName: 'Torres', phone: '+52 55 9999 0000', email: 'mtorres@email.com', address: 'Condesa 654, CDMX', birthDate: new Date('1982-09-12') } }),
    prisma.patient.create({ data: { firstName: 'Laura', lastName: 'Sánchez', phone: '+52 55 1234 0000', email: 'laura.s@email.com', address: 'Santa Fe 987, CDMX', birthDate: new Date('1988-05-20') } }),
    prisma.patient.create({ data: { firstName: 'Diego', lastName: 'Flores', phone: '+52 55 4321 0000', email: 'dflores@email.com', address: 'Del Valle 147, CDMX', birthDate: new Date('2000-12-05') } }),
    prisma.patient.create({ data: { firstName: 'Carmen', lastName: 'Vargas', phone: '+52 55 5678 0000', email: 'carmen.v@email.com', address: 'Narvarte 258, CDMX', birthDate: new Date('1975-08-17') } }),
  ]);

  // Create prescriptions
  const prescriptions = await Promise.all([
    prisma.prescription.create({ data: { patientId: patients[0].id, odSph: -2.50, odCyl: -0.75, odAxis: 180, oiSph: -2.25, oiCyl: -0.50, oiAxis: 175, pupillaryDist: 64, lensType: 'Progresivo', professional: 'Dr. Carlos López', observations: 'Usar lentes anti-reflejo' } }),
    prisma.prescription.create({ data: { patientId: patients[1].id, odSph: -1.00, odCyl: -0.25, odAxis: 90, oiSph: -1.25, oiCyl: -0.50, oiAxis: 85, pupillaryDist: 62, lensType: 'Monofocal', professional: 'Dr. Carlos López' } }),
    prisma.prescription.create({ data: { patientId: patients[2].id, odSph: +1.50, odCyl: -0.75, odAxis: 45, oiSph: +1.75, oiCyl: -1.00, oiAxis: 135, pupillaryDist: 66, lensType: 'Bifocal', professional: 'Dr. Carlos López', observations: 'Hipermetropía con astigmatismo' } }),
    prisma.prescription.create({ data: { patientId: patients[3].id, odSph: -3.00, odCyl: 0, odAxis: 0, oiSph: -3.25, oiCyl: 0, oiAxis: 0, pupillaryDist: 60, lensType: 'Lentes de contacto', professional: 'Dr. Carlos López', observations: 'Recomienda Acuvue Oasys' } }),
    prisma.prescription.create({ data: { patientId: patients[4].id, odSph: -0.50, odCyl: -1.25, odAxis: 170, oiSph: -0.75, oiCyl: -1.00, oiAxis: 10, pupillaryDist: 65, lensType: 'Monofocal', professional: 'Dr. Carlos López' } }),
  ]);

  // Create sales
  const sales = [];
  const daysAgo = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  };

  for (let i = 0; i < 15; i++) {
    const patient = patients[i % patients.length];
    const product1 = products[i % 4]; // frames
    const product2 = products[4 + (i % 3)]; // lenses
    const items = [
      { productId: product1.id, quantity: 1, price: product1.price, subtotal: product1.price },
      { productId: product2.id, quantity: 1, price: product2.price, subtotal: product2.price },
    ];
    const subtotal = items.reduce((s, it) => s + it.subtotal, 0);
    const discount = i % 3 === 0 ? subtotal * 0.1 : 0;
    const total = subtotal - discount;
    const methods = ['CASH', 'CARD', 'TRANSFER'];

    const sale = await prisma.sale.create({
      data: {
        patientId: patient.id,
        userId: i % 2 === 0 ? seller.id : admin.id,
        subtotal,
        discount,
        total,
        paymentMethod: methods[i % 3],
        createdAt: daysAgo(i * 2),
        items: { create: items },
      },
    });
    sales.push(sale);
  }

  // Create orders
  const orderStatuses = ['PENDING', 'IN_PROGRESS', 'READY', 'DELIVERED'];
  for (let i = 0; i < 8; i++) {
    await prisma.order.create({
      data: {
        patientId: patients[i % patients.length].id,
        prescriptionId: i < 5 ? prescriptions[i].id : null,
        productId: products[4 + (i % 3)].id,
        userId: optometrist.id,
        status: orderStatuses[i % 4],
        notes: i % 2 === 0 ? 'Urgente' : null,
        estimatedDate: daysAgo(-3 - i),
        createdAt: daysAgo(i + 1),
      },
    });
  }

  // Create appointments
  for (let i = 0; i < 10; i++) {
    const types = ['Examen visual', 'Consulta', 'Control', 'Ajuste de lentes'];
    const times = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
    const statuses = ['SCHEDULED', 'COMPLETED', 'CANCELLED'];
    await prisma.appointment.create({
      data: {
        patientId: patients[i % patients.length].id,
        userId: optometrist.id,
        date: daysAgo(-i),
        time: times[i % times.length],
        type: types[i % types.length],
        status: i < 5 ? 'SCHEDULED' : statuses[i % 3],
        notes: i % 3 === 0 ? 'Paciente requiere dilatación' : null,
      },
    });
  }

  console.log('Seed completed successfully!');
  console.log('Users created:');
  console.log('  Admin: admin@optica.com / admin123');
  console.log('  Seller: vendedor@optica.com / seller123');
  console.log('  Optometrist: doctor@optica.com / doctor123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
