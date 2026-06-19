import React, { useState, useEffect, useContext } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { ArrowRight, Save, ArrowLeft, Beaker, Camera, Loader2, FileText, CheckCircle2, MessageSquare, Sparkles, QrCode } from 'lucide-react';
import { generateAI } from '../utils/ai';
import Tesseract from 'tesseract.js';
import QRScanner from '../components/QRScanner';

const AI_KNOWLEDGE_BASE = `
# Laboratory Patient Test Recommendation Guidelines

## AVAILABLE TESTS CATALOGUE:
- Thyroid Function Test (T3, T4, TSH) [Code: TFT, Price: ₹450]
- Thyroid Profile (T3, T4, TSH) [Code: TFT-01, Price: ₹500]
- HbA1c (Glycosylated Haemoglobin) [Code: HBA1C, Price: ₹400]
- Random Blood Sugar (RBS) [Code: GLU-01, Price: ₹100]
- Complete Blood Count (CBC) [Code: CBC, Price: ₹200]
- Hemoglobin (Hb) [Code: HB-01, Price: ₹100]
- ESR (Erythrocyte Sedimentation Rate) [Code: ESR-01, Price: ₹150]
- Prothrombin Time (PT) [Code: PT-01, Price: ₹250]
- TLC (Total Leucocytes Count) [Code: 016, Price: ₹50]
- Platelets Count [Code: 015, Price: ₹100]
- Blood Group ABO & Rh Factor [Code: BG, Price: ₹50]
- Liver Function Test (LFT) [Code: LFT, Price: ₹500]
- SGOT (AST) [Code: SGOT, Price: ₹100]
- SGPT (ALT) [Code: SGPT, Price: ₹100]
- SGOT-SGPT (Combined) [Code: SGOT-SGPT, Price: ₹250]
- Total Bilirubin [Code: BILIRUBIN-TOTAL-01, Price: ₹150]
- Kidney Function Test (KFT) [Code: KFT, Price: ₹500]
- Serum Creatinine [Code: CREAT-01, Price: ₹150]
- Blood Urea [Code: UREA-01, Price: ₹150]
- Serum Uric Acid [Code: URIC_ACID, Price: ₹100]
- Serum Calcium [Code: CALCIUM-01, Price: ₹200]
- Lipid Profile [Code: LIPID, Price: ₹650]
- CRP – C-Reactive Protein (Quantitative) [Code: CRP-QUANT-01, Price: ₹350]
- CRP – C-Reactive Protein [Code: CRP-01, Price: ₹250]
- Urine Examination (Routine & Microscopy) [Code: URINE, Price: ₹150]
- Rheumatoid Factor [Code: RF, Price: ₹350]
- Semen Analysis [Code: SEMEN-01, Price: ₹350]
- Ante-Natal Care (ANC) Profile [Code: ANC-01, Price: ₹1200]
- Malaria (MP) ELISA [Code: MP, Price: ₹100]
- Malaria Parasite Identification (Microscopy) [Code: MP-MICRO, Price: ₹150]
- Dengue Profile (IgG, IgM, NS1) [Code: DENGUE-01, Price: ₹1200]
- Widal Test [Code: WIDAL1, Price: ₹50]
- Widal Test (Rapid Slide Method) [Code: WIDAL, Price: ₹50]
- Typhidot (IgG & IgM) [Code: TYPHIDOT-01, Price: ₹100]
- Mantoux Test (Tuberculin Skin Test) [Code: MANTOUX-01, Price: ₹250]

## DECISION RULES & MAPPING:
1. **Fever**:
   - Always include Complete Blood Count (CBC) (₹200) as the base test for any fever.
   - If fever < 3 days: recommend CBC, Malaria Parasite (Microscopy) [MP-MICRO] or Malaria ELISA [MP], Dengue Profile [DENGUE-01].
   - If fever > 7 days: recommend CBC, Widal Test [WIDAL1], Typhidot [TYPHIDOT-01], Malaria (MP ELISA + Microscopy) [MP + MP-MICRO].
   - Fever with joint pain & rash: recommend Dengue Profile [DENGUE-01], CBC, Platelets Count [015].
   - Fever with chills & shivering: recommend Malaria Microscopy [MP-MICRO], Malaria ELISA [MP], CBC.
2. **Diabetes**:
   - If screening: Random Blood Sugar (RBS) [GLU-01], HbA1c [HBA1C].
   - If diabetic monitoring: HbA1c [HBA1C], RBS [GLU-01], Urine Examination [URINE] (check protein).
   - If diabetic with leg pain/swelling/wound: HbA1c [HBA1C], KFT, CBC.
3. **Thyroid**:
   - If suspected hypothyroidism (weight gain, fatigue, cold): Thyroid Function Test [TFT].
   - If suspected hyperthyroidism (weight loss, anxiety, palpitations): Thyroid Profile [TFT-01].
   - Monitoring: TFT [TFT].
4. **Heart / BP**:
   - Risk Screening: Lipid Profile [LIPID], RBS [GLU-01].
   - Chest pain concern: CBC, SGOT (AST) [SGOT], LFT, Lipid Profile [LIPID].
5. **Liver Problems**:
   - Jaundice suspected: LFT, Total Bilirubin [BILIRUBIN-TOTAL-01], SGOT-SGPT [SGOT-SGPT], CBC.
   - Fatty Liver/Alcohol: SGOT-SGPT [SGOT-SGPT], LFT, Lipid Profile [LIPID].
6. **Kidney Problems**:
   - UTI/burning urination: Urine Examination [URINE], CBC.
   - Kidney check/CKD: KFT, Serum Creatinine [CREAT-01], Blood Urea [UREA-01], Urine Examination [URINE] (protein).
7. **Joint Pain / Arthritis**:
   - Rheumatoid Arthritis: Rheumatoid Factor (RF) [RF], CRP Quantitative [CRP-QUANT-01], ESR [ESR-01].
   - Gout: Uric Acid [URIC_ACID], KFT, CBC.
8. **Pregnancy / Antenatal**:
   - Pregnant checkup: ANC Profile [ANC-01] (covers 13 parameters, ₹1200), Blood Group [BG], Hemoglobin [HB-01], Urine Examination [URINE], RBS/HbA1c.
9. **Weakness / Anemia**:
   - CBC, Hemoglobin [HB-01].
10. **Tuberculosis (TB) Suspected**:
    - Cough >2-3 weeks: Mantoux Test [MANTOUX-01], CBC, ESR [ESR-01]. Order LFT [LFT] as baseline before starting TB medication.
11. **Male Infertility**:
    - Semen Analysis [SEMEN-01].

## CRITICAL RULES FOR RECOMENDATION:
- If patient has ANY fever, always include CBC [CBC] as base test.
- Fever < 5 days -> Dengue Profile [DENGUE-01].
- Do NOT recommend Widal [WIDAL1] if fever is < 7 days. Recommend Typhidot [TYPHIDOT-01] instead.
- For Diabetes, always pair RBS [GLU-01] with HbA1c [HBA1C].
- For pregnant women, always suggest ANC Profile [ANC-01].
- Joint Pain: big toe/sudden = Gout (Uric Acid [URIC_ACID] first). Finger joints/morning stiffness = RA (RF [RF] first).
- Unexplained weight change, fatigue, hair loss, or irregular periods -> include TFT [TFT].
- Suspected TB: order LFT [LFT] as baseline first.
- Do NOT recommend sub-tests separately if parent panel (e.g. LFT, KFT, CBC, TFT, Lipid Profile, ANC Profile) is recommended.
`;

