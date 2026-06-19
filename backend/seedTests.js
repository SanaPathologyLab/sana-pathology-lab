const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding tests...');

  // 1. Hematology
  const hematology = await prisma.testCategory.upsert({
    where: { name: 'Hematology' },
    update: {},
    create: { name: 'Hematology' },
  });

  const cbc = await prisma.test.upsert({
    where: { testCode: 'CBC-01' },
    update: {},
    create: {
      testName: 'Complete Blood Count (CBC)',
      testCode: 'CBC-01',
      sampleType: 'EDTA Blood',
      price: 350.0,
      categoryId: hematology.id,
      parameters: {
        create: [
          { parameterName: 'Hemoglobin (Hb)', referenceRange: '13.0 - 17.0', unit: 'g/dL', groupName: 'RBC Indices' },
          { parameterName: 'Total RBC Count', referenceRange: '4.5 - 5.5', unit: 'mill/cumm', groupName: 'RBC Indices' },
          { parameterName: 'Total WBC Count (TLC)', referenceRange: '4000 - 11000', unit: 'cells/cumm', groupName: 'WBC Indices' },
          { parameterName: 'Neutrophils', referenceRange: '40 - 70', unit: '%', groupName: 'Differential Count' },
          { parameterName: 'Lymphocytes', referenceRange: '20 - 40', unit: '%', groupName: 'Differential Count' },
          { parameterName: 'Eosinophils', referenceRange: '1 - 6', unit: '%', groupName: 'Differential Count' },
          { parameterName: 'Monocytes', referenceRange: '2 - 10', unit: '%', groupName: 'Differential Count' },
          { parameterName: 'Platelet Count', referenceRange: '1.5 - 4.5', unit: 'lakhs/cumm', groupName: 'Platelets' },
          { parameterName: 'Packed Cell Volume (PCV)', referenceRange: '40 - 50', unit: '%', groupName: 'RBC Indices' },
          { parameterName: 'Mean Corpuscular Vol (MCV)', referenceRange: '83 - 101', unit: 'fL', groupName: 'RBC Indices' },
        ]
      }
    }
  });

  // 2. Biochemistry
  const biochem = await prisma.testCategory.upsert({
    where: { name: 'Biochemistry' },
    update: {},
    create: { name: 'Biochemistry' },
  });

  const lipid = await prisma.test.upsert({
    where: { testCode: 'LIP-01' },
    update: {},
    create: {
      testName: 'Lipid Profile',
      testCode: 'LIP-01',
      sampleType: 'Serum',
      price: 600.0,
      categoryId: biochem.id,
      parameters: {
        create: [
          { parameterName: 'Total Cholesterol', referenceRange: '130 - 200', unit: 'mg/dL', groupName: 'Lipids' },
          { parameterName: 'Triglycerides', referenceRange: '50 - 150', unit: 'mg/dL', groupName: 'Lipids' },
          { parameterName: 'HDL Cholesterol', referenceRange: '40 - 60', unit: 'mg/dL', groupName: 'Lipids' },
          { parameterName: 'LDL Cholesterol', referenceRange: '< 100', unit: 'mg/dL', groupName: 'Lipids' },
          { parameterName: 'VLDL Cholesterol', referenceRange: '5 - 40', unit: 'mg/dL', groupName: 'Lipids' },
        ]
      }
    }
  });

  const lft = await prisma.test.upsert({
    where: { testCode: 'LFT-01' },
    update: {},
    create: {
      testName: 'Liver Function Test (LFT)',
      testCode: 'LFT-01',
      sampleType: 'Serum',
      price: 700.0,
      categoryId: biochem.id,
      parameters: {
        create: [
          { parameterName: 'Bilirubin Total', referenceRange: '0.2 - 1.2', unit: 'mg/dL', groupName: 'Bilirubin' },
          { parameterName: 'Bilirubin Direct', referenceRange: '0.0 - 0.3', unit: 'mg/dL', groupName: 'Bilirubin' },
          { parameterName: 'Bilirubin Indirect', referenceRange: '0.1 - 1.0', unit: 'mg/dL', groupName: 'Bilirubin' },
          { parameterName: 'SGOT (AST)', referenceRange: '5 - 40', unit: 'U/L', groupName: 'Enzymes' },
          { parameterName: 'SGPT (ALT)', referenceRange: '7 - 56', unit: 'U/L', groupName: 'Enzymes' },
          { parameterName: 'Alkaline Phosphatase (ALP)', referenceRange: '40 - 129', unit: 'U/L', groupName: 'Enzymes' },
          { parameterName: 'Total Protein', referenceRange: '6.4 - 8.3', unit: 'g/dL', groupName: 'Proteins' },
          { parameterName: 'Albumin', referenceRange: '3.5 - 5.0', unit: 'g/dL', groupName: 'Proteins' },
        ]
      }
    }
  });

  const kft = await prisma.test.upsert({
    where: { testCode: 'KFT-01' },
    update: {},
    create: {
      testName: 'Kidney Function Test (KFT)',
      testCode: 'KFT-01',
      sampleType: 'Serum',
      price: 650.0,
      categoryId: biochem.id,
      parameters: {
        create: [
          { parameterName: 'Blood Urea', referenceRange: '15 - 40', unit: 'mg/dL', groupName: 'Renal Parameters' },
          { parameterName: 'Serum Creatinine', referenceRange: '0.6 - 1.2', unit: 'mg/dL', groupName: 'Renal Parameters' },
          { parameterName: 'Uric Acid', referenceRange: '3.5 - 7.2', unit: 'mg/dL', groupName: 'Renal Parameters' },
          { parameterName: 'Sodium (Na+)', referenceRange: '135 - 145', unit: 'mEq/L', groupName: 'Electrolytes' },
          { parameterName: 'Potassium (K+)', referenceRange: '3.5 - 5.1', unit: 'mEq/L', groupName: 'Electrolytes' },
          { parameterName: 'Chloride (Cl-)', referenceRange: '98 - 107', unit: 'mEq/L', groupName: 'Electrolytes' },
        ]
      }
    }
  });

  const fbs = await prisma.test.upsert({
    where: { testCode: 'GLU-01' },
    update: {},
    create: {
      testName: 'Fasting Blood Sugar (FBS)',
      testCode: 'GLU-01',
      sampleType: 'Fluoride Plasma',
      price: 100.0,
      categoryId: biochem.id,
      parameters: {
        create: [
          { parameterName: 'Fasting Blood Sugar', referenceRange: '70 - 100', unit: 'mg/dL', groupName: 'Glucose' },
        ]
      }
    }
  });

  // 3. Endocrinology
  const endo = await prisma.testCategory.upsert({
    where: { name: 'Endocrinology' },
    update: {},
    create: { name: 'Endocrinology' },
  });

  const thyroid = await prisma.test.upsert({
    where: { testCode: 'TFT-01' },
    update: {},
    create: {
      testName: 'Thyroid Profile (T3, T4, TSH)',
      testCode: 'TFT-01',
      sampleType: 'Serum',
      price: 500.0,
      categoryId: endo.id,
      parameters: {
        create: [
          { parameterName: 'Total T3', referenceRange: '0.8 - 2.0', unit: 'ng/mL', groupName: 'Thyroid' },
          { parameterName: 'Total T4', referenceRange: '5.1 - 14.1', unit: 'ug/dL', groupName: 'Thyroid' },
          { parameterName: 'TSH', referenceRange: '0.27 - 4.20', unit: 'uIU/mL', groupName: 'Thyroid' },
        ]
      }
    }
  });

  // 4. Clinical Pathology
  const clinPath = await prisma.testCategory.upsert({
    where: { name: 'Clinical Pathology' },
    update: {},
    create: { name: 'Clinical Pathology' },
  });

  const urine = await prisma.test.upsert({
    where: { testCode: 'UR-01' },
    update: {},
    create: {
      testName: 'Urine Routine Examination',
      testCode: 'UR-01',
      sampleType: 'Urine',
      price: 150.0,
      categoryId: clinPath.id,
      parameters: {
        create: [
          { parameterName: 'Quantity', referenceRange: '-', unit: 'mL', groupName: 'Physical Examination' },
          { parameterName: 'Color', referenceRange: 'Pale Yellow', unit: '-', groupName: 'Physical Examination' },
          { parameterName: 'Appearance', referenceRange: 'Clear', unit: '-', groupName: 'Physical Examination' },
          { parameterName: 'pH', referenceRange: '4.5 - 8.0', unit: '-', groupName: 'Chemical Examination' },
          { parameterName: 'Specific Gravity', referenceRange: '1.005 - 1.030', unit: '-', groupName: 'Chemical Examination' },
          { parameterName: 'Proteins', referenceRange: 'Absent', unit: '-', groupName: 'Chemical Examination' },
          { parameterName: 'Glucose', referenceRange: 'Absent', unit: '-', groupName: 'Chemical Examination' },
          { parameterName: 'Pus Cells', referenceRange: '0 - 5', unit: '/hpf', groupName: 'Microscopic Examination' },
          { parameterName: 'Epithelial Cells', referenceRange: '0 - 5', unit: '/hpf', groupName: 'Microscopic Examination' },
          { parameterName: 'RBC', referenceRange: 'Absent', unit: '/hpf', groupName: 'Microscopic Examination' },
        ]
      }
    }
  });

  console.log('Successfully seeded tests with standard reference ranges!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
