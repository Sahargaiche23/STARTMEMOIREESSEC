const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../../data/startuplab.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    role TEXT DEFAULT 'user',
    subscription TEXT DEFAULT 'free',
    googleId TEXT UNIQUE,
    faceDescriptor TEXT,
    avatarUrl TEXT,
    authProvider TEXT DEFAULT 'local',
    isActive INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Projects table
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    industry TEXT,
    stage TEXT DEFAULT 'idea',
    status TEXT DEFAULT 'active',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Ideas table
  CREATE TABLE IF NOT EXISTS ideas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    projectId INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    problem TEXT,
    solution TEXT,
    targetMarket TEXT,
    industry TEXT,
    score INTEGER DEFAULT 0,
    isFavorite INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE SET NULL
  );

  -- Business Models table
  CREATE TABLE IF NOT EXISTS business_models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    projectId INTEGER NOT NULL,
    keyPartners TEXT,
    keyActivities TEXT,
    keyResources TEXT,
    valuePropositions TEXT,
    customerRelationships TEXT,
    channels TEXT,
    customerSegments TEXT,
    costStructure TEXT,
    revenueStreams TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
  );

  -- Branding table
  CREATE TABLE IF NOT EXISTS branding (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    projectId INTEGER NOT NULL,
    companyName TEXT,
    slogan TEXT,
    logoUrl TEXT,
    primaryColor TEXT,
    secondaryColor TEXT,
    fontFamily TEXT,
    brandVoice TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
  );

  -- Business Plans table
  CREATE TABLE IF NOT EXISTS business_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    projectId INTEGER NOT NULL,
    executiveSummary TEXT,
    companyDescription TEXT,
    marketAnalysis TEXT,
    organization TEXT,
    productLine TEXT,
    marketing TEXT,
    fundingRequest TEXT,
    financialProjections TEXT,
    appendix TEXT,
    pdfUrl TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
  );

  -- Pitch Decks table
  CREATE TABLE IF NOT EXISTS pitch_decks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    projectId INTEGER NOT NULL,
    slides TEXT,
    template TEXT DEFAULT 'modern',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
  );

  -- Tasks table (Project Management)
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    projectId INTEGER NOT NULL,
    assignedTo INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo',
    priority TEXT DEFAULT 'medium',
    dueDate DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assignedTo) REFERENCES users(id) ON DELETE SET NULL
  );

  -- Team Members table
  CREATE TABLE IF NOT EXISTS team_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    projectId INTEGER NOT NULL,
    userId INTEGER,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    status TEXT DEFAULT 'pending',
    inviteToken TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
  );

  -- Payments table
  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'TND',
    method TEXT,
    status TEXT DEFAULT 'pending',
    subscriptionType TEXT,
    transactionId TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Subscriptions table
  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL UNIQUE,
    plan TEXT DEFAULT 'free',
    startDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    endDate DATETIME,
    isActive INTEGER DEFAULT 1,
    paymentStatus TEXT DEFAULT 'pending',
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Notifications table
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    isRead INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Product categories table
  CREATE TABLE IF NOT EXISTS product_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT DEFAULT '#3B82F6',
    sortOrder INTEGER DEFAULT 0,
    isActive INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Products/Solutions table
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoryId INTEGER NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    features TEXT,
    price REAL DEFAULT 0,
    priceType TEXT DEFAULT 'monthly',
    icon TEXT,
    isPopular INTEGER DEFAULT 0,
    isNew INTEGER DEFAULT 0,
    requiredPlan TEXT DEFAULT 'enterprise',
    isActive INTEGER DEFAULT 1,
    sortOrder INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoryId) REFERENCES product_categories(id) ON DELETE CASCADE
  );

  -- User activated products
  CREATE TABLE IF NOT EXISTS user_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    productId INTEGER NOT NULL,
    projectId INTEGER,
    status TEXT DEFAULT 'pending',
    duration INTEGER DEFAULT 1,
    durationUnit TEXT DEFAULT 'month',
    price REAL DEFAULT 0,
    requestedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    approvedAt DATETIME,
    approvedBy INTEGER,
    activatedAt DATETIME,
    expiresAt DATETIME,
    renewalReminder INTEGER DEFAULT 0,
    adminNote TEXT,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE SET NULL,
    FOREIGN KEY (approvedBy) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(userId, productId, projectId)
  );

  -- Accounting transactions table
  CREATE TABLE IF NOT EXISTS accounting_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    projectId INTEGER,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    amount REAL NOT NULL,
    date DATE NOT NULL,
    paymentMethod TEXT,
    reference TEXT,
    notes TEXT,
    isRecurring INTEGER DEFAULT 0,
    recurringFrequency TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE SET NULL
  );

  -- Accounting categories table
  CREATE TABLE IF NOT EXISTS accounting_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    isDefault INTEGER DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Invoices table
  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    projectId INTEGER,
    invoiceNumber TEXT NOT NULL,
    clientName TEXT NOT NULL,
    clientEmail TEXT,
    clientAddress TEXT,
    items TEXT,
    subtotal REAL NOT NULL,
    taxRate REAL DEFAULT 19,
    taxAmount REAL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'draft',
    dueDate DATE,
    paidAt DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE SET NULL
  );

  -- VAT declarations table
  CREATE TABLE IF NOT EXISTS vat_declarations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    projectId INTEGER,
    period TEXT NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER,
    quarter INTEGER,
    salesAmount REAL DEFAULT 0,
    purchasesAmount REAL DEFAULT 0,
    vatCollected REAL DEFAULT 0,
    vatDeductible REAL DEFAULT 0,
    vatDue REAL DEFAULT 0,
    status TEXT DEFAULT 'draft',
    submittedAt DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE SET NULL
  );

  -- Accountant shares table
  CREATE TABLE IF NOT EXISTS accountant_shares (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    accountantEmail TEXT NOT NULL,
    accountantName TEXT,
    accessToken TEXT UNIQUE NOT NULL,
    startDate TEXT,
    endDate TEXT,
    expiresAt DATETIME NOT NULL,
    viewedAt DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  -- ============ HR & PAYROLL TABLES ============

  -- Employees table
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    cin TEXT,
    cnssNumber TEXT,
    address TEXT,
    birthDate DATE,
    hireDate DATE NOT NULL,
    endDate DATE,
    position TEXT NOT NULL,
    department TEXT,
    contractType TEXT DEFAULT 'CDI',
    workSchedule TEXT DEFAULT 'full_time',
    baseSalary REAL NOT NULL,
    transportAllowance REAL DEFAULT 0,
    mealAllowance REAL DEFAULT 0,
    otherAllowances REAL DEFAULT 0,
    bankName TEXT,
    bankAccount TEXT,
    status TEXT DEFAULT 'active',
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Employee documents table
  CREATE TABLE IF NOT EXISTS employee_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    documentType TEXT NOT NULL,
    documentName TEXT NOT NULL,
    filePath TEXT,
    fileData TEXT,
    uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    expiresAt DATE,
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Payslips table
  CREATE TABLE IF NOT EXISTS payslips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    employeeId INTEGER NOT NULL,
    period TEXT NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    baseSalary REAL NOT NULL,
    transportAllowance REAL DEFAULT 0,
    mealAllowance REAL DEFAULT 0,
    otherAllowances REAL DEFAULT 0,
    overtimeHours REAL DEFAULT 0,
    overtimeAmount REAL DEFAULT 0,
    bonus REAL DEFAULT 0,
    grossSalary REAL NOT NULL,
    cnssEmployee REAL NOT NULL,
    cnssEmployer REAL NOT NULL,
    irpp REAL NOT NULL,
    otherDeductions REAL DEFAULT 0,
    netSalary REAL NOT NULL,
    status TEXT DEFAULT 'draft',
    paidAt DATETIME,
    generatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
  );

  -- CNSS declarations table
  CREATE TABLE IF NOT EXISTS cnss_declarations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    quarter INTEGER NOT NULL,
    year INTEGER NOT NULL,
    totalEmployees INTEGER NOT NULL,
    totalGrossSalary REAL NOT NULL,
    totalDaysWorked INTEGER DEFAULT 0,
    cnssEmployeeTotal REAL NOT NULL,
    cnssEmployerTotal REAL NOT NULL,
    totalContributions REAL NOT NULL,
    status TEXT DEFAULT 'draft',
    submittedAt DATETIME,
    dueDate DATE,
    paidAt DATETIME,
    referenceNumber TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Leave requests table
  CREATE TABLE IF NOT EXISTS leave_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    employeeId INTEGER NOT NULL,
    leaveType TEXT NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    totalDays INTEGER NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    approvedBy INTEGER,
    approvedAt DATETIME,
    rejectionReason TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
  );

  -- Leave balances table
  CREATE TABLE IF NOT EXISTS leave_balances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    employeeId INTEGER NOT NULL,
    year INTEGER NOT NULL,
    annualLeave INTEGER DEFAULT 24,
    usedAnnualLeave INTEGER DEFAULT 0,
    sickLeave INTEGER DEFAULT 15,
    usedSickLeave INTEGER DEFAULT 0,
    maternityLeave INTEGER DEFAULT 60,
    usedMaternityLeave INTEGER DEFAULT 0,
    unpaidLeave INTEGER DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE(employeeId, year)
  );

  -- Contracts table
  CREATE TABLE IF NOT EXISTS contracts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    employeeId INTEGER NOT NULL,
    contractType TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    startDate DATE NOT NULL,
    endDate DATE,
    salary REAL NOT NULL,
    position TEXT NOT NULL,
    status TEXT DEFAULT 'draft',
    employerSignedAt DATETIME,
    employeeSignedAt DATETIME,
    employerSignature TEXT,
    employeeSignature TEXT,
    signatureHash TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
  );
`);

console.log('✅ Database initialized successfully');

module.exports = db;