const CreateReport = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Print sample label (50x25mm) helper
  const handlePrintLabel = () => {
    if (!selectedPatient) return alert("Please select a Patient first.");
    const patientObj = patients.find(p => p.id === selectedPatient.value);
    if (!patientObj) return alert("Patient data not found.");

    const patientName = patientObj.fullName;
    const patientId = patientObj.patientId;
    const testCodes = selectedTests.map(t => t.label.split(' - ')[0]).join(', ');
    const dateStr = new Date().toLocaleDateString('en-IN');

    // Open clean window for printing
    const printWindow = window.open('', '_blank', 'width=450,height=300');
    if (!printWindow) {
      alert("Popup blocker is preventing label print window from opening. Please allow popups for this site.");
      return;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Vial Label - ${patientId}</title>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <style>
            @page {
              size: 50mm 25mm;
              margin: 0;
            }
            body {
              width: 50mm;
              height: 25mm;
              margin: 0;
              padding: 1.5mm 2mm;
              box-sizing: border-box;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
              font-size: 7px;
              line-height: 1.1;
              color: black;
              background: white;
              overflow: hidden;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .header {
              display: flex;
              justify-content: space-between;
              font-weight: 800;
              border-bottom: 0.3px solid #000;
              padding-bottom: 0.3mm;
              font-size: 6px;
            }
            .patient-name {
              font-size: 8px;
              font-weight: 900;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              margin-top: 0.5mm;
            }
            .test-codes {
              font-size: 6px;
              font-weight: bold;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .barcode-container {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 10mm;
            }
            svg {
              width: 100%;
              height: 100%;
              max-height: 10mm;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <span>SANA PATHOLOGY LAB</span>
            <span>${dateStr}</span>
          </div>
          <div class="patient-name">${patientName.toUpperCase()}</div>
          <div class="test-codes">T: ${testCodes || 'NONE SELECTED'}</div>
          <div class="barcode-container">
            <svg id="barcode"></svg>
          </div>
          <script>
            window.onload = function() {
              JsBarcode("#barcode", "${patientId}", {
                format: "CODE128",
                width: 1.1,
                height: 25,
                displayValue: true,
                fontSize: 7,
                margin: 0
              });
              setTimeout(function() {
                window.print();
                window.close();
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Report Date
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);

  // Raw Data
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [tests, setTests] = useState([]);

  // Selections
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedTests, setSelectedTests] = useState([]);

  // Result Values (Step 2)
  const [testResults, setTestResults] = useState([]);
  const [overallResults, setOverallResults] = useState({});
  const [testSummaries, setTestSummaries] = useState({});

  // OCR State
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [ocrError, setOcrError] = useState('');
  const [showOcrText, setShowOcrText] = useState(false);

  // AI Suggester State
  const [symptoms, setSymptoms] = useState('');
  const [suggestingTests, setSuggestingTests] = useState(false);
  const [suggestedText, setSuggestedText] = useState('');

  // New Interactive AI Suggester States
  const [aiStep, setAiStep] = useState('idle'); // 'idle' | 'asking' | 'results'
  const [aiQuestions, setAiQuestions] = useState([]);
  const [aiAnswers, setAiAnswers] = useState({});
  const [aiExplanation, setAiExplanation] = useState('');
  const [aiRecommendedTests, setAiRecommendedTests] = useState([]);
  const [aiLang, setAiLang] = useState('en'); // 'en' | 'hi'

  // QR Scanner State
  const [showQRScanner, setShowQRScanner] = useState(false);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [pRes, dRes, tRes] = await Promise.all([
        fetch('/api/patients', { headers: { 'Authorization': `Bearer ${user.accessToken}` } }),
        fetch('/api/doctors', { headers: { 'Authorization': `Bearer ${user.accessToken}` } }),
        fetch('/api/tests', { headers: { 'Authorization': `Bearer ${user.accessToken}` } })
      ]);
      const pData = await pRes.json();
      const dData = await dRes.json();
      const tData = await tRes.json();
      
      if (Array.isArray(pData)) setPatients(pData);
      if (Array.isArray(dData)) setDoctors(dData);
      if (Array.isArray(tData)) setTests(tData);
    } catch (err) {
      console.error(err);
    }
  };

  const patientOptions = patients.map(p => ({ value: p.id, label: `${p.patientId} - ${p.fullName}` }));
  const doctorOptions = doctors.map(d => ({ value: d.id, label: `${d.doctorId} - ${d.name}` }));
  const testOptions = tests.map(t => ({ 
    value: t.id, 
    label: `${t.testCode} - ${t.testName}`,
    testName: t.testName,
    parameters: t.parameters || [],
    summary: t.summary || ''
  }));

  const handleNextStep = () => {
    if (!selectedPatient) return alert("Please select a Patient.");
    if (selectedTests.length === 0) return alert("Please select at least one Test.");

    // Flat map all parameters from the selected tests
    const initialSummaries = {};
    const initialResults = [];

    selectedTests.forEach(t => {
      initialSummaries[t.value] = t.summary || '';
      if (t.parameters && t.parameters.length > 0) {
        t.parameters.forEach(p => {
          // Unique key for tracking inputs (testId + parameterName)
          const key = `${t.value}_${p.parameterName}`;
          const existing = testResults.find(tr => tr.key === key);
          const initialValue = p.isQualitative && p.titerValues
            ? p.titerValues.split(',').map(v => `${v.trim()}|--`).join('||')
            : '';
          initialResults.push(existing || {
            key,
            testId: t.value,
            parentTestName: t.testName,
            parameterName: p.parameterName,
            referenceRange: p.referenceRange,
            unit: p.unit,
            groupName: p.groupName,
            isQualitative: p.isQualitative || false,
            titerValues: p.titerValues || '',
            resultValue: initialValue,
            flag: ''
          });
        });
      }
    });

    setTestSummaries(initialSummaries);
    setTestResults(initialResults);
    setStep(2);
  };

  const handleOcrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrError('');
    setOcrText('');
    setShowOcrText(true);

    try {
      const worker = await Tesseract.createWorker('eng');
      const ret = await worker.recognize(file);
      const text = ret.data.text;
      setOcrText(text);
      await worker.terminate();

      // Simple keyword matching against available tests to auto-select
      const textUpper = text.toUpperCase();
      const matchedTests = testOptions.filter(t => {
        // match testName or testCode
        const nameMatch = textUpper.includes(t.testName.toUpperCase());
        const codeMatch = textUpper.includes(t.label.split(' - ')[0].toUpperCase());
        return nameMatch || codeMatch;
      });

      if (matchedTests.length > 0) {
        // Merge with currently selected without duplicating
        setSelectedTests(prev => {
          const currentIds = new Set(prev.map(p => p.value));
          const newSelections = matchedTests.filter(m => !currentIds.has(m.value));
          return [...prev, ...newSelections];
        });
      }

    } catch (err) {
      console.error('OCR Error:', err);
      setOcrError('Failed to read image. Please try again or enter manually.');
    } finally {
      setOcrLoading(false);
    }
  };

  const parseAIResponse = (text) => {
    let cleanText = text.trim();
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }
    try {
      return JSON.parse(cleanText);
    } catch (err) {
      console.warn("Failed to parse AI response as JSON:", err);
      return null;
    }
  };

  const handleStartAIAssessment = async () => {
    if (!symptoms.trim() || suggestingTests) return;
    setSuggestingTests(true);
    setSuggestedText('');
    setAiQuestions([]);
    setAiAnswers({});
    
    try {
      const testNames = testOptions.map(t => t.testName).join(', ');
      const languageText = aiLang === 'hi' ? 'Hindi (हिंदी - in Devanagari script)' : 'English';
      
      const prompt = `You are a professional medical diagnostic assistant.
We have a custom patient recommendation knowledge base. You MUST strictly follow the categories, mapping, and decision rules.

${AI_KNOWLEDGE_BASE}

A patient has reported these initial symptoms: "${symptoms}".
To recommend the absolute MINIMAL and most relevant diagnostic tests from our catalog, you need to ask 2 or 3 short clarifying questions (such as duration, age, gender, pregnancy status, recent travel, known medical history).
Our available lab tests are: [${testNames}].

Please respond in ${languageText} with a valid JSON object of this exact format:
{
  "questions": ["Question 1", "Question 2"],
  "message": "A brief polite message"
}
Return ONLY the JSON. Do not include markdown code block formatting (no \`\`\`json or similar).`;

      const responseText = await generateAI(prompt);
      const data = parseAIResponse(responseText);

      if (data && Array.isArray(data.questions) && data.questions.length > 0) {
        setAiQuestions(data.questions);
        setSuggestedText(data.message || 'Please answer the following clarifying questions:');
        setAiStep('asking');
      } else {
        // Fallback line-based parsing
        const lines = responseText.split('\n').map(l => l.trim()).filter(l => l.includes('?') || /^\d+[\.\)]/.test(l));
        if (lines.length > 0) {
          setAiQuestions(lines.slice(0, 3));
          setSuggestedText('Please answer the following clarifying questions:');
          setAiStep('asking');
        } else {
          throw new Error("Could not parse clarifying questions from AI response.");
        }
      }
    } catch (err) {
      console.error('AI Assessment Error:', err);
      setSuggestedText('Failed to initialize AI consultation. Please try again.');
    } finally {
      setSuggestingTests(false);
    }
  };

  const handleGetAILabRecommendations = async () => {
    if (suggestingTests) return;
    setSuggestingTests(true);
    
    try {
      const testNames = testOptions.map(t => t.testName).join(', ');
      const languageText = aiLang === 'hi' ? 'Hindi (हिंदी)' : 'English';
      
      const QAPairs = aiQuestions.map((q, idx) => `Q: ${q}\nA: ${aiAnswers[idx] || 'Not answered'}`).join('\n');
      
      const prompt = `You are a professional medical diagnostic assistant.
We have a custom patient recommendation knowledge base. You MUST strictly follow the categories, mapping, and decision rules.

${AI_KNOWLEDGE_BASE}

A patient has reported symptoms: "${symptoms}".
You asked these clarifying questions:
${QAPairs}

Based on this detailed information and following our guidelines and special rules, recommend the absolute MINIMAL, cost-effective, and most relevant diagnostic lab tests from our catalog: [${testNames}].
Do not suggest unnecessary tests. Target only the most likely conditions to be confirmed/ruled out.

Please respond in ${languageText} with a valid JSON object of this exact format:
{
  "recommendedTests": ["Test Name 1", "Test Name 2"],
  "explanation": "A simple explanation in ${languageText} of why these tests are recommended based on the answers."
}
Return ONLY the JSON. Do not include markdown code block formatting (no \`\`\`json or similar).`;

      const responseText = await generateAI(prompt);
      const data = parseAIResponse(responseText);

      if (data && Array.isArray(data.recommendedTests)) {
        setAiRecommendedTests(data.recommendedTests);
        setAiExplanation(data.explanation || '');
        setAiStep('results');
      } else {
        // Fallback: search available test names inside the responseText
        const matched = testOptions.filter(t => 
          responseText.toUpperCase().includes(t.testName.toUpperCase()) ||
          t.testName.toUpperCase().includes(responseText.toUpperCase())
        ).map(t => t.testName);
        
        if (matched.length > 0) {
          setAiRecommendedTests(matched);
          setAiExplanation(responseText);
          setAiStep('results');
        } else {
          throw new Error("Could not parse test recommendations from AI response.");
        }
      }
    } catch (err) {
      console.error('AI Recommendation Error:', err);
      alert('Failed to generate final recommendations. Please try again.');
    } finally {
      setSuggestingTests(false);
    }
  };

  const handleApplyRecommendedTests = () => {
    const matchedTests = testOptions.filter(t => 
      aiRecommendedTests.some(rt => rt.toUpperCase().includes(t.testName.toUpperCase()) || t.testName.toUpperCase().includes(rt.toUpperCase()))
    );

    if (matchedTests.length > 0) {
      setSelectedTests(prev => {
        const currentIds = new Set(prev.map(p => p.value));
        const newSelections = matchedTests.filter(m => !currentIds.has(m.value));
        return [...prev, ...newSelections];
      });
      alert(aiLang === 'hi' ? 'अनुशंसित टेस्ट सफलतापूर्वक जोड़े गए!' : 'Recommended tests added successfully!');
      handleResetAIAssessment();
    } else {
      alert(aiLang === 'hi' ? 'कोई मिलान वाला टेस्ट नहीं मिला।' : 'No matching tests found to apply.');
    }
  };

  const handleResetAIAssessment = () => {
    setAiStep('idle');
    setAiQuestions([]);
    setAiAnswers({});
    setAiExplanation('');
    setAiRecommendedTests([]);
    setSuggestedText('');
  };

  const handleSuggestTests = handleStartAIAssessment;

  const handleQRScan = (decodedText) => {
    setShowQRScanner(false);
    // The decodedText is the patientId (e.g., P001 or id)
    const match = patientOptions.find(opt => 
      opt.label.includes(decodedText) || String(opt.value) === String(decodedText)
    );
    if (match) {
      setSelectedPatient(match);
    } else {
      alert(`Patient ID "${decodedText}" not found.`);
    }
  };

  const autoCalculateFlag = (valueStr, rangeStr) => {
    if (!valueStr || !rangeStr) return '';
    const val = parseFloat(valueStr.toString().replace(/,/g, ''));
    if (isNaN(val)) return '';

    const range = rangeStr.toString().trim().replace(/,/g, '');
    
    // Find exactly one numeric range "min - max" safely without lookbehinds
    const rangePattern = /(?:^|[^\d\.])([\d\.]+)\s*-\s*([\d\.]+)(?:[^\d\.]|$)/g;
    const matches = [...range.matchAll(rangePattern)];
    
    if (matches.length === 1) {
      const min = parseFloat(matches[0][1]);
      const max = parseFloat(matches[0][2]);
      if (val < min) return 'LOW';
      if (val > max) return 'HIGH';
      return '';
    }

    // Less than
    const lessMatch = range.match(/<\s*([\d\.]+)/);
    if (lessMatch && val > parseFloat(lessMatch[1])) return 'HIGH';

    // Greater than
    const greaterMatch = range.match(/>\s*([\d\.]+)/);
    if (greaterMatch && val < parseFloat(greaterMatch[1])) return 'LOW';

    return '';
  };

  const handleResultChange = (key, field, value) => {
    setTestResults(prev => {
      let newResults = prev.map(tr => {
        if (tr.key === key) {
          const updated = { ...tr, [field]: value };
          if (field === 'resultValue') {
            const autoFlag = autoCalculateFlag(value, tr.referenceRange);
            if (autoFlag || value === '') updated.flag = autoFlag;
          }
          return updated;
        }
        return tr;
      });

      // Auto-calculate CBC Parameters based on photo formulas
      const modifiedRow = newResults.find(tr => tr.key === key);
      if (modifiedRow && field === 'resultValue') {
        const paramName = modifiedRow.parameterName;
        if (paramName === 'HAEMOGLOBIN' || paramName === 'H.C.T.' || paramName === 'R.B.C. COUNT') {
          const hbRow = newResults.find(tr => tr.testId === modifiedRow.testId && tr.parameterName === 'HAEMOGLOBIN');
          let hb = hbRow && hbRow.resultValue ? parseFloat(hbRow.resultValue) : NaN;
          
          let hct = NaN, rbc = NaN;

          // If HB was just updated, auto-derive HCT and RBC
          if (paramName === 'HAEMOGLOBIN' && !isNaN(hb)) {
            hct = hb * 3;
            rbc = hb / 3;
          } else {
            const hctRow = newResults.find(tr => tr.testId === modifiedRow.testId && tr.parameterName === 'H.C.T.');
            const rbcRow = newResults.find(tr => tr.testId === modifiedRow.testId && tr.parameterName === 'R.B.C. COUNT');
            hct = hctRow && hctRow.resultValue ? parseFloat(hctRow.resultValue) : NaN;
            rbc = rbcRow && rbcRow.resultValue ? parseFloat(rbcRow.resultValue) : NaN;
          }

          // If we have all three base values, calculate the indices
          if (!isNaN(hb) && !isNaN(hct) && !isNaN(rbc) && rbc > 0 && hct > 0) {
            const mcv = (hct * 10) / rbc;
            const mch = (hb * 10) / rbc;
            const mchc = (hb * 100) / hct;

            newResults = newResults.map(tr => {
              if (tr.testId === modifiedRow.testId) {
                let updatedVal = null;
                // Only overwrite HCT and RBC if HB was the one modified
                if (paramName === 'HAEMOGLOBIN') {
                  if (tr.parameterName === 'H.C.T.') updatedVal = hct.toFixed(1);
                  if (tr.parameterName === 'R.B.C. COUNT') updatedVal = rbc.toFixed(2);
                }
                if (tr.parameterName === 'M.C.V.') updatedVal = mcv.toFixed(1);
                if (tr.parameterName === 'M.C.H.') updatedVal = mch.toFixed(1);
                if (tr.parameterName === 'M.C.H.C.') updatedVal = mchc.toFixed(1);

                if (updatedVal !== null) {
                  const autoFlag = autoCalculateFlag(updatedVal, tr.referenceRange);
                  return { ...tr, resultValue: updatedVal, flag: autoFlag || tr.flag || '' };
                }
              }
              return tr;
            });
          }
        }
      }
      
      return newResults;
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Build results array
      const savedResults = testResults.map(r => ({ 
        testId: r.testId, 
        parameterName: r.parameterName,
        resultValue: r.resultValue, 
        flag: r.flag,
        referenceRange: r.referenceRange,
        unit: r.unit,
        groupName: r.groupName
      }));
      // Add overall result for titer matrix tests
      Object.keys(overallResults).forEach(testName => {
        const ti = testResults.find(r => r.parentTestName === testName)?.testId;
        if (ti) {
          savedResults.push({
            testId: ti,
            parameterName: '',
            resultValue: overallResults[testName],
            flag: '',
            referenceRange: '',
            unit: '',
            groupName: `__OVERALL__${testName}`
          });
        }
      });
      // Add custom summaries
      Object.keys(testSummaries).forEach(tid => {
        if (testSummaries[tid]) {
          savedResults.push({
            testId: parseInt(tid),
            parameterName: '__SUMMARY__',
            resultValue: testSummaries[tid],
            flag: '',
            referenceRange: '',
            unit: '',
            groupName: '__SUMMARY__'
          });
        }
      });
      const payload = {
        patientId: selectedPatient.value,
        results: savedResults,
        reportDate
      };
      if (selectedDoctor) payload.doctorId = selectedDoctor.value;

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.accessToken}` },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const data = await res.json();
        navigate(`/print/${data.id}`);
      } else {
        alert('Failed to save report');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderImmunologySection = () => {
    const immunologyParams = testResults.filter(
      tr => tr.groupName === 'IMMUNOLOGY & SEROLOGY TEST'
    );
    if (immunologyParams.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="border border-black">
          <h4 className="font-black text-[15px] underline uppercase tracking-wider text-black px-4 py-2 border-b border-black" style={{ fontFamily: 'Georgia, serif' }}>
            IMMUNOLOGY &amp; SEROLOGY TEST
          </h4>
          <div className="divide-y divide-black">
            {immunologyParams.map(tr => (
              <div key={tr.key} className="flex items-center px-4 py-3">
                <span className="font-bold text-sm whitespace-nowrap" style={{ fontFamily: 'Georgia, serif' }}>
                  {tr.parameterName}
                </span>
                <div className="flex-1 mx-3 self-center" style={{
                  borderBottom: '1px dotted #999',
                  minWidth: '20px',
                  height: '1px'
                }}></div>
                <select
                  value={tr.resultValue || 'NON-REACTIVE'}
                  onChange={e => handleResultChange(tr.key, 'resultValue', e.target.value)}
                  className="font-bold text-sm border-0 bg-transparent focus:outline-none cursor-pointer text-right appearance-none"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  <option value="NON-REACTIVE">NON-REACTIVE</option>
                  <option value="REACTIVE">REACTIVE</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Group results for UI rendering
  const renderGroupedResults = () => {
    const groupedByTest = {};
    testResults.forEach(tr => {
      if (!groupedByTest[tr.parentTestName]) groupedByTest[tr.parentTestName] = [];
      groupedByTest[tr.parentTestName].push(tr);
    });

    return Object.keys(groupedByTest).map(testName => {
      const params = groupedByTest[testName];
      // Check if all params share the same titerValues (e.g., Widal matrix)
      const titerValueSet = [...new Set(params.filter(p => p.isQualitative && p.titerValues).map(p => p.titerValues))];
      const isTiterMatrix = titerValueSet.length === 1 && titerValueSet[0];
      const titerList = isTiterMatrix ? titerValueSet[0].split(',') : [];
      const isMantoux = params[0]?.test?.testCode === 'MANTOUX-01' || testName.toUpperCase().includes('MANTOUX');
      const isMalaria = params[0]?.test?.testCode === 'MP-MICRO' || testName.toUpperCase().includes('MALARIA MICRO');

      return (
        <div key={testName} className="mb-8">
          <h3 className="bg-[#00488d] text-white px-4 py-2 font-bold uppercase flex items-center justify-between">
            <span>{testName}</span>
          </h3>

          {isMantoux ? (
            <div className="p-6 border border-gray-300 rounded-b-lg bg-gray-50 max-w-2xl mx-auto mt-4 shadow-sm" style={{ fontFamily: 'Georgia, serif' }}>
              <div className="text-center mb-6">
                <h4 className="text-lg font-black underline uppercase text-black">{testName}</h4>
                <p className="text-sm font-semibold text-gray-700 mt-1">(Interdermal Skin Test)</p>
              </div>

              {/* Top Data Table */}
              <div className="border border-black mb-6 bg-white">
                <table className="w-full border-collapse text-sm">
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="w-1/2 p-3 font-bold border-r border-black text-black">Tuberculin Dose</td>
                      <td className="w-1/2 p-2">
                        <input 
                          type="text" 
                          value={(() => {
                            const p = params.find(p => p.parameterName.includes('Dose')) || params[0];
                            if (p && !p.resultValue) p.resultValue = '0.1 mL of TU PPD';
                            return p?.resultValue || '0.1 mL of TU PPD';
                          })()} 
                          onChange={e => {
                            const p = params.find(p => p.parameterName.includes('Dose')) || params[0];
                            if (p) handleResultChange(p.key, 'resultValue', e.target.value);
                          }} 
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm font-bold text-black focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="w-1/2 p-3 font-bold border-r border-black text-black">Induration (mm)</td>
                      <td className="w-1/2 p-2">
                        <input 
                          type="text" 
                          placeholder="e.g. 02X02"
                          value={(() => {
                            const p = params.find(p => p.parameterName.includes('Induration')) || params[1];
                            return p?.resultValue || '';
                          })()} 
                          onChange={e => {
                            const p = params.find(p => p.parameterName.includes('Induration')) || params[1];
                            if (p) handleResultChange(p.key, 'resultValue', e.target.value);
                          }} 
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm font-bold text-black focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="w-1/2 p-3 font-bold border-r border-black text-black">Result after 48 hours</td>
                      <td className="w-1/2 p-2">
                        {(() => {
                          const p = params.find(p => p.parameterName.includes('Result')) || params[2];
                          if (!p) return null;
                          const rawRange = p.referenceRange || 'NEGATIVE / POSITIVE';
                          const opts = rawRange.includes('/')
                            ? rawRange.split('/').map(o => o.trim()).filter(Boolean)
                            : rawRange.includes(',')
                              ? rawRange.split(',').map(o => o.trim()).filter(Boolean)
                              : [rawRange.trim()];
                          return (
                            <select 
                              value={p.resultValue || ''} 
                              onChange={e => handleResultChange(p.key, 'resultValue', e.target.value)} 
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm font-bold text-black focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
                            >
                              <option value="">-- Select --</option>
                              {opts.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          );
                        })()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Interpretation Section */}
              <div className="mb-6 text-black text-sm leading-relaxed">
                <p className="font-bold mb-1">Interpretation:</p>
                <p className="text-gray-800">
                  Induration measuring 10 mm more is considered positive which shows hypersensitivity to <span className="italic underline">tuberculoprotein</span>. It indicates past or present infection with <span className="italic underline">Mycobacterium</span> tuberculosis.
                </p>
              </div>

              {/* Induration Size Reference Table */}
              <div className="border border-black bg-white">
                <table className="w-full border-collapse text-left text-xs text-black">
                  <thead>
                    <tr className="bg-gray-100 border-b border-black font-bold">
                      <th className="p-2 border-r border-black w-1/3">Induration Size</th>
                      <th className="p-2 w-2/3">Interpretation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    <tr>
                      <td className="p-2 border-r border-black font-semibold">&lt; 5 mm</td>
                      <td className="p-2">A negative result, indicating no exposure to TB</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-r border-black font-semibold">5–9 mm</td>
                      <td className="p-2">Usually considered positive for people who are immunocompromised or have other risk factors for TB</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-r border-black font-semibold">10–14 mm</td>
                      <td className="p-2">Usually considered positive for people with medical risk factors for TB, recent immigrants from areas with high TB prevalence, or close contacts with people with TB</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-r border-black font-semibold">&gt; 15 mm</td>
                      <td className="p-2">Usually considered positive for people with no known risk factors for TB</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : isMalaria ? (
            <div className="p-6 border border-gray-300 rounded-b-lg bg-gray-50 max-w-2xl mx-auto mt-4 shadow-sm" style={{ fontFamily: 'Georgia, serif' }}>
              <div className="mb-6 text-center">
                <h3 className="text-lg font-black underline uppercase text-black">IMMUNOLOGY & SEROLOGY TEST</h3>
              </div>
              
              <div className="border border-black bg-white mb-6 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="font-bold text-[15px] text-black">MALARIA PARASITE IDENTIFICATION</span>
                    <span className="text-[12px] font-bold text-center mt-1 text-gray-800">(MICROSCOPY)</span>
                  </div>
                  {(() => {
                    const p = params[0];
                    if (!p) return null;
                    const rawRange = p.referenceRange || 'NOT-SEEN / SEEN';
                    const opts = rawRange.includes('/')
                      ? rawRange.split('/').map(o => o.trim()).filter(Boolean)
                      : rawRange.includes(',')
                        ? rawRange.split(',').map(o => o.trim()).filter(Boolean)
                        : [rawRange.trim()];
                    if (!p.resultValue && opts.length > 0) {
                      p.resultValue = opts[0];
                    }
                    return (
                      <select 
                        value={p.resultValue || ''}
                        onChange={e => handleResultChange(p.key, 'resultValue', e.target.value)} 
                        className="border border-gray-300 rounded px-3 py-2 text-[15px] font-bold text-black focus:outline-none focus:ring-1 focus:ring-black cursor-pointer shadow-sm min-w-[120px]"
                      >
                        {opts.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    );
                  })()}
                </div>
              </div>

              <div className="text-black text-[13px] leading-relaxed">
                <p className="font-bold mb-2">NOTE:</p>
                <div className="space-y-1.5">
                  <p className="flex items-start"><span className="mr-2">➤</span> A Single negative smear does not rule out malaria</p>
                  <p className="flex items-start"><span className="mr-2">➤</span> Test conducted on whole blood.</p>
                </div>
              </div>
            </div>
          ) : isTiterMatrix ? (
            <React.Fragment>
              <div className="border border-black">
                <table className="w-full text-left border-collapse text-black">
                  <thead>
                    <tr className="border-b border-black">
                      <th className="px-4 py-3 text-sm font-bold uppercase">&nbsp;</th>
                      {titerList.map((t, i) => (
                        <th key={i} className="px-2 py-3 text-sm font-bold text-center">{t.trim()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {params.map((tr) => {
                      const currentResults = tr.resultValue ? tr.resultValue.split('||').map(entry => {
                        const [t, v] = entry.split('|');
                        return { titer: t, value: v || '--' };
                      }) : titerList.map(t => ({ titer: t.trim(), value: '--' }));
                      const updateCell = (titer, val) => {
                        const updated = currentResults.map(r => {
                          if (r.titer.trim() === titer.trim()) {
                            return { ...r, value: val };
                          }
                          return r;
                        }).map(r => `${r.titer}|${r.value}`).join('||');
                        handleResultChange(tr.key, 'resultValue', updated);
                      };
                      return (
                        <tr key={tr.key} className="border-b border-gray-200 last:border-b-0">
                          <td className="px-4 py-3 text-sm font-bold">{tr.parameterName}</td>
                          {titerList.map((titer) => {
                            const val = currentResults.find(r => r.titer.trim() === titer.trim())?.value || '--';
                            const isPos = val === '+';
                            return (
                              <td key={titer} className="px-2 py-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => updateCell(titer, isPos ? '--' : '+')}
                                  className="font-mono text-sm font-bold text-black cursor-pointer hover:text-gray-600 bg-transparent border-0 outline-none w-full"
                                >
                                  {isPos ? '+' : '--'}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-200">
                <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">Overall Result:</span>
                {['POSITIVE', 'NEGATIVE'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setOverallResults(prev => ({ ...prev, [testName]: opt }))}
                    className={`px-6 py-2 text-sm font-bold uppercase tracking-wide border-2 rounded transition-colors ${
                      (overallResults[testName] || 'NEGATIVE') === opt
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 text-gray-400 hover:border-gray-500 hover:text-gray-600'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </React.Fragment>
          ) : (
            /* Standard Table Layout */
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-4 py-3 text-xs font-bold text-gray-700 uppercase">Parameter</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-700 uppercase">Observed Value</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-700 uppercase">Flag</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-700 uppercase">Reference Range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {params.map((tr, index) => {
                  const showGroup = tr.groupName && (index === 0 || params[index-1].groupName !== tr.groupName);
                  return (
                    <React.Fragment key={tr.key}>
                      {showGroup && (
                        <tr className="bg-blue-50">
                          <td colSpan="4" className="px-4 py-2 text-xs font-bold text-[#00488d] uppercase tracking-wide">{tr.groupName}</td>
                        </tr>
                      )}
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-bold text-gray-800 pl-6">{tr.parameterName}</td>
                        <td className="px-4 py-4">
                          {tr.parameterName?.toUpperCase().includes('TYPHIDOT') ? (
                            <select
                              value={tr.resultValue || ''}
                              onChange={(e) => handleResultChange(tr.key, 'resultValue', e.target.value)}
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-bold focus:outline-none focus:border-[#00488d]"
                            >
                              <option value="">-- Select --</option>
                              <option value="NON-REACTIVE">NON-REACTIVE</option>
                              <option value="REACTIVE">REACTIVE</option>
                              <option value="WEAKLY-REACTIVE">WEAKLY-REACTIVE</option>
                            </select>
                          ) : (tr.parameterName?.toUpperCase().includes('TYPHI') || tr.parameterName?.toUpperCase().includes('WIDAL')) ? (
                            <select
                              value={tr.resultValue || ''}
                              onChange={(e) => handleResultChange(tr.key, 'resultValue', e.target.value)}
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-bold focus:outline-none focus:border-[#00488d]"
                            >
                              <option value="">-- Select --</option>
                              <option value="NEGATIVE">NEGATIVE</option>
                              <option value="POSITIVE">POSITIVE</option>
                              <option value="1:20">1:20</option>
                              <option value="1:40">1:40</option>
                              <option value="1:80">1:80</option>
                              <option value="1:160">1:160</option>
                              <option value="1:320">1:320</option>
                            </select>
                          ) : tr.isQualitative ? (
                            (() => {
                              const rawRange = tr.referenceRange || 'NEGATIVE / POSITIVE';
                              const opts = rawRange.includes('/')
                                ? rawRange.split('/').map(o => o.trim()).filter(Boolean)
                                : rawRange.includes(',')
                                  ? rawRange.split(',').map(o => o.trim()).filter(Boolean)
                                  : [rawRange.trim()];

                              // Map '+' and '-' to POSITIVE/NEGATIVE if present in opts
                              const displayValue = tr.resultValue === '+'
                                ? (opts.includes('POSITIVE') ? 'POSITIVE' : '+')
                                : tr.resultValue === '-'
                                  ? (opts.includes('NEGATIVE') ? 'NEGATIVE' : '-')
                                  : tr.resultValue || '';

                              return (
                                <select
                                  value={displayValue}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    let savedVal = val;
                                    if (val === 'POSITIVE') savedVal = '+';
                                    else if (val === 'NEGATIVE') savedVal = '-';
                                    handleResultChange(tr.key, 'resultValue', savedVal);
                                  }}
                                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-bold focus:outline-none focus:border-[#00488d] cursor-pointer"
                                >
                                  <option value="">-- Select --</option>
                                  {opts.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              );
                            })()
                          ) : (
                            <input type="text" value={tr.resultValue || ''} onChange={(e) => handleResultChange(tr.key, 'resultValue', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-2 text-sm font-bold focus:outline-none focus:border-[#00488d]" />
                          )}
                        </td>
                        <td className="px-4 py-4 w-32">
                          {tr.isQualitative ? (
                            <span className="text-xs text-gray-400">N/A</span>
                          ) : (
                            <select value={tr.flag} onChange={(e) => handleResultChange(tr.key, 'flag', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-[#00488d]">
                              <option value="">Normal</option>
                              <option value="HIGH">HIGH</option>
                              <option value="LOW">LOW</option>
                            </select>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {tr.isQualitative ? (
                            <span className="text-xs text-gray-400">—</span>
                          ) : (
                            <><p className="text-sm text-gray-600">{tr.referenceRange}</p><p className="text-xs text-gray-400">{tr.unit}</p></>
                          )}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
          
          {/* Summary Textarea for this test */}
          <div className="bg-gray-50 border-t border-gray-200 p-4">
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Test Summary / Clinical Notes</label>
            <textarea
              value={testSummaries[params[0]?.testId] || ''}
              onChange={(e) => setTestSummaries(prev => ({ ...prev, [params[0].testId]: e.target.value }))}
              rows="3"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00488d]"
              placeholder="Optional: Add clinical notes, interpretations, or references to display on the report..."
            />
          </div>
        </div>
      );
    });
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#00488d] uppercase tracking-wide">Generate New Report</h2>
        <button onClick={() => navigate('/reports')} className="text-gray-500 hover:text-gray-700 font-bold text-sm">
          Cancel & Return
        </button>
      </div>

      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center">
          <div className={`flex items-center font-bold text-sm ${step === 1 ? 'text-[#00488d]' : 'text-gray-400'}`}>
            <span className={`flex items-center justify-center w-6 h-6 rounded-full mr-2 ${step === 1 ? 'bg-[#00488d] text-white' : 'bg-gray-300 text-white'}`}>1</span>
            Patient & Tests
          </div>
          <div className="w-16 h-px bg-gray-300 mx-4"></div>
          <div className={`flex items-center font-bold text-sm ${step === 2 ? 'text-[#00488d]' : 'text-gray-400'}`}>
            <span className={`flex items-center justify-center w-6 h-6 rounded-full mr-2 ${step === 2 ? 'bg-[#00488d] text-white' : 'bg-gray-300 text-white'}`}>2</span>
            Enter Results
          </div>
        </div>

        {step === 1 && (
          <div className="p-8">
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-gray-700">Select Patient *</label>
                    <button 
                      onClick={() => setShowQRScanner(true)}
                      className="text-xs font-bold text-[#00488d] flex items-center gap-1 hover:underline"
                    >
                      <QrCode className="w-3.5 h-3.5" /> Scan ID Card
                    </button>
                  </div>
                  <Select 
                    options={patientOptions} 
                    value={selectedPatient} 
                    onChange={setSelectedPatient} 
                    isClearable 
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                  />
                  {selectedPatient && (
                    <div className="mt-2 flex justify-end">
                      <button 
                        type="button"
                        onClick={handlePrintLabel}
                        className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                      >
                        Print Sample Label (50x25mm Label)
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Referring Doctor</label>
                  <Select 
                    options={doctorOptions} 
                    value={selectedDoctor} 
                    onChange={setSelectedDoctor} 
                    isClearable 
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                  />
                </div>
              </div>

              {/* Report Date */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Report Date *</label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#00488d] focus:ring-1 focus:ring-[#00488d]"
                />
              </div>

              {/* OCR Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <Camera className="w-24 h-24 text-blue-900" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-start gap-5">
                  <div className="flex-1">
                    <h3 className="text-base font-extrabold text-[#00488d] flex items-center gap-2">
                      <FileText className="w-5 h-5" /> Smart Referral Scanner (OCR)
                    </h3>
                    <p className="text-xs text-blue-800/70 mt-1 mb-4 font-medium max-w-md">
                      Upload a photo of the doctor's referral slip. The system will extract text and automatically select matching tests below.
                    </p>
                    
                    <div>
                      <input 
                        type="file" 
                        id="ocr-upload" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleOcrUpload}
                        disabled={ocrLoading}
                      />
                      <label 
                        htmlFor="ocr-upload" 
                        className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all cursor-pointer ${
                          ocrLoading 
                            ? 'bg-blue-200 text-blue-600 cursor-not-allowed' 
                            : 'bg-white text-[#00488d] border border-blue-300 hover:bg-blue-50 hover:border-blue-400'
                        }`}
                      >
                        {ocrLoading ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing Image...</>
                        ) : (
                          <><Camera className="w-4 h-4" /> Upload Referral Photo</>
                        )}
                      </label>
                    </div>

                    {ocrError && <p className="text-xs font-bold text-red-600 mt-3">{ocrError}</p>}
                    
                    {showOcrText && ocrText && !ocrLoading && (
                      <div className="mt-4 bg-white/60 border border-blue-200 rounded p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black text-blue-800 uppercase tracking-wider">Extracted Text</span>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Auto-selection complete
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar">
                          {ocrText}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Symptom Suggester */}
              <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50 border border-indigo-200 rounded-xl p-5 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Sparkles className="w-24 h-24 text-indigo-900" />
                </div>
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-extrabold text-indigo-900 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-indigo-600" /> AI Diagnostic Assistant
                      </h3>
                      <p className="text-xs text-indigo-800/70 mt-1 font-medium">
                        Describe symptoms and answer clarifying questions to recommend the minimal, most relevant tests.
                      </p>
                    </div>
                    {/* Language Switcher */}
                    <div className="flex bg-indigo-100 p-0.5 rounded-lg text-xs font-bold border border-indigo-200">
                      <button
                        type="button"
                        onClick={() => setAiLang('en')}
                        className={`px-2.5 py-1 rounded-md transition-all ${aiLang === 'en' ? 'bg-white text-indigo-900 shadow-sm' : 'text-indigo-800/60 hover:text-indigo-900'}`}
                      >
                        EN
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiLang('hi')}
                        className={`px-2.5 py-1 rounded-md transition-all ${aiLang === 'hi' ? 'bg-white text-indigo-900 shadow-sm' : 'text-indigo-800/60 hover:text-indigo-900'}`}
                      >
                        हिन्दी
                      </button>
                    </div>
                  </div>

                  {aiStep === 'idle' && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="text" 
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder={aiLang === 'hi' ? 'जैसे, बुखार, ठंड लगना, 3 दिनों से खांसी...' : 'E.g., fever, chills, coughing since 3 days...'}
                        className="flex-1 border border-indigo-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleStartAIAssessment()}
                      />
                      <button 
                        onClick={handleStartAIAssessment}
                        disabled={suggestingTests || !symptoms.trim()}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {suggestingTests ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                        ) : (
                          <><Sparkles className="w-4 h-4" /> Consult AI</>
                        )}
                      </button>
                    </div>
                  )}

                  {aiStep === 'asking' && (
                    <div className="space-y-4 bg-white/60 backdrop-blur-sm border border-indigo-100 rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-indigo-950 uppercase tracking-wider block">
                          {aiLang === 'hi' ? 'एआई स्पष्टीकरण प्रश्न:' : 'AI Clarifying Questions:'}
                        </span>
                        <button onClick={handleResetAIAssessment} className="text-xs text-indigo-600 hover:text-indigo-800 font-bold">
                          {aiLang === 'hi' ? 'पुनः आरंभ करें' : 'Reset'}
                        </button>
                      </div>
                      
                      {aiQuestions.map((q, idx) => (
                        <div key={idx} className="space-y-2">
                          <label className="block text-xs sm:text-sm font-bold text-indigo-900">{q}</label>
                          <input
                            type="text"
                            value={aiAnswers[idx] || ''}
                            onChange={(e) => setAiAnswers(prev => ({ ...prev, [idx]: e.target.value }))}
                            placeholder={aiLang === 'hi' ? 'अपनी प्रतिक्रिया यहाँ लिखें...' : 'Type your response here...'}
                            className="w-full border border-indigo-200 rounded-lg px-3.5 py-2 text-xs sm:text-sm bg-white/90 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      ))}

                      <button
                        onClick={handleGetAILabRecommendations}
                        disabled={suggestingTests}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-70"
                      >
                        {suggestingTests ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing Responses...</>
                        ) : (
                          <><Sparkles className="w-4 h-4" /> Get Minimal Recommended Tests</>
                        )}
                      </button>
                    </div>
                  )}

                  {aiStep === 'results' && (
                    <div className="space-y-4 bg-white/80 border border-indigo-100 rounded-xl p-4">
                      <div className="flex justify-between items-center border-b border-indigo-50 pb-2">
                        <span className="text-xs font-black text-indigo-950 uppercase tracking-wider block">
                          {aiLang === 'hi' ? 'अनुशंसित टेस्ट:' : 'Recommended Minimal Tests:'}
                        </span>
                        <button onClick={handleResetAIAssessment} className="text-xs text-indigo-600 hover:text-indigo-800 font-bold">
                          {aiLang === 'hi' ? 'पुनः आरंभ करें' : 'Reset'}
                        </button>
                      </div>

                      {aiRecommendedTests.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">
                          {aiLang === 'hi' ? 'कोई मिलान वाला टेस्ट नहीं मिला।' : 'No matching tests recommended.'}
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {aiRecommendedTests.map((tName, i) => (
                            <span key={i} className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full">
                              <CheckCircle2 size={12} className="text-indigo-600" />
                              {tName}
                            </span>
                          ))}
                        </div>
                      )}

                      {aiExplanation && (
                        <div className="text-xs bg-slate-50 border border-slate-100 rounded-lg p-3">
                          <strong className="text-slate-800 block mb-1">
                            {aiLang === 'hi' ? 'एआई स्पष्टीकरण:' : 'Reasoning:'}
                          </strong>
                          <p className="text-slate-600 leading-relaxed font-medium">{aiExplanation}</p>
                        </div>
                      )}

                      <button
                        onClick={handleApplyRecommendedTests}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {aiLang === 'hi' ? 'इन टेस्टों को चुनें' : 'Apply Recommended Tests'}
                      </button>
                    </div>
                  )}

                  {suggestedText && aiStep === 'idle' && (
                    <div className="mt-2 bg-white/80 border border-indigo-200 rounded p-3 text-sm">
                      <span className="text-[10px] font-black text-indigo-800 uppercase tracking-wider block mb-1">AI Message:</span>
                      <p className="text-slate-700 font-semibold">{suggestedText}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Test Panels *</label>
                <Select 
                  options={testOptions} 
                  value={selectedTests} 
                  onChange={setSelectedTests} 
                  isMulti 
                  isSearchable 
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                />
              </div>
              <div className="pt-6 flex justify-end">
                <button onClick={handleNextStep} className="bg-[#00488d] hover:bg-[#003875] text-white px-8 py-3 rounded text-sm font-bold">NEXT STEP <ArrowRight className="w-4 h-4 ml-2 inline" /></button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-0">
            <div className="p-6 bg-white min-h-[50vh]">
              {renderGroupedResults()}
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              <button onClick={() => setStep(1)} className="px-6 py-2 border border-gray-300 rounded text-gray-700 font-bold hover:bg-gray-100 flex items-center text-sm">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </button>
              <button disabled={isSubmitting} onClick={handleSubmit} className={`px-8 py-3 rounded text-sm font-bold tracking-wide transition-colors flex items-center ${isSubmitting ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
                {isSubmitting ? 'SAVING...' : 'SAVE & PREVIEW'} {!isSubmitting && <Save className="w-4 h-4 ml-2" />}
              </button>
            </div>
          </div>
        )}

        {showQRScanner && (
          <QRScanner 
            onScan={handleQRScan} 
            onClose={() => setShowQRScanner(false)} 
          />
        )}
      </div>
    </Layout>
  );
};

export default CreateReport;
