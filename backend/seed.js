const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");
  
  // 1. Create Categories
  const hematology = await prisma.testCategory.upsert({
    where: { name: 'Hematology' },
    update: {},
    create: { name: 'Hematology' }
  });
  
  const biochemistry = await prisma.testCategory.upsert({
    where: { name: 'Biochemistry' },
    update: {},
    create: { name: 'Biochemistry' }
  });
  
  const immunology = await prisma.testCategory.upsert({
    where: { name: 'Immunology' },
    update: {},
    create: { name: 'Immunology' }
  });

  // 2. Create Tests
  // C.B.C.
  await prisma.test.upsert({
    where: { testCode: 'CBC' },
    update: {},
    create: {
      testName: '(C.B.C.) COMPLETE BLOOD COUNT',
      testCode: 'CBC',
      sampleType: 'BLOOD',
      price: 300,
      categoryId: hematology.id,
      parameters: {
        create: [
          { parameterName: 'HAEMOGLOBIN', referenceRange: 'M: 12-16, F: 11-14', unit: 'GM%', groupName: 'HEMATOLOGICAL EXAMINATION' },
          { parameterName: 'TOTAL LEUCOCYTES COUNT', referenceRange: '4000-11000', unit: '/CU MM', groupName: 'HEMATOLOGICAL EXAMINATION' },
          { parameterName: 'NEUTROPHILS', referenceRange: '40-75', unit: '%', groupName: 'DIFFERENTIAL LEUCOCYTES COUNT' },
          { parameterName: 'LYMPHOCYTES', referenceRange: '20-45', unit: '%', groupName: 'DIFFERENTIAL LEUCOCYTES COUNT' },
          { parameterName: 'EOSINOPHILS', referenceRange: '01-06', unit: '%', groupName: 'DIFFERENTIAL LEUCOCYTES COUNT' },
          { parameterName: 'MONOCYTES', referenceRange: '01-10', unit: '%', groupName: 'DIFFERENTIAL LEUCOCYTES COUNT' },
          { parameterName: 'BASOPHILS', referenceRange: '00-01', unit: '%', groupName: 'DIFFERENTIAL LEUCOCYTES COUNT' },
          { parameterName: 'PLATELET COUNT', referenceRange: '1.5-4.5', unit: 'Lacs/cumm', groupName: 'HEMATOLOGICAL EXAMINATION' },
          { parameterName: 'R.B.C. COUNT', referenceRange: '3.8-5.8', unit: 'Mill/cumm', groupName: 'HEMATOLOGICAL EXAMINATION' },
          { parameterName: 'P.C.V.', referenceRange: '36-46', unit: '%', groupName: 'HEMATOLOGICAL EXAMINATION' },
          { parameterName: 'M.C.V.', referenceRange: '80-100', unit: 'fl', groupName: 'HEMATOLOGICAL EXAMINATION' },
          { parameterName: 'M.C.H.', referenceRange: '27-32', unit: 'pg', groupName: 'HEMATOLOGICAL EXAMINATION' },
          { parameterName: 'M.C.H.C.', referenceRange: '32-36', unit: 'g/dL', groupName: 'HEMATOLOGICAL EXAMINATION' }
        ]
      }
    }
  });

  // LFT
  await prisma.test.upsert({
    where: { testCode: 'LFT' },
    update: {},
    create: {
      testName: 'LIVER FUNCTION TEST (LFT)',
      testCode: 'LFT',
      sampleType: 'SERUM',
      price: 600,
      categoryId: biochemistry.id,
      parameters: {
        create: [
          { parameterName: 'TOTAL BILIRUBIN', referenceRange: '0.2-1.2', unit: 'mg/dL', groupName: 'BILIRUBIN' },
          { parameterName: 'DIRECT BILIRUBIN', referenceRange: '0.0-0.3', unit: 'mg/dL', groupName: 'BILIRUBIN' },
          { parameterName: 'INDIRECT BILIRUBIN', referenceRange: '0.2-0.9', unit: 'mg/dL', groupName: 'BILIRUBIN' },
          { parameterName: 'SGOT (AST)', referenceRange: '5-40', unit: 'U/L', groupName: 'ENZYMES' },
          { parameterName: 'SGPT (ALT)', referenceRange: '5-41', unit: 'U/L', groupName: 'ENZYMES' },
          { parameterName: 'ALKALINE PHOSPHATASE', referenceRange: '40-129', unit: 'U/L', groupName: 'ENZYMES' },
          { parameterName: 'TOTAL PROTEIN', referenceRange: '6.4-8.3', unit: 'g/dL', groupName: 'PROTEINS' },
          { parameterName: 'ALBUMIN', referenceRange: '3.5-5.2', unit: 'g/dL', groupName: 'PROTEINS' },
          { parameterName: 'GLOBULIN', referenceRange: '2.5-3.4', unit: 'g/dL', groupName: 'PROTEINS' },
          { parameterName: 'A/G RATIO', referenceRange: '1.1-2.2', unit: 'Ratio', groupName: 'PROTEINS' }
        ]
      }
    }
  });

  // KFT
  await prisma.test.upsert({
    where: { testCode: 'KFT' },
    update: {},
    create: {
      testName: 'KIDNEY FUNCTION TEST (KFT)',
      testCode: 'KFT',
      sampleType: 'SERUM',
      price: 500,
      categoryId: biochemistry.id,
      parameters: {
        create: [
          { parameterName: 'BLOOD UREA', referenceRange: '15-45', unit: 'mg/dL', groupName: 'KIDNEY FUNCTION TEST' },
          { parameterName: 'SERUM CREATININE', referenceRange: '0.6-1.2', unit: 'mg/dL', groupName: 'KIDNEY FUNCTION TEST' },
          { parameterName: 'URIC ACID', referenceRange: '3.5-7.2', unit: 'mg/dL', groupName: 'KIDNEY FUNCTION TEST' },
          { parameterName: 'SERUM CALCIUM', referenceRange: '8.5-10.5', unit: 'mg/dL', groupName: 'ELECTROLYTES' },
          { parameterName: 'SERUM SODIUM', referenceRange: '135-145', unit: 'mEq/L', groupName: 'ELECTROLYTES' },
          { parameterName: 'SERUM POTASSIUM', referenceRange: '3.5-5.0', unit: 'mEq/L', groupName: 'ELECTROLYTES' },
          { parameterName: 'SERUM CHLORIDE', referenceRange: '98-107', unit: 'mEq/L', groupName: 'ELECTROLYTES' }
        ]
      }
    }
  });

  // LIPID
  await prisma.test.upsert({
    where: { testCode: 'LIPID' },
    update: {},
    create: {
      testName: 'LIPID PROFILE',
      testCode: 'LIPID',
      sampleType: 'SERUM',
      price: 600,
      categoryId: biochemistry.id,
      parameters: {
        create: [
          { parameterName: 'TOTAL CHOLESTEROL', referenceRange: '< 200', unit: 'mg/dL', groupName: 'LIPID PROFILE' },
          { parameterName: 'TRIGLYCERIDES', referenceRange: '< 150', unit: 'mg/dL', groupName: 'LIPID PROFILE' },
          { parameterName: 'HDL CHOLESTEROL', referenceRange: '40-60', unit: 'mg/dL', groupName: 'LIPID PROFILE' },
          { parameterName: 'LDL CHOLESTEROL', referenceRange: '< 100', unit: 'mg/dL', groupName: 'LIPID PROFILE' },
          { parameterName: 'VLDL CHOLESTEROL', referenceRange: '5-40', unit: 'mg/dL', groupName: 'LIPID PROFILE' },
          { parameterName: 'TOTAL CHOL / HDL RATIO', referenceRange: '3.3-4.4', unit: 'Ratio', groupName: 'LIPID PROFILE' }
        ]
      }
    }
  });
  
  // THYROID
  await prisma.test.upsert({
    where: { testCode: 'TFT' },
    update: {},
    create: {
      testName: 'THYROID FUNCTION TEST (T3, T4, TSH)',
      testCode: 'TFT',
      sampleType: 'SERUM',
      price: 450,
      categoryId: immunology.id,
      parameters: {
        create: [
          { parameterName: 'TOTAL TRIIODOTHYRONINE (T3)', referenceRange: '0.58-1.59', unit: 'ng/mL', groupName: 'THYROID PROFILE' },
          { parameterName: 'TOTAL THYROXINE (T4)', referenceRange: '4.87-11.72', unit: 'ug/dL', groupName: 'THYROID PROFILE' },
          { parameterName: 'THYROID STIMULATING HORMONE (TSH)', referenceRange: '0.35-4.94', unit: 'uIU/mL', groupName: 'THYROID PROFILE' }
        ]
      }
    }
  });
  
  // WIDAL
  await prisma.test.upsert({
    where: { testCode: 'WIDAL' },
    update: {},
    create: {
      testName: 'WIDAL TEST',
      testCode: 'WIDAL',
      sampleType: 'SERUM',
      price: 150,
      categoryId: immunology.id,
      parameters: {
        create: [
          { parameterName: 'SALMONELLA TYPHI "O"', referenceRange: '< 1:80', unit: 'Titre', groupName: 'WIDAL TEST' },
          { parameterName: 'SALMONELLA TYPHI "H"', referenceRange: '< 1:80', unit: 'Titre', groupName: 'WIDAL TEST' },
          { parameterName: 'SALMONELLA PARATYPHI "AH"', referenceRange: '< 1:80', unit: 'Titre', groupName: 'WIDAL TEST' },
          { parameterName: 'SALMONELLA PARATYPHI "BH"', referenceRange: '< 1:80', unit: 'Titre', groupName: 'WIDAL TEST' }
        ]
      }
    }
  });

  // HBA1C
  await prisma.test.upsert({
    where: { testCode: 'HBA1C' },
    update: {},
    create: {
      testName: 'HbA1c (GLYCOSYLATED HAEMOGLOBIN)',
      testCode: 'HBA1C',
      sampleType: 'EDTA BLOOD',
      price: 400,
      categoryId: biochemistry.id,
      parameters: {
        create: [
          { parameterName: 'HbA1c', referenceRange: '4.5-6.3', unit: '%', groupName: 'DIABETIC SCREEN' },
          { parameterName: 'ESTIMATED AVERAGE GLUCOSE (eAG)', referenceRange: '90-120', unit: 'mg/dL', groupName: 'DIABETIC SCREEN' }
        ]
      }
    }
  });

  console.log("Database seeded successfully with test data!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
