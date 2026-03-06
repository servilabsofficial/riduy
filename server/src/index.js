require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const prescriptionRoutes = require('./routes/prescriptions');
const productRoutes = require('./routes/products');
const saleRoutes = require('./routes/sales');
const orderRoutes = require('./routes/orders');
const appointmentRoutes = require('./routes/appointments');
const supplierRoutes = require('./routes/suppliers');
const dashboardRoutes = require('./routes/dashboard');
const employeeRoutes = require('./routes/employees');
const commissionRoutes = require('./routes/commissions');
const expenseRoutes = require('./routes/expenses');
const cashRegisterRoutes = require('./routes/cash-register');
const purchaseOrderRoutes = require('./routes/purchase-orders');
const notificationRoutes = require('./routes/notifications');
const auditLogRoutes = require('./routes/audit-logs');
const branchRoutes = require('./routes/branches');
const medicalRecordRoutes = require('./routes/medical-records');
const searchRoutes = require('./routes/search');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Existing routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/dashboard', dashboardRoutes);

// New enterprise routes
app.use('/api/employees', employeeRoutes);
app.use('/api/commissions', commissionRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/cash-register', cashRegisterRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/search', searchRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
