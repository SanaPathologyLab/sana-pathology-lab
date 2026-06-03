const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding additional tests...");

  const [hematology, biochemistry, immunology, serology, clinical, microbiology, hormones] = await Promise.all([
    prisma.testCategory.upsert({ where: { name: 'Hematology' }, update: {}, create: { name: 'Hematology' } }),
    prisma.testCategory.upsert({ where: { name: 'Biochemistry' }, update: {}, create: { name: 'Biochemistry' } }),
    prisma.testCategory.upsert({ where: { name: 'Immunology' }, update: {}, create: { name: 'Immunology' } }),
    prisma.testCategory.upsert({ where: { name: 'Serology' }, update: {}, create: { name: 'Serology' } }),
    prisma.testCategory.upsert({ where: { name: 'Clinical Pathology' }, update: {}, create: { name: 'Clinical Pathology' } }),
    prisma.testCategory.upsert({ where: { name: 'Microbiology' }, update: {}, create: { name: 'Microbiology' } }),
    prisma.testCategory.upsert({ where: { name: 'Hormone Tests' }, update: {}, create: { name: 'Hormone Tests' } }),
  ]);

  // Blood Sugar (FBS/RBS/PP)
  await prisma.test.upsert({
    where: { testCode: 'BSF' },
    update: {},
    create: {
      testName: 'BLOOD SUGAR FASTING (BSF)',
      testCode: 'BSF',
      sampleType: 'SERUM/PLASMA',
      price: 80,
      categoryId: biochemistry.id,
      parameters: {
        create: [
          { parameterName: 'BLOOD GLUCOSE FASTING', referenceRange: '70-100', unit: 'mg/dL', groupName: 'BLOOD SUGAR' },
        ]
      }
    }
  });

  await prisma.test.upsert({
    where: { testCode: 'BSRBS' },
    update: {},
    create: {
      testName: 'BLOOD SUGAR RANDOM (BSRBS)',
      testCode: 'BSRBS',
      sampleType: 'SERUM/PLASMA',
      price: 80,
      categoryId: biochemistry.id,
      parameters: {
        create: [
          { parameterName: 'BLOOD GLUCOSE RANDOM', referenceRange: '< 200', unit: 'mg/dL', groupName: 'BLOOD SUGAR' },
        ]
      }
    }
  });

  await prisma.test.upsert({
    where: { testCode: 'BSPP' },
    update: {},
    create: {
      testName: 'BLOOD SUGAR POST PRANDIAL (BSPP)',
      testCode: 'BSPP',
      sampleType: 'SERUM/PLASMA',
      price: 80,
      categoryId: biochemistry.id,
      parameters: {
        create: [
          { parameterName: 'BLOOD GLUCOSE POST PRANDIAL', referenceRange: '< 140', unit: 'mg/dL', groupName: 'BLOOD SUGAR' },
        ]
      }
    }
  });

  // Urine Routine Examination
  await prisma.test.upsert({
    where: { testCode: 'URINE-RE' },
    update: {},
    create: {
      testName: 'URINE ROUTINE EXAMINATION (URE)',
      testCode: 'URINE-RE',
      sampleType: 'URINE',
      price: 100,
      categoryId: clinical.id,
      parameters: {
        create: [
          { parameterName: 'COLOUR', referenceRange: 'Yellow', unit: '', groupName: 'PHYSICAL EXAMINATION' },
          { parameterName: 'APPEARANCE', referenceRange: 'Clear', unit: '', groupName: 'PHYSICAL EXAMINATION' },
          { parameterName: 'REACTION (pH)', referenceRange: '4.5-8.5', unit: '', groupName: 'PHYSICAL EXAMINATION' },
          { parameterName: 'SPECIFIC GRAVITY', referenceRange: '1.005-1.030', unit: '', groupName: 'PHYSICAL EXAMINATION' },
          { parameterName: 'PROTEIN', referenceRange: 'NIL', unit: '', groupName: 'CHEMICAL EXAMINATION' },
          { parameterName: 'GLUCOSE', referenceRange: 'NIL', unit: '', groupName: 'CHEMICAL EXAMINATION' },
          { parameterName: 'KETONE BODIES', referenceRange: 'NIL', unit: '', groupName: 'CHEMICAL EXAMINATION' },
          { parameterName: 'BILIRUBIN', referenceRange: 'NIL', unit: '', groupName: 'CHEMICAL EXAMINATION' },
          { parameterName: 'UROBILINOGEN', referenceRange: 'Normal', unit: '', groupName: 'CHEMICAL EXAMINATION' },
          { parameterName: 'NITRITE', referenceRange: 'Negative', unit: '', groupName: 'CHEMICAL EXAMINATION' },
          { parameterName: 'RBC', referenceRange: '0-2', unit: '/HPF', groupName: 'MICROSCOPIC EXAMINATION' },
          { parameterName: 'WBC / PUS CELLS', referenceRange: '0-5', unit: '/HPF', groupName: 'MICROSCOPIC EXAMINATION' },
          { parameterName: 'EPITHELIAL CELLS', referenceRange: '0-5', unit: '/HPF', groupName: 'MICROSCOPIC EXAMINATION' },
          { parameterName: 'CASTS', referenceRange: 'NIL', unit: '/LPF', groupName: 'MICROSCOPIC EXAMINATION' },
          { parameterName: 'CRYSTALS', referenceRange: 'NIL', unit: '', groupName: 'MICROSCOPIC EXAMINATION' },
          { parameterName: 'BACTERIA', referenceRange: 'NIL', unit: '', groupName: 'MICROSCOPIC EXAMINATION' },
        ]
      }
    }
  });

  // CRP
  await prisma.test.upsert({
    where: { testCode: 'CRP' },
    update: {},
    create: {
      testName: 'C-REACTIVE PROTEIN (CRP)',
      testCode: 'CRP',
      sampleType: 'SERUM',
      price: 150,
      categoryId: serology.id,
      parameters: {
        create: [
          { parameterName: 'C-REACTIVE PROTEIN (CRP)', referenceRange: '< 6', unit: 'mg/L', groupName: 'CRP' },
        ]
      }
    }
  });

  // ESR
  await prisma.test.upsert({
    where: { testCode: 'ESR' },
    update: {},
    create: {
      testName: 'ERYTHROCYTE SEDIMENTATION RATE (ESR)',
      testCode: 'ESR',
      sampleType: 'EDTA BLOOD',
      price: 80,
      categoryId: hematology.id,
      parameters: {
        create: [
          { parameterName: 'ESR (WESTERGREN)', referenceRange: 'M: 0-15, F: 0-20', unit: 'mm/Hr', groupName: 'ESR' },
        ]
      }
    }
  });

  // Dengue
  await prisma.test.upsert({
    where: { testCode: 'DENGUE' },
    update: {},
    create: {
      testName: 'DENGUE NS1 Ag + IgG/IgM (Combo)',
      testCode: 'DENGUE',
      sampleType: 'SERUM',
      price: 500,
      categoryId: serology.id,
      parameters: {
        create: [
          { parameterName: 'DENGUE NS1 ANTIGEN', referenceRange: 'Negative', unit: '', groupName: 'DENGUE PANEL' },
          { parameterName: 'DENGUE IgG ANTIBODY', referenceRange: 'Negative', unit: '', groupName: 'DENGUE PANEL' },
          { parameterName: 'DENGUE IgM ANTIBODY', referenceRange: 'Negative', unit: '', groupName: 'DENGUE PANEL' },
        ]
      }
    }
  });

  // Malaria (MP)
  await prisma.test.upsert({
    where: { testCode: 'MALARIA' },
    update: {},
    create: {
      testName: 'MALARIA PARASITE (MP) TEST',
      testCode: 'MALARIA',
      sampleType: 'EDTA BLOOD',
      price: 150,
      categoryId: microbiology.id,
      parameters: {
        create: [
          { parameterName: 'MALARIA ANTIGEN (Pf/Pv)', referenceRange: 'Negative', unit: '', groupName: 'MALARIA' },
        ]
      }
    }
  });

  // Typhoid Card
  await prisma.test.upsert({
    where: { testCode: 'TYPHOID-CARD' },
    update: {},
    create: {
      testName: 'TYPHIDOT (Typhoid Card Test)',
      testCode: 'TYPHOID-CARD',
      sampleType: 'SERUM',
      price: 300,
      categoryId: serology.id,
      parameters: {
        create: [
          { parameterName: 'TYPHIDOT IgG', referenceRange: 'Negative', unit: '', groupName: 'TYPHOID' },
          { parameterName: 'TYPHIDOT IgM', referenceRange: 'Negative', unit: '', groupName: 'TYPHOID' },
        ]
      }
    }
  });

  // HIV
  await prisma.test.upsert({
    where: { testCode: 'HIV' },
    update: {},
    create: {
      testName: 'HIV I & II (Rapid)',
      testCode: 'HIV',
      sampleType: 'SERUM',
      price: 150,
      categoryId: serology.id,
      parameters: {
        create: [
          { parameterName: 'HIV I & II ANTIBODY', referenceRange: 'Non-Reactive', unit: '', groupName: 'HIV' },
        ]
      }
    }
  });

  // HBsAg
  await prisma.test.upsert({
    where: { testCode: 'HBSAG' },
    update: {},
    create: {
      testName: 'HBsAg (Hepatitis B Surface Antigen)',
      testCode: 'HBSAG',
      sampleType: 'SERUM',
      price: 150,
      categoryId: serology.id,
      parameters: {
        create: [
          { parameterName: 'HBsAg', referenceRange: 'Non-Reactive', unit: '', groupName: 'HEPATITIS B' },
        ]
      }
    }
  });

  // HCV
  await prisma.test.upsert({
    where: { testCode: 'HCV' },
    update: {},
    create: {
      testName: 'HCV (Hepatitis C Antibody)',
      testCode: 'HCV',
      sampleType: 'SERUM',
      price: 150,
      categoryId: serology.id,
      parameters: {
        create: [
          { parameterName: 'HCV ANTIBODY', referenceRange: 'Non-Reactive', unit: '', groupName: 'HEPATITIS C' },
        ]
      }
    }
  });

  // VDRL / RPR (Syphilis)
  await prisma.test.upsert({
    where: { testCode: 'VDRL' },
    update: {},
    create: {
      testName: 'VDRL / RPR (Syphilis Test)',
      testCode: 'VDRL',
      sampleType: 'SERUM',
      price: 100,
      categoryId: serology.id,
      parameters: {
        create: [
          { parameterName: 'VDRL / RPR', referenceRange: 'Non-Reactive', unit: '', groupName: 'VDRL' },
        ]
      }
    }
  });

  // RA Factor
  await prisma.test.upsert({
    where: { testCode: 'RA-FACTOR' },
    update: {},
    create: {
      testName: 'RHEUMATOID FACTOR (RA FACTOR)',
      testCode: 'RA-FACTOR',
      sampleType: 'SERUM',
      price: 150,
      categoryId: serology.id,
      parameters: {
        create: [
          { parameterName: 'RA FACTOR', referenceRange: '< 14', unit: 'IU/mL', groupName: 'RA FACTOR' },
        ]
      }
    }
  });

  // Urine Pregnancy Test (UPT)
  await prisma.test.upsert({
    where: { testCode: 'UPT' },
    update: {},
    create: {
      testName: 'URINE PREGNANCY TEST (UPT)',
      testCode: 'UPT',
      sampleType: 'URINE',
      price: 50,
      categoryId: clinical.id,
      parameters: {
        create: [
          { parameterName: 'PREGNANCY TEST (Beta-hCG)', referenceRange: 'Negative', unit: '', groupName: 'PREGNANCY TEST' },
        ]
      }
    }
  });

  // Beta hCG Serum
  await prisma.test.upsert({
    where: { testCode: 'BHCG' },
    update: {},
    create: {
      testName: 'BETA-hCG (Serum Quantitative)',
      testCode: 'BHCG',
      sampleType: 'SERUM',
      price: 400,
      categoryId: hormones.id,
      parameters: {
        create: [
          { parameterName: 'BETA-hCG (Quantitative)', referenceRange: 'Non-pregnant: < 5', unit: 'mIU/mL', groupName: 'BETA-hCG' },
        ]
      }
    }
  });

  // Iron Studies
  await prisma.test.upsert({
    where: { testCode: 'IRON' },
    update: {},
    create: {
      testName: 'IRON STUDIES (Serum Iron + TIBC)',
      testCode: 'IRON',
      sampleType: 'SERUM',
      price: 400,
      categoryId: biochemistry.id,
      parameters: {
        create: [
          { parameterName: 'SERUM IRON', referenceRange: '60-170', unit: 'mcg/dL', groupName: 'IRON STUDIES' },
          { parameterName: 'TIBC', referenceRange: '240-450', unit: 'mcg/dL', groupName: 'IRON STUDIES' },
          { parameterName: 'TRANSFERRIN SATURATION', referenceRange: '20-50', unit: '%', groupName: 'IRON STUDIES' },
        ]
      }
    }
  });

  // Vitamin D
  await prisma.test.upsert({
    where: { testCode: 'VIT-D' },
    update: {},
    create: {
      testName: 'VITAMIN D (25-OH) TOTAL',
      testCode: 'VIT-D',
      sampleType: 'SERUM',
      price: 800,
      categoryId: hormones.id,
      parameters: {
        create: [
          { parameterName: 'VITAMIN D (25-OH) TOTAL', referenceRange: '30-100', unit: 'ng/mL', groupName: 'VITAMINS' },
        ]
      }
    }
  });

  // Vitamin B12
  await prisma.test.upsert({
    where: { testCode: 'VIT-B12' },
    update: {},
    create: {
      testName: 'VITAMIN B12 (Cyanocobalamin)',
      testCode: 'VIT-B12',
      sampleType: 'SERUM',
      price: 700,
      categoryId: hormones.id,
      parameters: {
        create: [
          { parameterName: 'VITAMIN B12', referenceRange: '200-900', unit: 'pg/mL', groupName: 'VITAMINS' },
        ]
      }
    }
  });

  // ABO Blood Group & Rh Factor
  await prisma.test.upsert({
    where: { testCode: 'BLOOD-GROUP' },
    update: {},
    create: {
      testName: 'ABO BLOOD GROUP & Rh FACTOR',
      testCode: 'BLOOD-GROUP',
      sampleType: 'EDTA BLOOD',
      price: 100,
      categoryId: hematology.id,
      parameters: {
        create: [
          { parameterName: 'BLOOD GROUP (ABO)', referenceRange: '', unit: '', groupName: 'BLOOD GROUP' },
          { parameterName: 'Rh FACTOR', referenceRange: '', unit: '', groupName: 'BLOOD GROUP' },
        ]
      }
    }
  });

  // Stool Routine
  await prisma.test.upsert({
    where: { testCode: 'STOOL-RE' },
    update: {},
    create: {
      testName: 'STOOL ROUTINE EXAMINATION',
      testCode: 'STOOL-RE',
      sampleType: 'STOOL',
      price: 100,
      categoryId: clinical.id,
      parameters: {
        create: [
          { parameterName: 'COLOUR', referenceRange: 'Brown', unit: '', groupName: 'PHYSICAL EXAMINATION' },
          { parameterName: 'CONSISTENCY', referenceRange: 'Formed', unit: '', groupName: 'PHYSICAL EXAMINATION' },
          { parameterName: 'PUS CELLS', referenceRange: '0-5', unit: '/HPF', groupName: 'MICROSCOPIC EXAMINATION' },
          { parameterName: 'RBC', referenceRange: 'NIL', unit: '/HPF', groupName: 'MICROSCOPIC EXAMINATION' },
          { parameterName: 'OVA / CYST', referenceRange: 'Not seen', unit: '', groupName: 'MICROSCOPIC EXAMINATION' },
          { parameterName: 'OCCULT BLOOD', referenceRange: 'Negative', unit: '', groupName: 'MICROSCOPIC EXAMINATION' },
        ]
      }
    }
  });

  // Covid Antigen
  await prisma.test.upsert({
    where: { testCode: 'COVID-AG' },
    update: {},
    create: {
      testName: 'COVID-19 ANTIGEN RAPID TEST',
      testCode: 'COVID-AG',
      sampleType: 'NASAL SWAB',
      price: 300,
      categoryId: microbiology.id,
      parameters: {
        create: [
          { parameterName: 'SARS-CoV-2 ANTIGEN', referenceRange: 'Negative', unit: '', groupName: 'COVID-19' },
        ]
      }
    }
  });

  const total = await prisma.test.count();
  console.log(`✅ Database seeded! Total tests: ${total}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
