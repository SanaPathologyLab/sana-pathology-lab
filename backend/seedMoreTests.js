const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding more standalone tests...');

  // Get categories (assuming they were created by the previous script)
  const biochem = await prisma.testCategory.findUnique({ where: { name: 'Biochemistry' } });
  const hematology = await prisma.testCategory.findUnique({ where: { name: 'Hematology' } });
  
  // Also create Serology category
  const serology = await prisma.testCategory.upsert({
    where: { name: 'Serology' },
    update: {},
    create: { name: 'Serology' },
  });

  // 1. SGPT (Standalone)
  await prisma.test.upsert({
    where: { testCode: 'SGPT-01' },
    update: {},
    create: {
      testName: 'SGPT (ALT)',
      testCode: 'SGPT-01',
      sampleType: 'Serum',
      price: 150.0,
      categoryId: biochem.id,
      parameters: {
        create: [
          { parameterName: 'SGPT (ALT)', referenceRange: '7 - 56', unit: 'U/L', groupName: 'Enzymes' },
        ]
      }
    }
  });

  // 2. SGOT (Standalone)
  await prisma.test.upsert({
    where: { testCode: 'SGOT-01' },
    update: {},
    create: {
      testName: 'SGOT (AST)',
      testCode: 'SGOT-01',
      sampleType: 'Serum',
      price: 150.0,
      categoryId: biochem.id,
      parameters: {
        create: [
          { parameterName: 'SGOT (AST)', referenceRange: '5 - 40', unit: 'U/L', groupName: 'Enzymes' },
        ]
      }
    }
  });

  // 3. Prothrombin Time (PT)
  await prisma.test.upsert({
    where: { testCode: 'PT-01' },
    update: {},
    create: {
      testName: 'Prothrombin Time (PT)',
      testCode: 'PT-01',
      sampleType: 'Citrated Plasma',
      price: 250.0,
      categoryId: hematology.id,
      parameters: {
        create: [
          { parameterName: 'Test Time', referenceRange: '11 - 15', unit: 'Sec', groupName: 'Coagulation' },
          { parameterName: 'Control Time', referenceRange: '11 - 15', unit: 'Sec', groupName: 'Coagulation' },
          { parameterName: 'INR', referenceRange: '0.8 - 1.2', unit: '-', groupName: 'Coagulation' },
        ]
      }
    }
  });

  // 4. Hemoglobin (Standalone)
  await prisma.test.upsert({
    where: { testCode: 'HB-01' },
    update: {},
    create: {
      testName: 'Hemoglobin (Hb)',
      testCode: 'HB-01',
      sampleType: 'EDTA Blood',
      price: 100.0,
      categoryId: hematology.id,
      parameters: {
        create: [
          { parameterName: 'Hemoglobin (Hb)', referenceRange: '13.0 - 17.0', unit: 'g/dL', groupName: 'Hematology' },
        ]
      }
    }
  });

  // 5. Serum Creatinine (Standalone)
  await prisma.test.upsert({
    where: { testCode: 'CREAT-01' },
    update: {},
    create: {
      testName: 'Serum Creatinine',
      testCode: 'CREAT-01',
      sampleType: 'Serum',
      price: 150.0,
      categoryId: biochem.id,
      parameters: {
        create: [
          { parameterName: 'Serum Creatinine', referenceRange: '0.6 - 1.2', unit: 'mg/dL', groupName: 'Renal' },
        ]
      }
    }
  });

  // 6. Blood Urea (Standalone)
  await prisma.test.upsert({
    where: { testCode: 'UREA-01' },
    update: {},
    create: {
      testName: 'Blood Urea',
      testCode: 'UREA-01',
      sampleType: 'Serum',
      price: 150.0,
      categoryId: biochem.id,
      parameters: {
        create: [
          { parameterName: 'Blood Urea', referenceRange: '15 - 40', unit: 'mg/dL', groupName: 'Renal' },
        ]
      }
    }
  });

  // 7. Widal Test
  await prisma.test.upsert({
    where: { testCode: 'WIDAL-01' },
    update: {},
    create: {
      testName: 'Widal Test',
      testCode: 'WIDAL-01',
      sampleType: 'Serum',
      price: 200.0,
      categoryId: serology.id,
      parameters: {
        create: [
          { parameterName: 'Salmonella Typhi O', referenceRange: '< 1:80', unit: 'Titre', groupName: 'Widal' },
          { parameterName: 'Salmonella Typhi H', referenceRange: '< 1:80', unit: 'Titre', groupName: 'Widal' },
          { parameterName: 'Salmonella Paratyphi AH', referenceRange: '< 1:80', unit: 'Titre', groupName: 'Widal' },
          { parameterName: 'Salmonella Paratyphi BH', referenceRange: '< 1:80', unit: 'Titre', groupName: 'Widal' },
        ]
      }
    }
  });

  console.log('Successfully seeded more standalone tests!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
