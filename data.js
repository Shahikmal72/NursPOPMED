// MASTER REFERENCE CONFIG
// Safe to edit anytime, then refresh the app.
// These values are automatically re-synced into the live database:
// - users (fullname, id, password, role)
// - developers
// - supervisor
// - doctors
// - medications / ivSolutions / medicationProtocols
//
// Do not edit operational runtime data here such as:
// - patients
// - logs
// - inventory quantities created during usage
// unless you intentionally want to change the system seed/defaults.

const MASTER_USERS = [
    { fullname: 'Ms. Arisya Elyana', id: 'Arisya_Elyana', password: 'Arisya123', role: 'Nurse' },
    { fullname: 'Mr. Shah Ikmal', id: 'Shah_Ikmal', password: 'Shah123', role: 'Nurse Manager' },
    { fullname: 'Ms. Leeya Tahirah', id: 'Leeya_Tahirah', password: 'Leeya123', role: 'Nurse' },
    { fullname: 'Ms. Nurul Najwa Rostam', id: 'Najwa_Rostam', password: 'Najwa123', role: 'Nurse' },
    { fullname: 'Mr. Danial Imran', id: 'Danial_Imran', password: 'Dan123', role: 'Nurse' },
    { fullname: 'Dr. Azri Jalil', id: 'Azri_Jalil', password: 'Azri123', role: 'Medical Doctor' },
    { fullname: 'Sir Farhan Mahmud', id: 'Farhan_Mahmud', password: 'Farhan123', role: 'Director of Nursing' },
    { fullname: 'Dr. Syamsul Ahmad Arifin', id: 'Syamsul_Arifin', password: 'Doc123', role: 'Medical Doctor' },
    { fullname: 'Dr. Sarah Zulifli', id: 'Sarah_Zulifli', password: 'Doc123', role: 'Medical Doctor' },
    { fullname: 'Dr. Shidqiyyah Abd Hamid', id: 'Shidqiyyah_Hamid', password: 'Doc123', role: 'Medical Doctor' },
    { fullname: 'Dr. Azmir Ahmad', id: 'Azmir_Ahmad', password: 'Azmir123', role: 'System Assessor' },
    { fullname: 'Dr. Siti Noorkhairina Binti Sowtali', id: 'Siti_Noorkhairina', password: 'Doc123', role: 'Medical Doctor' },
    { fullname: 'Dr. Sanisah Saidi', id: 'Sanisah_Saidi', password: 'Doc123', role: 'Medical Doctor' },
    { fullname: 'Dr. Mohd Said Nurumal', id: 'Mohd_Said', password: 'Doc123', role: 'Medical Doctor' },
    { fullname: 'Dr. Salizar Mohamed Ludin', id: 'Salizar_Ludin', password: 'Doc123', role: 'Medical Doctor' },
    { fullname: 'Dr. Azlina Daud', id: 'Azlina_Daud', password: 'Doc123', role: 'Medical Doctor' },
    { fullname: 'Dr. Siti Roshaidai', id: 'Siti_Roshaidai', password: 'Doc123', role: 'Medical Doctor' },
    { fullname: 'Dr. Kamil Che Hassan', id: 'Kamil_Hassan', password: 'Doc123', role: 'Medical Doctor' },
    { fullname: 'Dr. Khairina Jupri', id: 'Khairina_Jupri', password: 'Khairina123', role: 'Medical Doctor' },
    { fullname: 'Dr. Shazreen', id: 'Shazreen_Arin', password: 'Arin123', role: 'Medical Doctor' },
    { fullname: 'Ms. Nurul Najwa Rostam', id: 'Najwa_Rostam', password: 'Najwa123', role: 'Pharmacist' },
    { fullname: 'Dr. Hasanah Pairoh', id: 'Hasanah_Pairoh', password: 'Hasanah123', role: 'System Assessor' },
];

const MASTER_DEVELOPERS = [
    { name: 'Muhammad Shah Ikmal Junaidi', role: 'System Developer' },
    { name: 'Arisya Elyana Ahmad Fairuz', role: 'Project Coordinator & Architect' },
    { name: 'Nuraleeya Tahirah Mohammad', role: 'Clinical Workflow Analyst' },
    { name: 'Nurshazreen Aqeela Mat Zaib', role: 'Project Coordinator & Quality Lead' },
    { name: 'Siti Nurkhairina Amad Jupri', role: 'Clinical Workflow Designer' }
];

const MASTER_SUPERVISOR = {
    name: 'Dr. Mohd. Azri Abd. Jalil',
    designation: 'Innovation in Nursing Supervisor'
};

const MASTER_DOCTORS = [
    'Dr. Syamsul Ahmad Arifin',
    'Dr. Mohd Azri Abd Jalil',
    'Dr. Sarah Zulifli',
    'Dr. Shidqiyyah Abd Hamid',
    'Dr. Azmir Ahmad',
    'Dr. Siti Noorkhairina Binti Sowtali',
    'Dr. Sanisah Saidi',
    'Dr. Mohd Said Nurumal',
    'Dr. Salizar Mohamed Ludin',
    'Dr. Azlina Daud',
    'Dr. Siti Roshaidai',
    'Dr. Kamil Che Hassan',
    'Dr. Khairina Jupri',
    'Dr. Shazreen',
];

// Initial Data for POPMED System
const initialData = {
    users: MASTER_USERS,
    medications: {
        oral: [
            'Paracetamol 500mg Tablet', 
            'Ibuprofen 400mg Tablet', 
            'Amoxicillin 500mg Capsule', 
            'Metformin 500mg Tablet', 
            'Amlodipine 5mg Tablet', 
            'Simvastatin 20mg Tablet',
            'Aspirin 75mg Tablet',
            'Clopidogrel 75mg Tablet',
            'Bisoprolol 5mg Tablet',
            'Perindopril 4mg Tablet',
            'Gliclazide 80mg Tablet'
        ],
        iv: [
            'Ceftriaxone 1g Injection', 
            'Vancomycin 500mg Injection', 
            'Meropenem 1g Injection', 
            'Furosemide 20mg/2ml Injection', 
            'Pantoprazole 40mg Injection',
            'Gentamicin 80mg Injection',
            'Metronidazole 500mg/100ml IV Infusion',
            'Piperacillin/Tazobactam 4.5g Injection'
        ],
        injection: [
            'Insulin Actrapid (Soluble) SC', 
            'Insulin Insulatard (NPH) SC', 
            'Heparin 5,000 units/ml Injection', 
            'Enoxaparin 40mg/0.4ml Pre-filled Syringe', 
            'Morphine 10mg/ml Injection (Controlled Drug)',
            'Pethidine 50mg/ml Injection (Controlled Drug)'
        ],
        emergency: [
            'Adrenaline 1mg/ml (1:1000) Injection', 
            'Atropine 0.5mg/ml Injection', 
            'Dopamine 200mg/5ml Injection', 
            'Noradrenaline 4mg/4ml Injection',
            'Amiodarone 150mg/3ml Injection',
            'Adenosine 6mg/2ml Injection'
        ],
        others: [
            'Ondansetron 4mg/2ml Injection', 
            'Metoclopramide 10mg/2ml Injection', 
            'Midazolam 5mg/5ml Injection (Sedative)', 
            'Potassium Chloride (KCl) 7.5% Injection (High Alert)', 
            'Magnesium Sulphate (MgSO4) 50% Injection',
            'Calcium Gluconate 10% Injection'
        ]
    },
    // System Development Team
    developers: MASTER_DEVELOPERS,
    supervisor: MASTER_SUPERVISOR,
    ivSolutions: [
        'Sodium Chloride 0.9% (Normal Saline) 500ml Infusion',
        'Sodium Chloride 0.9% (Normal Saline) 1000ml Infusion',
        'Dextrose 5% in Water (D5W) 500ml Infusion',
        'Dextrose 10% in Water (D10W) 500ml Infusion',
        'Dextrose 5% in 0.9% Sodium Chloride (D5NS) 500ml Infusion',
        'Compound Sodium Lactate (Hartmann’s Solution) 500ml Infusion',
        'Ringer’s Lactate 500ml Infusion',
        'Sodium Chloride 0.45% (Half Normal Saline) 500ml Infusion',
        'Sterile Water for Injection (SWFI) 100ml'
    ],
    // Clinical Faculty from Kulliyyah of Nursing (KON), IIUM
    doctors: MASTER_DOCTORS,
    inventory: [], // Pharmacological Inventory
    patients: [], // Clinical Bed Units 1-25
    logs: [], // Clinical Audit Trail
    ivRequests: [],
    // Formal Medication Protocols & Patient Health Education (PHE)
    medicationProtocols: {
        // ANTIBIOTICS
        'Ceftriaxone 1g Injection': {
            isLASA: true,
            lasaNote: 'SOUNDS LIKE: Cefotaxime, Ceftazidime. VERIFY dosage and indication.',
            diluent: '0.9% Sodium Chloride or Sterile Water',
            volume: '10ml for Bolus, 50ml for Infusion',
            instructions: 'Reconstitute 1g vial with 10ml diluent. For IV infusion, further dilute in 50-100ml NS/D5W and administer over 30 minutes.',
            stability: '24 hours at room temperature (25°C)',
            he: {
                reason: 'This is a strong antibiotic used to kill bacteria and treat serious infections in different parts of your body.',
                sideEffects: 'You might experience loose stools (diarrhea), a mild skin rash, or some redness/soreness where the needle is placed.',
                citation: 'British National Formulary. (2024). Ceftriaxone. https://bnf.nice.org.uk/drug/ceftriaxone.html'
            }
        },
        'Vancomycin 500mg Injection': {
            isHighAlert: true,
            diluent: '0.9% Sodium Chloride or 5% Dextrose',
            volume: '100ml to 250ml',
            instructions: 'Reconstitute with 10ml SWFI. Further dilute to a concentration not exceeding 5mg/ml. Administer via slow infusion over at least 60 minutes to mitigate Red Man Syndrome.',
            stability: 'Discard after 24 hours post-reconstitution',
            he: {
                reason: 'This is a specialized antibiotic used for very tough infections that other medicines cannot treat.',
                sideEffects: 'Tell your nurse if you feel sudden warmth, itching, or redness on your upper body (flushing). It may also affect your ears or kidneys if not monitored.',
                citation: 'MIMS Malaysia. (2024). Vancomycin. https://www.mims.com/malaysia/drug/info/vancomycin'
            }
        },
        'Meropenem 1g Injection': {
            diluent: 'Sterile Water for Injection',
            volume: '20ml for Bolus',
            instructions: 'Reconstitute with 20ml SWFI. Administer over 3-5 minutes or dilute further in 50-100ml for infusion over 15-30 minutes.',
            stability: 'Utilize within 2 hours if stored at room temperature',
            he: {
                reason: 'Carbapenem antibiotic for life-threatening multi-drug resistant infections.',
                sideEffects: 'Nausea, vomiting, headache, localized inflammatory response.',
                citation: 'British National Formulary. (2024). Meropenem. https://bnf.nice.org.uk/drug/meropenem.html'
            }
        },
        'Amoxicillin 500mg Capsule': {
            diluent: 'Not Applicable (Oral)',
            volume: 'Not Applicable',
            instructions: 'Administer orally with or without food. Emphasize adherence to the complete therapeutic course.',
            stability: 'Store in a cool, dry place',
            he: {
                reason: 'Penicillin-type antibiotic for respiratory, ear, and soft tissue infections.',
                sideEffects: 'Gastrointestinal upset, vomiting, diarrhea.',
                citation: 'MIMS Malaysia. (2024). Amoxicillin. https://www.mims.com/malaysia/drug/info/amoxicillin'
            }
        },
        'Gentamicin 80mg Injection': {
            diluent: '0.9% Sodium Chloride or 5% Dextrose',
            volume: '50ml to 100ml',
            instructions: 'Administer via infusion over 30 to 60 minutes. Conduct therapeutic drug monitoring (TDM) and renal function tests.',
            stability: 'Stable for 24 hours at room temperature',
            he: {
                reason: 'Aminoglycoside antibiotic for severe gram-negative sepsis.',
                sideEffects: 'Vestibular toxicity (dizziness), ototoxicity, renal impairment.',
                citation: 'Lexicomp. (2024). Gentamicin (systemic). https://online.lexi.com'
            }
        },
        'Metronidazole 500mg/100ml IV Infusion': {
            isLASA: true,
            lasaNote: 'SOUNDS LIKE: Metformin. VERIFY indication (Infection vs Diabetes).',
            diluent: 'Premixed Formulation',
            volume: '100ml',
            instructions: 'Administer via slow IV infusion over 30-60 minutes. Protect from refrigeration to avoid crystallization.',
            stability: 'Utilize immediately upon compromising seal',
            he: {
                reason: 'Nitroimidazole antibiotic for anaerobic bacterial and protozoal infections.',
                sideEffects: 'Metallic dysgeusia (taste), chromaturia (dark urine), nausea.',
                citation: 'British National Formulary. (2024). Metronidazole. https://bnf.nice.org.uk/drug/metronidazole.html'
            }
        },
        'Piperacillin/Tazobactam 4.5g Injection': {
            diluent: '0.9% Sodium Chloride or Sterile Water',
            volume: '20ml for reconstitution',
            instructions: 'Reconstitute with 20ml. Further dilute in 50-150ml NS/D5W and administer via infusion over 30 minutes.',
            stability: '24 hours under refrigeration (2-8°C)',
            he: {
                reason: 'Combination penicillin/beta-lactamase inhibitor for complex infections.',
                sideEffects: 'Constipation, insomnia, cephalalgia (headache).',
                citation: 'Ministry of Health Malaysia. (2024). National Essential Medicine List. https://www.pharmacy.gov.my'
            }
        },

        // INSULINS
        'Insulin Actrapid (Soluble) SC': {
            isHighAlert: true,
            isLASA: true,
            lasaNote: 'LOOKS LIKE: Other Insulin vials (e.g. Insulatard). CHECK LABEL COLOR.',
            diluent: 'Not Applicable (Ready-to-use)',
            volume: 'Units as per clinical prescription',
            instructions: 'Short-acting insulin. Administer 30 minutes pre-prandial. Validate capillary blood glucose (CBG) prior to administration.',
            stability: 'In-use vial stable at room temperature for 28 days',
            he: {
                reason: 'This is a fast-acting insulin used to lower your blood sugar after you eat a meal.',
                sideEffects: 'Watch for signs of low blood sugar (hypoglycemia) like feeling shaky, sweaty, very hungry, or confused.',
                citation: 'American Diabetes Association. (2024). Standards of Care in Diabetes—2024. https://doi.org/10.2337/dc24-Sint'
            }
        },
        'Insulin Insulatard (NPH) SC': {
            isHighAlert: true,
            isLASA: true,
            lasaNote: 'LOOKS LIKE: Other Insulin vials (e.g. Actrapid). CHECK LABEL COLOR.',
            diluent: 'Not Applicable (Ready-to-use)',
            volume: 'Units as per clinical prescription',
            instructions: 'Intermediate-acting insulin. Agitate vial gently until uniform suspension is achieved. Administer via subcutaneous route.',
            stability: 'In-use vial stable at room temperature for 28 days',
            he: {
                reason: 'This is a slow-acting insulin that helps keep your blood sugar steady throughout the day and night.',
                sideEffects: 'Low blood sugar, weight changes, or mild skin irritation where the medicine is injected.',
                citation: 'International Diabetes Federation. (2024). IDF Diabetes Atlas (10th ed.). https://www.diabetesatlas.org'
            }
        },

        // ANALGESICS / OTHERS
        'Paracetamol 500mg Tablet': {
            diluent: 'Not Applicable',
            volume: 'Not Applicable',
            instructions: 'Maximum cumulative dose of 4g per 24 hours. Monitor hepatic function in chronic utilization.',
            stability: 'Stable at room temperature',
            he: {
                reason: 'This medicine is used to relieve mild to moderate pain and reduce a high fever.',
                sideEffects: 'This medicine is usually very safe, but too much can cause liver problems. Do not take other medicines that also contain paracetamol.',
                citation: 'World Health Organization. (2024). WHO Guidelines on the Management of Cancer Pain in Adults and Adolescents. https://www.who.int'
            }
        },
        'Morphine 10mg/ml Injection (Controlled Drug)': {
            isHighAlert: true,
            diluent: '0.9% Sodium Chloride or 5% Dextrose',
            volume: '10ml or greater',
            instructions: 'Dilute 10mg in at least 10ml NS. Administer slowly over 4-5 minutes. Continuous respiratory rate monitoring mandatory.',
            stability: 'Photosensitive; protect from light',
            he: {
                reason: 'This is a powerful painkiller used for severe pain when other medicines are not enough.',
                sideEffects: 'You may feel very sleepy, constipated, or itchy. It can also slow down your breathing, which we will monitor closely.',
                citation: 'British National Formulary. (2024). Morphine. https://bnf.nice.org.uk/drug/morphine.html'
            }
        },
        'Furosemide 20mg/2ml Injection': {
            diluent: 'Undiluted or 0.9% Sodium Chloride',
            volume: 'Not Applicable',
            instructions: 'Administer slow IV bolus at a rate ≤ 4mg/min to prevent ototoxicity.',
            stability: 'Photosensitive; protect from light',
            he: {
                reason: 'This is a "water pill" that helps your body get rid of extra fluid and reduces swelling (edema).',
                sideEffects: 'You will likely need to urinate more often. It can also cause dehydration or low levels of minerals like potassium in your blood.',
                citation: 'MIMS Malaysia. (2024). Furosemide. https://www.mims.com/malaysia/drug/info/furosemide'
            }
        },
        'Potassium Chloride (KCl) 7.5% Injection (High Alert)': {
            isHighAlert: true,
            diluent: 'NS or D5W (CONTRAINDICATED UNDILUTED)',
            volume: '500ml or 1000ml',
            instructions: 'HIGH ALERT MEDICATION: Absolute requirement for dilution. Maximum concentration 40mmol/L. Infusion rate ≤ 10-20mmol/hr with continuous ECG monitoring.',
            stability: 'Ensure thorough homogenization post-addition to IV bag',
            he: {
                reason: 'This is a mineral supplement used to treat low potassium levels in your blood, which is important for your heart and muscles.',
                sideEffects: 'It can cause stomach upset or nausea. If given too quickly, it can cause dangerous changes to your heartbeat.',
                citation: 'Ministry of Health Malaysia. (2024). Clinical Practice Guidelines: Management of Electrolyte Imbalance. https://www.moh.gov.my'
            }
        },
        'Pantoprazole 40mg Injection': {
            diluent: '0.9% Sodium Chloride',
            volume: '10ml for bolus, 100ml for infusion',
            instructions: 'Reconstitute with 10ml NS. Administer over 2-5 minutes. For infusion, dilute in 100ml NS/D5W and administer over 15 minutes.',
            stability: '12 hours post-reconstitution',
            he: {
                reason: 'This medicine helps reduce the amount of acid your stomach makes, which helps heal ulcers and treat severe heartburn.',
                sideEffects: 'You might have some mild diarrhea, joint pain, or feel a bit gassy.',
                citation: 'MIMS Malaysia. (2024). Pantoprazole. https://www.mims.com/malaysia/drug/info/pantoprazole'
            }
        },
        'Ibuprofen 400mg Tablet': {
            diluent: 'Not Applicable', volume: 'Not Applicable',
            instructions: 'Administer with food to mitigate gastric mucosal irritation. Limit to 1.2g/day unless clinically supervised.',
            stability: 'Stable',
            he: { 
                reason: 'This medicine reduces pain and swelling (inflammation).', 
                sideEffects: 'It can cause stomach ache or heartburn. Taking it with food helps prevent this.', 
                citation: 'U.S. Food and Drug Administration. (2024). Ibuprofen Information. https://www.fda.gov' 
            }
        },
        'Metformin 500mg Tablet': {
            isLASA: true,
            lasaNote: 'SOUNDS LIKE: Metronidazole. VERIFY indication (Diabetes vs Infection).',
            diluent: 'Not Applicable', volume: 'Not Applicable',
            instructions: 'Administer with meals to reduce gastrointestinal side effects. Regularly monitor renal function (eGFR).',
            stability: 'Stable',
            he: { 
                reason: 'This medicine helps lower your blood sugar levels by helping your body use insulin better.', 
                sideEffects: 'You might have a metallic taste in your mouth, or feel some stomach upset like diarrhea or nausea when you first start.', 
                citation: 'American Diabetes Association. (2024). Standards of Care in Diabetes—2024. https://doi.org/10.2337/dc24-Sint' 
            }
        },
        'Amlodipine 5mg Tablet': {
            diluent: 'Not Applicable', volume: 'Not Applicable',
            instructions: 'Monitor blood pressure parameters. Avoid concurrent consumption of grapefruit juice.',
            stability: 'Stable',
            he: { 
                reason: 'This medicine helps lower your blood pressure and prevents chest pain (angina) by relaxing your blood vessels.', 
                sideEffects: 'Some people notice swelling in their ankles, feel a bit dizzy, or have a warm/flushed face.', 
                citation: 'American Heart Association. (2024). 2024 Focused Update of the 2017 ACC/AHA/AAPA/ABC/ACPM/AGS/APhA/ASPC/NMA/PCNA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults. https://www.heart.org' 
            }
        },
        'Simvastatin 20mg Tablet': {
            diluent: 'Not Applicable', volume: 'Not Applicable',
            instructions: 'Optimal administration at nocte (evening). Avoid significant intake of grapefruit juice.',
            stability: 'Stable',
            he: { 
                reason: 'HMG-CoA reductase inhibitor (statin) for hyperlipidemia.', 
                sideEffects: 'Myalgia (muscle pain), weakness, hepatic transaminase elevation.', 
                citation: 'National Institute for Health and Care Excellence. (2024). Cardiovascular disease: risk assessment and reduction, including lipid-modifying therapy. https://www.nice.org.uk/guidance/cg181' 
            }
        },
        'Heparin 5,000 units/ml Injection': {
            isHighAlert: true,
            diluent: 'Not Applicable', volume: 'Not Applicable',
            instructions: 'Administer SC in abdominal adipose tissue. Avoid site massage. Monitor APTT for IV therapeutic use.',
            stability: 'Stable',
            he: { 
                reason: 'Anticoagulant for prophylaxis and treatment of thromboembolic disorders.', 
                sideEffects: 'Ecchymosis (bruising), hemorrhage (bleeding), injection site irritation.', 
                citation: 'American College of Chest Physicians. (2024). Antithrombotic Therapy and Prevention of Thrombosis (10th ed.). https://www.chestnet.org' 
            }
        },
        'Enoxaparin 40mg/0.4ml Pre-filled Syringe': {
            isHighAlert: true,
            diluent: 'Not Applicable', volume: 'Not Applicable',
            instructions: 'Administer SC. Do not expel the nitrogen air bubble prior to injection.',
            stability: 'Stable',
            he: { 
                reason: 'Low molecular weight heparin (LMWH) for DVT prophylaxis.', 
                sideEffects: 'Hemorrhage, anemia, localized pain.', 
                citation: 'MIMS Malaysia. (2024). Enoxaparin. https://www.mims.com/malaysia/drug/info/enoxaparin' 
            }
        },
        'Pethidine 50mg/ml Injection (Controlled Drug)': {
            isHighAlert: true,
            diluent: '0.9% Sodium Chloride', volume: '10ml',
            instructions: 'HIGH ALERT: Opioid analgesic. Reconstitute and administer slowly over 3-5 minutes. Respiratory monitoring required.',
            stability: 'Stable',
            he: { 
                reason: 'Strong painkiller for moderate to severe pain.', 
                sideEffects: 'Drowsiness, nausea, dizziness, respiratory depression.', 
                citation: 'British National Formulary. (2024). Pethidine. https://bnf.nice.org.uk/drug/pethidine-hydrochloride.html' 
            }
        },
        'Atropine 0.5mg/ml Injection': {
            isHighAlert: true,
            diluent: 'Undiluted', volume: 'Not Applicable',
            instructions: 'EMERGENCY: Rapid IV bolus for symptomatic bradycardia. Monitor HR and rhythm.',
            stability: 'Stable',
            he: { 
                reason: 'Increases heart rate during clinical bradycardia.', 
                sideEffects: 'Dry mouth, blurred vision, tachycardia.', 
                citation: 'American Heart Association. (2024). Advanced Cardiovascular Life Support (ACLS) Guidelines. https://cpr.heart.org' 
            }
        },
        'Adenosine 6mg/2ml Injection': {
            isHighAlert: true,
            diluent: 'Undiluted (Rapid Flush)', volume: 'Not Applicable',
            instructions: 'EMERGENCY: Rapid IV push (1-2 seconds) followed immediately by 20ml NS flush. Continuous ECG required.',
            stability: 'Stable',
            he: { 
                reason: 'Used to restore normal heart rhythm in certain types of fast heartbeats.', 
                sideEffects: 'Chest pressure, facial flushing, brief period of asystole.', 
                citation: 'American Heart Association. (2024). Advanced Cardiovascular Life Support (ACLS) Guidelines. https://cpr.heart.org' 
            }
        },
        'Adrenaline 1mg/ml (1:1000) Injection': {
            isHighAlert: true,
            isLASA: true,
            lasaNote: 'SOUNDS LIKE: Ephedrine. DO NOT CONFUSE. Adrenaline is much more potent.',
            diluent: '0.9% Sodium Chloride for infusion', volume: '50ml',
            instructions: 'EMERGENCY PROTOCOL: IM for anaphylaxis, IV for cardiac arrest (dilution 1:10,000). Continuous hemodynamic monitoring required.',
            stability: 'Discard if solution exhibits brownish/pinkish discoloration',
            he: { 
                reason: 'Sympathomimetic catecholamine for anaphylaxis and cardiac resuscitation.', 
                sideEffects: 'Tachycardia, anxiety, palpitations.', 
                citation: 'American Heart Association. (2024). Advanced Cardiovascular Life Support (ACLS) Guidelines. https://cpr.heart.org' 
            }
        },
        'Aspirin 75mg Tablet': {
            diluent: 'Not Applicable', volume: 'Not Applicable',
            instructions: 'Administer with or post-prandial. Dispersible tablets may be dissolved in water.',
            stability: 'Stable',
            he: { 
                reason: 'Antiplatelet agent for secondary prevention of cardiovascular events.', 
                sideEffects: 'Dyspepsia, increased hemorrhagic risk.', 
                citation: 'British National Formulary. (2024). Aspirin. https://bnf.nice.org.uk/drug/aspirin.html' 
            }
        },
        'Clopidogrel 75mg Tablet': {
            diluent: 'Not Applicable', volume: 'Not Applicable',
            instructions: 'May be administered without regard to food. Monitor for clinical signs of hemorrhage.',
            stability: 'Stable',
            he: { 
                reason: 'P2Y12 inhibitor antiplatelet agent for thromboprophylaxis.', 
                sideEffects: 'Increased bleeding risk, easy bruising, gastrointestinal distress.', 
                citation: 'American Heart Association. (2024). 2024 ACC/AHA Guideline for the Management of Patients With Chronic Coronary Disease. https://www.heart.org' 
            }
        },
        'Bisoprolol 5mg Tablet': {
            diluent: 'Not Applicable', volume: 'Not Applicable',
            instructions: 'Administer in the morning. Avoid abrupt cessation to prevent rebound hypertension/tachycardia.',
            stability: 'Stable',
            he: { 
                reason: 'Selective beta-1 blocker for hypertension and heart rate management.', 
                sideEffects: 'Peripheral coldness, fatigue, bradycardia (slow heart rate).', 
                citation: 'American Heart Association. (2024). 2024 ACC/AHA/AMSSM/HRS/NASCI/SCAI/SCCT/SCMR/STS Guideline for the Management of Patients With Chronic Coronary Disease. https://www.heart.org' 
            }
        },
        'Perindopril 4mg Tablet': {
            diluent: 'Not Applicable', volume: 'Not Applicable',
            instructions: 'Administer on an empty stomach, preferably 30 minutes pre-breakfast.',
            stability: 'Stable',
            he: { 
                reason: 'ACE inhibitor for management of hypertension and congestive heart failure.', 
                sideEffects: 'Unproductive dry cough, dizziness, hyperkalemia.', 
                citation: 'National Institute for Health and Care Excellence. (2024). Hypertension in adults: diagnosis and management. https://www.nice.org.uk/guidance/ng136' 
            }
        },
        'Gliclazide 80mg Tablet': {
            diluent: 'Not Applicable', volume: 'Not Applicable',
            instructions: 'Administer with breakfast. Educate patient on clinical signs of hypoglycemia.',
            stability: 'Stable',
            he: { 
                reason: 'Sulfonylurea for glycemic management in Type 2 Diabetes.', 
                sideEffects: 'Hypoglycemia, weight gain, GI distress.', 
                citation: 'International Diabetes Federation. (2024). Clinical Practice Recommendations for managing Type 2 Diabetes in Primary Care. https://www.idf.org' 
            }
        },
        'Dopamine 200mg/5ml Injection': {
            isHighAlert: true,
            isLASA: true,
            lasaNote: 'SOUNDS LIKE: Dobutamine. VERIFY dosage and clinical indication.',
            diluent: '0.9% Sodium Chloride or 5% Dextrose', volume: '250ml to 500ml',
            instructions: 'HIGH ALERT: Central venous access preferred. Utilize infusion pump. Continuous BP and HR monitoring mandatory.',
            stability: '24 hours in 5% Dextrose',
            he: { 
                reason: 'Inotropic/vasopressor agent for hemodynamic support in shock.', 
                sideEffects: 'Arrhythmias, hypertension, tissue necrosis upon extravasation.', 
                citation: 'Lexicomp. (2024). Dopamine (systemic). https://online.lexi.com' 
            }
        },
        'Noradrenaline 4mg/4ml Injection': {
            isHighAlert: true,
            diluent: '5% Dextrose (Standard)', volume: '50ml or 250ml',
            instructions: 'HIGH ALERT: Continuous infusion via pump. Hemodynamic monitoring every 2-5 minutes during titration.',
            stability: 'Photosensitive; protect from light',
            he: { 
                reason: 'Alpha-adrenergic agonist vasopressor for septic shock management.', 
                sideEffects: 'Severe hypertension, bradycardia, peripheral ischemia.', 
                citation: 'Surviving Sepsis Campaign. (2024). International Guidelines for Management of Sepsis and Septic Shock. https://www.sccm.org' 
            }
        },
        'Amiodarone 150mg/3ml Injection': {
            isHighAlert: true,
            diluent: '5% Dextrose EXCLUSIVELY', volume: '100ml to 250ml',
            instructions: 'Contraindicated with 0.9% NaCl. Utilize non-PVC administration sets and inline filters if available. Monitor ECG and BP.',
            stability: 'Stable in 5% Dextrose',
            he: { 
                reason: 'Class III antiarrhythmic for life-threatening ventricular arrhythmias.', 
                sideEffects: 'Hypotension, bradycardia, hepatic dysfunction, thyroid abnormalities.', 
                citation: 'European Resuscitation Council. (2024). ERC Guidelines for Resuscitation 2024. https://www.erc.edu' 
            }
        },
        'Ondansetron 4mg/2ml Injection': {
            diluent: 'Undiluted or 0.9% Sodium Chloride', volume: '50ml',
            instructions: 'Administer over 2-5 minutes. Monitor for QT interval prolongation.',
            stability: 'Stable',
            he: { 
                reason: '5-HT3 receptor antagonist antiemetic for post-operative or chemo-induced nausea.', 
                sideEffects: 'Cephalalgia, constipation, dizziness, rare cardiac dysrhythmias.', 
                citation: 'MIMS Malaysia. (2024). Ondansetron. https://www.mims.com/malaysia/drug/info/ondansetron' 
            }
        },
        'Metoclopramide 10mg/2ml Injection': {
            diluent: 'Undiluted', volume: 'Not Applicable',
            instructions: 'Administer via slow IV bolus over 1-2 minutes to mitigate transient acute anxiety.',
            stability: 'Stable',
            he: { 
                reason: 'Dopamine antagonist prokinetic and antiemetic.', 
                sideEffects: 'Drowsiness, restlessness, extrapyramidal symptoms.', 
                citation: 'British National Formulary. (2024). Metoclopramide. https://bnf.nice.org.uk/drug/metoclopramide-hydrochloride.html' 
            }
        },
        'Midazolam 5mg/5ml Injection (Sedative)': {
            isHighAlert: true,
            diluent: '0.9% Sodium Chloride or 5% Dextrose', volume: 'Variable',
            instructions: 'HIGH ALERT: Continuous respiratory rate and oxygen saturation monitoring mandatory.',
            stability: 'Stable', 
            he: { 
                reason: 'Benzodiazepine for conscious sedation and anxiolysis.', 
                sideEffects: 'Respiratory depression, sedation, anterograde amnesia.', 
                citation: 'American Society of Anesthesiologists. (2024). Practice Guidelines for Moderate Procedural Sedation and Analgesia 2024. https://www.asahq.org' 
            }
        },
        'Magnesium Sulphate (MgSO4) 50% Injection': {
            isHighAlert: true,
            diluent: '0.9% Sodium Chloride or 5% Dextrose', volume: '100ml to 250ml',
            instructions: 'HIGH ALERT: Monitor deep tendon reflexes (DTR), RR, and urine output. Frequent BP monitoring required.',
            stability: 'Stable',
            he: { 
                reason: 'Management of hypomagnesemia and seizure prophylaxis in eclampsia.', 
                sideEffects: 'Flushing, hypotension, neuromuscular blockade (weakness).', 
                citation: 'World Health Organization. (2024). WHO Recommendations for Prevention and Treatment of Pre-eclampsia and Eclampsia. https://www.who.int' 
            }
        },
        'Calcium Gluconate 10% Injection': {
            diluent: '0.9% Sodium Chloride or 5% Dextrose', volume: '50ml to 100ml',
            instructions: 'Administer slowly (1.5-2ml/min). Monitor for bradycardia and extravasation site irritation.',
            stability: 'Stable',
            he: { 
                reason: 'Treatment of hypocalcemia and cardiac stabilization in hyperkalemia.', 
                sideEffects: 'Peripheral tingling, metallic taste, cardiac arrhythmias.', 
                citation: 'Lexicomp. (2024). Calcium Gluconate (systemic). https://online.lexi.com' 
            }
        },

        // IV SOLUTIONS
        'Sodium Chloride 0.9% (Normal Saline) 500ml Infusion': {
            diluent: 'Premixed Formulation', volume: '500ml',
            instructions: 'Isotonic crystalloid. Monitor for clinical signs of fluid overload, particularly in geriatric or renal-impaired cohorts.',
            stability: 'Utilize immediately upon compromising seal',
            he: { 
                reason: 'Fluid resuscitation and electrolyte restoration; utilized as a primary vehicle for IV therapeutics.', 
                sideEffects: 'Fluid overload, hypernatremia, peripheral edema.', 
                citation: 'MIMS Malaysia. (2024). Sodium Chloride. https://www.mims.com/malaysia/drug/info/sodium%20chloride' 
            }
        },
        'Sodium Chloride 0.9% (Normal Saline) 1000ml Infusion': {
            diluent: 'Premixed Formulation', volume: '1000ml',
            instructions: 'Isotonic crystalloid. Monitor for clinical signs of fluid overload, particularly in geriatric or renal-impaired cohorts.',
            stability: 'Utilize immediately upon compromising seal',
            he: { 
                reason: 'Fluid resuscitation and electrolyte restoration; utilized as a primary vehicle for IV therapeutics.', 
                sideEffects: 'Fluid overload, hypernatremia, peripheral edema.', 
                citation: 'MIMS Malaysia. (2024). Sodium Chloride. https://www.mims.com/malaysia/drug/info/sodium%20chloride' 
            }
        },
        'Dextrose 5% in Water (D5W) 500ml Infusion': {
            diluent: 'Premixed Formulation', volume: '500ml',
            instructions: 'Isotonic/Hypotonic crystalloid in vivo. Provides metabolic calories and electrolyte-free water. Monitor blood glucose.',
            stability: 'Utilize immediately upon compromising seal',
            he: { 
                reason: 'Hydration therapy and caloric supplementation.', 
                sideEffects: 'Hyperglycemia, fluid overload, hyponatremia.', 
                citation: 'British National Formulary. (2024). Glucose. https://bnf.nice.org.uk/drug/glucose.html' 
            }
        },
        'Dextrose 10% in Water (D10W) 500ml Infusion': {
            diluent: 'Premixed Formulation', volume: '500ml',
            instructions: 'Hypertonic crystalloid. Central venous access recommended to prevent venous sclerosis. Monitor blood glucose.',
            stability: 'Utilize immediately upon compromising seal',
            he: { 
                reason: 'Management of refractory hypoglycemia and augmented caloric intake.', 
                sideEffects: 'Venous irritation, hyperglycemia, osmotic diuresis.', 
                citation: 'Ministry of Health Malaysia. (2024). National Essential Medicine List. https://www.pharmacy.gov.my' 
            }
        },
        'Dextrose 5% in 0.9% Sodium Chloride (D5NS) 500ml Infusion': {
            diluent: 'Premixed Formulation', volume: '500ml',
            instructions: 'Hypertonic crystalloid. Provides calories and maintains electrolyte homeostasis. Monitor for fluid overload.',
            stability: 'Utilize immediately upon compromising seal',
            he: { 
                reason: 'Maintenance fluid providing both electrolyte and metabolic support.', 
                sideEffects: 'Fluid overload, hypernatremia, hyperglycemia.', 
                citation: 'Kulliyyah of Nursing, IIUM. (2024). Clinical Practice Guidelines for IV Fluid Management.' 
            }
        },
        'Compound Sodium Lactate (Hartmann’s Solution) 500ml Infusion': {
            diluent: 'Premixed Formulation', volume: '500ml',
            instructions: 'Isotonic balanced salt solution. Contains potassium; exercise caution in hyperkalemic states.',
            stability: 'Utilize immediately upon compromising seal',
            he: { 
                reason: 'Physiological fluid replacement for trauma, surgery, or burns; mitigates metabolic acidosis.', 
                sideEffects: 'Fluid overload, hyperkalemia (large volume administration).', 
                citation: 'World Health Organization. (2024). WHO Model Formulary 2024. https://www.who.int' 
            }
        },
        'Ringer’s Lactate 500ml Infusion': {
            diluent: 'Premixed Formulation', volume: '500ml',
            instructions: 'Isotonic crystalloid. Monitor serum electrolytes and fluid balance parameters.',
            stability: 'Utilize immediately upon compromising seal',
            he: { 
                reason: 'Crystalloid replacement for dehydration and perioperative fluid management.', 
                sideEffects: 'Electrolyte derangement, fluid overload.', 
                citation: 'MIMS Malaysia. (2024). Ringer\'s Lactate. https://www.mims.com/malaysia/drug/info/ringer\'s%20lactate' 
            }
        },
        'Sodium Chloride 0.45% (Half Normal Saline) 500ml Infusion': {
            diluent: 'Premixed Formulation', volume: '500ml',
            instructions: 'Hypotonic crystalloid. Utilize with extreme caution to prevent hyponatremia and cerebral edema.',
            stability: 'Utilize immediately upon compromising seal',
            he: { 
                reason: 'Management of intracellular dehydration and hypernatremic states.', 
                sideEffects: 'Hyponatremia, cellular swelling (cerebral edema risk).', 
                citation: 'British National Formulary. (2024). Sodium Chloride. https://bnf.nice.org.uk/drug/sodium-chloride.html' 
            }
        },
        'Sterile Water for Injection (SWFI) 100ml': {
            diluent: 'Not Applicable', volume: '100ml',
            instructions: 'STRICTLY CONTRAINDICATED FOR DIRECT IV ADMINISTRATION. Used solely for reconstitution of pharmacological agents.',
            stability: 'Utilize immediately upon compromising seal',
            he: { 
                reason: 'Sterile diluent for reconstitution and preparation of injectable medications.', 
                sideEffects: 'Lethal hemolysis if administered directly IV.', 
                citation: 'MIMS Malaysia. (2024). Sterile Water for Injection. https://www.mims.com/malaysia/drug/info/sterile%20water%20for%20injection' 
            }
        }
    }
};

const POPMED_SHARED_HE_REFERENCES = {
    medlineplus: 'National Library of Medicine. (2025). MedlinePlus: Drugs, herbs and supplements. U.S. National Library of Medicine. https://medlineplus.gov/druginformation.html',
    fdaMedicines: 'U.S. Food and Drug Administration. (2025, May 14). Learn about your medicines. https://www.fda.gov/patients/learn-about-your-medicines',
    fdaDrugInfo: 'U.S. Food and Drug Administration. (2025, May 14). Find information about a drug. https://www.fda.gov/drugs/information-consumers-and-patients-drugs/find-information-about-drug'
};

function uniqueCitations(citations) {
    return [...new Set(citations.filter(Boolean))];
}

function randomChoice(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function createInventoryLot(quantity = 0, expiry = null, batch = null) {
    const now = new Date();
    const fallbackExpiry = expiry || new Date(now.getTime() + (180 + Math.floor(Math.random() * 720)) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

    return {
        id: `LOT-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        batch: batch || `LOT-${Math.floor(Math.random() * 9000) + 1000}`,
        expiry: fallbackExpiry,
        quantity: parseInt(quantity, 10) || 0
    };
}

function createRandomTodayTimestamp(baseDate = new Date(), minMinutesAgo = 10, maxMinutesAgo = 720) {
    const minutesAgo = Math.floor(Math.random() * (maxMinutesAgo - minMinutesAgo + 1)) + minMinutesAgo;
    return new Date(baseDate.getTime() - (minutesAgo * 60 * 1000)).toISOString();
}

function ensureInventoryLotDepth(item, extraLots = 0) {
    if (!item) return item;
    if (!Array.isArray(item.lots)) item.lots = [];

    for (let i = 0; i < extraLots; i++) {
        item.lots.push(
            createInventoryLot(
                40 + Math.floor(Math.random() * 260),
                new Date(Date.now() + (60 + Math.floor(Math.random() * 720)) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            )
        );
    }

    return refreshInventoryDerivedFields(item);
}

function normalizeOperationalData(db) {
    if (!db || typeof db !== 'object') return db;

    if (Array.isArray(db.inventory)) {
        db.inventory.forEach(item => {
            if (!Array.isArray(item.lots) || item.lots.length < 2) {
                ensureInventoryLotDepth(item, Math.max(0, 2 - (item.lots?.length || 0)));
            } else {
                refreshInventoryDerivedFields(item);
            }
        });
    }

    if (Array.isArray(db.patients)) {
        let missedCounter = 0;
        db.patients.forEach(patient => {
            if (!Array.isArray(patient.medications)) return;
            patient.medications.forEach(med => {
                if (!med.prescribingDoctor) {
                    med.prescribingDoctor = randomChoice(initialData.doctors);
                }
                if (!med.prescribedAt) {
                    med.prescribedAt = createRandomTodayTimestamp(new Date(), 20, 720);
                }

                if (med.status === 'Missed') {
                    missedCounter++;
                    if (missedCounter > 6) {
                        med.status = 'Pending';
                        med.justification = null;
                        med.remarks = '';
                        med.timeAdministered = null;
                        med.timeDue = new Date(Date.now() + (30 + Math.floor(Math.random() * 240)) * 60000).toISOString();
                    }
                }
            });
        });
    }

    return db;
}

function refreshInventoryDerivedFields(item) {
    if (!item) return item;

    if (!Array.isArray(item.lots) || item.lots.length === 0) {
        item.lots = [createInventoryLot(item.quantity || 0, item.expiry, item.batch)];
    }

    item.lots = item.lots
        .map(lot => ({
            id: lot.id || `LOT-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            batch: lot.batch || item.batch || `LOT-${Math.floor(Math.random() * 9000) + 1000}`,
            expiry: lot.expiry || item.expiry || new Date().toISOString().split('T')[0],
            quantity: parseInt(lot.quantity, 10) || 0
        }))
        .sort((a, b) => new Date(a.expiry) - new Date(b.expiry));

    const totalQty = item.lots.reduce((sum, lot) => sum + lot.quantity, 0);
    const primaryLot = item.lots.find(lot => lot.quantity > 0) || item.lots[0] || createInventoryLot(0, item.expiry, item.batch);

    item.quantity = totalQty;
    item.batch = primaryLot.batch;
    item.expiry = primaryLot.expiry;
    item.expiryDate = (() => {
        const expiryDate = new Date(primaryLot.expiry);
        if (Number.isNaN(expiryDate.getTime())) return item.expiryDate || primaryLot.expiry;
        const day = String(expiryDate.getDate()).padStart(2, '0');
        const month = String(expiryDate.getMonth() + 1).padStart(2, '0');
        const year = expiryDate.getFullYear();
        return `${day}/${month}/${year}`;
    })();
    item.lotCount = item.lots.length;

    return item;
}

function normalizeSideEffects(sideEffects) {
    if (Array.isArray(sideEffects)) return sideEffects.filter(Boolean);
    if (!sideEffects) return [];
    return String(sideEffects)
        .split(/,|;/)
        .map(item => item.trim())
        .filter(Boolean);
}

function makeEducationNote(text, citation) {
    return { text, citation };
}

function buildMedicationEducationNotes(medName, protocol) {
    const he = protocol.he || {};
    const primaryCitation = he.citation || POPMED_SHARED_HE_REFERENCES.medlineplus;
    const sideEffects = normalizeSideEffects(he.sideEffects);
    const lowerName = medName.toLowerCase();

    const notes = {
        purpose: [
            makeEducationNote(he.reason || `${medName} is prescribed to manage a specific clinical condition identified by the treating team.`, primaryCitation),
            makeEducationNote('Make sure you understand the medicine name, the reason it was prescribed, and the expected benefit before each dose or administration.', POPMED_SHARED_HE_REFERENCES.fdaMedicines)
        ],
        use: [
            makeEducationNote(protocol.instructions || 'Use this medicine exactly as directed by the doctor, nurse, or pharmacist. Do not change the dose or schedule on your own.', primaryCitation),
            makeEducationNote('Tell the nurse immediately if the medicine looks cloudy, discoloured, leaking, or different from what you usually receive.', POPMED_SHARED_HE_REFERENCES.fdaDrugInfo)
        ],
        monitoring: [
            makeEducationNote('Keep your follow-up assessments, because monitoring helps the team confirm the medicine is working and detect problems early.', POPMED_SHARED_HE_REFERENCES.fdaMedicines)
        ],
        sideEffects: sideEffects.length
            ? sideEffects.map(effect => makeEducationNote(`Possible side effect: ${effect}. Tell the nurse if it is severe, persistent, or worsening.`, primaryCitation))
            : [makeEducationNote('Possible side effects vary by patient. Report new symptoms promptly so the team can assess whether they are medicine-related.', POPMED_SHARED_HE_REFERENCES.medlineplus)],
        redFlags: [
            makeEducationNote('Get urgent help right away for difficulty breathing, swelling of the lips or face, widespread rash, fainting, severe chest pain, or sudden confusion after receiving a medicine.', POPMED_SHARED_HE_REFERENCES.fdaMedicines)
        ],
        counselling: [
            makeEducationNote('Do not start over-the-counter medicines, herbal products, or supplements without checking with your healthcare team, because interactions may change safety or effectiveness.', POPMED_SHARED_HE_REFERENCES.fdaDrugInfo)
        ]
    };

    if (protocol.isHighAlert) {
        notes.monitoring.push(
            makeEducationNote('This is a high-alert medicine, so extra checking is used to reduce the risk of dosing, administration, or monitoring errors.', POPMED_SHARED_HE_REFERENCES.fdaMedicines)
        );
    }

    if (protocol.isLASA) {
        notes.monitoring.push(
            makeEducationNote(`This medicine has a look-alike/sound-alike risk. Staff should confirm the exact name carefully before administration. ${protocol.lasaNote || ''}`.trim(), primaryCitation)
        );
    }

    if (protocol.containsPorcine) {
        notes.counselling.push(
            makeEducationNote('This product may contain porcine-derived material. If you have religious or cultural concerns, discuss them with the care team so options can be reviewed appropriately.', primaryCitation)
        );
    }

    if (lowerName.includes('antibiotic') || ['ceftriaxone', 'vancomycin', 'meropenem', 'amoxicillin', 'gentamicin', 'metronidazole', 'piperacillin'].some(term => lowerName.includes(term))) {
        notes.use.push(
            makeEducationNote('Antibiotics work best when doses are given at the planned intervals. Do not skip doses, and complete the full prescribed course unless the doctor changes the plan.', primaryCitation)
        );
        notes.redFlags.push(
            makeEducationNote('Report severe diarrhea, persistent vomiting, new rash, or symptoms of allergy during antibiotic therapy, because these may need prompt review.', primaryCitation)
        );
    }

    if (lowerName.includes('insulin') || lowerName.includes('gliclazide') || lowerName.includes('metformin')) {
        notes.monitoring.push(
            makeEducationNote('Blood glucose monitoring is important with diabetes medicines so treatment can be adjusted safely and hypoglycemia or hyperglycemia can be detected early.', primaryCitation)
        );
        notes.redFlags.push(
            makeEducationNote('Tell the nurse immediately if you feel shaky, sweaty, very hungry, dizzy, confused, or unusually sleepy, because these may be signs of hypoglycemia.', primaryCitation)
        );
        notes.counselling.push(
            makeEducationNote('Try to keep meals and snacks consistent with the treatment plan, because timing of food intake can affect glucose control and medicine safety.', POPMED_SHARED_HE_REFERENCES.medlineplus)
        );
    }

    if (lowerName.includes('heparin') || lowerName.includes('enoxaparin') || lowerName.includes('aspirin') || lowerName.includes('clopidogrel')) {
        notes.monitoring.push(
            makeEducationNote('Watch for bruising, gum bleeding, nosebleeds, blood in urine, black stools, or unusual bleeding, because anticoagulant and antiplatelet medicines can increase bleeding risk.', primaryCitation)
        );
        notes.counselling.push(
            makeEducationNote('Use a soft toothbrush, shave carefully, and inform staff before procedures or injections to reduce bleeding risk.', POPMED_SHARED_HE_REFERENCES.medlineplus)
        );
    }

    if (lowerName.includes('morphine') || lowerName.includes('pethidine') || lowerName.includes('midazolam')) {
        notes.monitoring.push(
            makeEducationNote('Sedating medicines may affect alertness, breathing, and mobility, so nurses may monitor your breathing rate, sedation level, and oxygenation closely.', primaryCitation)
        );
        notes.redFlags.push(
            makeEducationNote('Report extreme drowsiness, slowed breathing, inability to stay awake, or new confusion urgently after sedating or opioid medicines.', primaryCitation)
        );
        notes.counselling.push(
            makeEducationNote('Ask for help before walking if you feel drowsy or dizzy, because these medicines can increase fall risk.', POPMED_SHARED_HE_REFERENCES.medlineplus)
        );
    }

    if (lowerName.includes('amlodipine') || lowerName.includes('perindopril') || lowerName.includes('bisoprolol') || lowerName.includes('dopamine') || lowerName.includes('noradrenaline')) {
        notes.monitoring.push(
            makeEducationNote('Blood pressure and pulse monitoring help ensure cardiovascular medicines are effective without causing excessive hypotension or rhythm changes.', primaryCitation)
        );
        notes.counselling.push(
            makeEducationNote('Rise slowly from sitting or lying positions if you feel light-headed, and tell staff if you have persistent dizziness or palpitations.', POPMED_SHARED_HE_REFERENCES.medlineplus)
        );
    }

    if (lowerName.includes('furosemide')) {
        notes.monitoring.push(
            makeEducationNote('Diuretics may increase urine output and can affect fluid balance and electrolytes, so the team may monitor weight, blood pressure, urine output, and blood tests.', primaryCitation)
        );
        notes.counselling.push(
            makeEducationNote('Tell staff if you feel very thirsty, develop muscle cramps, or notice marked dizziness, because these may suggest dehydration or electrolyte changes.', primaryCitation)
        );
    }

    if (lowerName.includes('simvastatin')) {
        notes.redFlags.push(
            makeEducationNote('Report unexplained muscle pain, weakness, or dark urine promptly, because these symptoms can signal a serious muscle-related adverse reaction.', primaryCitation)
        );
    }

    if (lowerName.includes('ibuprofen') || lowerName.includes('aspirin')) {
        notes.counselling.push(
            makeEducationNote('Take oral NSAID medicines with food when appropriate to reduce stomach irritation, unless your clinician gives different instructions.', primaryCitation)
        );
        notes.redFlags.push(
            makeEducationNote('Tell the team if you have severe stomach pain, vomit blood, or pass black stools, because these may indicate gastrointestinal bleeding.', primaryCitation)
        );
    }

    if (lowerName.includes('pantoprazole')) {
        notes.use.push(
            makeEducationNote('This medicine helps reduce stomach acid and may be used to protect the stomach or treat acid-related symptoms while other treatments are ongoing.', primaryCitation)
        );
    }

    if (lowerName.includes('potassium chloride') || lowerName.includes('magnesium sulphate') || lowerName.includes('calcium gluconate')) {
        notes.monitoring.push(
            makeEducationNote('Electrolyte medicines often require close laboratory monitoring and careful infusion rates because too little or too much electrolyte can be dangerous.', primaryCitation)
        );
        notes.redFlags.push(
            makeEducationNote('Inform staff quickly if you develop palpitations, chest discomfort, marked weakness, tingling, or worsening muscle cramps during therapy.', primaryCitation)
        );
    }

    if (lowerName.includes('sodium chloride') || lowerName.includes('dextrose') || lowerName.includes('ringer') || lowerName.includes('hartmann')) {
        notes.purpose.push(
            makeEducationNote('IV fluids may be used to maintain hydration, support circulation, replace losses, or serve as a carrier for IV medicines according to your treatment plan.', primaryCitation)
        );
        notes.monitoring.push(
            makeEducationNote('Fluid balance may be monitored through vital signs, urine output, swelling, breathlessness, and laboratory results to avoid overload or dehydration.', primaryCitation)
        );
    }

    if (lowerName.includes('sterile water')) {
        notes.use = [
            makeEducationNote('Sterile water for injection is a preparation fluid used by staff for reconstitution. It is not a medicine for direct IV administration on its own.', primaryCitation)
        ];
        notes.redFlags = [
            makeEducationNote('This item should only be used as directed by trained staff during medicine preparation. It should not be self-administered.', primaryCitation)
        ];
    }

    const references = uniqueCitations([
        primaryCitation,
        POPMED_SHARED_HE_REFERENCES.medlineplus,
        POPMED_SHARED_HE_REFERENCES.fdaMedicines,
        POPMED_SHARED_HE_REFERENCES.fdaDrugInfo
    ]);

    return {
        ...he,
        sideEffects,
        educationNotes: notes,
        references
    };
}

Object.keys(initialData.medicationProtocols).forEach(medName => {
    const protocol = initialData.medicationProtocols[medName];
    protocol.he = buildMedicationEducationNotes(medName, protocol);
});

// Initialize localStorage if empty
const DB_VERSION = '2.3'; // Keep current version; sync logic already refreshes protocol data safely

function generateInitialPatients(data) {
    const firstNames = ['Ahmad', 'Fatimah', 'Zubair', 'Aisyah', 'Umar', 'Khadijah', 'Ali', 'Zainab', 'Hassan', 'Maryam'];
    const lastNames = ['Abdullah', 'Rahman', 'Ismail', 'Yusof', 'Ibrahim', 'Aziz', 'Hamzah', 'Saleh', 'Mahmud', 'Idris'];
    const nurses = ['Nurse Arisya', 'Nurse Shah', 'Nurse Leeya'];
    const commonAllergies = ['Penicillin', 'Sulfa Drugs', 'Aspirin', 'NSAIDs', 'None (NKDA)'];
    const diagnoses = [
        'Type 2 Diabetes Mellitus with Diabetic Foot Ulcer (DFU)',
        'Congestive Cardiac Failure (CCF) - NYHA Class III',
        'Community Acquired Pneumonia (CAP) - CURB-65 Score 2',
        'Chronic Kidney Disease (CKD) Stage 4',
        'Post-Appendectomy with Surgical Site Infection (SSI)',
        'Essential Hypertension with Hypertensive Urgency',
        'Acute Exacerbation of Bronchial Asthma (AEBA)'
    ];

    const allMedNames = [
        ...data.medications.oral,
        ...data.medications.iv,
        ...data.medications.injection,
        ...data.medications.emergency,
        ...data.medications.others,
        ...data.ivSolutions
    ];

    const patients = [];
    let totalMedsCreated = 0;
    let pendingCount = 0;
    let missedCount = 0;
    let documentedCount = 0;
    const now = new Date();

    for (let i = 1; i <= 25; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const doctor = data.doctors[Math.floor(Math.random() * data.doctors.length)];
        const nurse = nurses[Math.floor(Math.random() * nurses.length)];
        const diagnosis = diagnoses[Math.floor(Math.random() * diagnoses.length)];
        const allergy = commonAllergies[Math.floor(Math.random() * commonAllergies.length)];
        
        const medCount = Math.floor(Math.random() * 4) + 4;
        const patientMeds = [];
        const shuffledMeds = [...allMedNames].sort(() => 0.5 - Math.random());
        
        for(let m=0; m < medCount; m++) {
            const medName = shuffledMeds[m];
            const invItem = data.inventory.find(inv => inv.name === medName);
            
            let route = 'Oral (PO)';
            if (data.medications.iv.includes(medName)) route = 'Intravenous (IV)';
            if (data.medications.injection.includes(medName)) route = 'Subcutaneous (SC)';
            if (data.medications.emergency.includes(medName)) route = 'Intravenous (IV)';

            let status = 'Pending';
            let timeDue;
            let timeAdministered = null;
            let justification = null;
            let remarks = '';
            
            if (missedCount < 6) {
                status = 'Missed';
                timeDue = new Date(now.getTime() - (Math.floor(Math.random() * 90) + 30) * 60000);
                timeAdministered = new Date(timeDue.getTime() + (5 * 60000)).toISOString();
                justification = missedCount < 3 ? 'Patient refused medication' : 'Medication temporarily unavailable';
                remarks = 'Initial simulation data';
                missedCount++;
            } else if (pendingCount < 40) {
                status = 'Pending';
                timeDue = new Date(now.getTime() + (Math.floor(Math.random() * 360) + 20) * 60000);
                pendingCount++;
            } else if (documentedCount < 20) {
                status = 'Administered';
                timeDue = new Date(now.getTime() - (Math.floor(Math.random() * 240) + 20) * 60000);
                timeAdministered = new Date(timeDue.getTime() + (Math.floor(Math.random() * 25) + 5) * 60000).toISOString();
                remarks = 'Routine dose given as prescribed.';
                documentedCount++;
            } else {
                const isPast = Math.random() < 0.15;
                if (isPast) {
                    status = 'Dispensed';
                    timeDue = new Date(now.getTime() - (Math.floor(Math.random() * 45) + 10) * 60000);
                } else {
                    timeDue = new Date(now.getTime() + (Math.floor(Math.random() * 600) + 10) * 60000);
                }
            }

            patientMeds.push({
                id: `MED-${Date.now()}-${i}-${m}`,
                name: medName,
                barcode: invItem ? invItem.barcode : `BC-UNK-${Date.now()}`,
                dose: medName.includes('mg') ? medName.split(' ').filter(word => word.includes('mg'))[0] || '1 unit' : '1 unit',
                route: route,
                frequency: 'BD',
                timeDue: timeDue.toISOString(),
                status: status,
                prescribedAt: createRandomTodayTimestamp(now, 15, 600),
                prescribingDoctor: randomChoice(data.doctors),
                justification: justification,
                remarks: remarks,
                nurseId: 'System',
                doctor: doctor,
                timeDispensed: status === 'Dispensed' ? new Date(timeDue.getTime() - (Math.floor(Math.random() * 30) + 5) * 60000).toISOString() : null,
                timeAdministered: timeAdministered,
                nurseName: status === 'Administered' ? nurse : null
            });
            totalMedsCreated++;
        }

        patients.push({
            bedNumber: i,
            occupied: true,
            info: {
                name: `${firstName} ${lastName}`,
                mrn: `MRN-${200000 + i}`,
                bedNumber: i,
                doctor: doctor,
                nurseInCharge: nurse,
                diagnosis: diagnosis,
                allergies: allergy,
                clinicalProgress: 'Patient is clinically stable. Vital signs are within normal limits (WNL). Wound site shows healthy granulation tissue. Plan for step-down oral antibiotics.',
                diagnosticResults: {
                    woundImage: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&q=80&w=400',
                    xrayImage: 'https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?auto=format&fit=crop&q=80&w=400',
                    vitals: {
                        bp: '128/78 mmHg',
                        hr: '76 bpm',
                        rr: '18 bpm',
                        temp: '36.8°C',
                        spo2: '99% under Room Air',
                        dxt: `${(Math.random() * 2 + 5).toFixed(1)} mmol/L`,
                        painScore: '2/10',
                        gcs: '15/15 (E4V5M6)',
                        ecg: 'Sinus Rhythm'
                    }
                }
            },
            medications: patientMeds
        });
    }
    return patients;
}

function initializeDB() {
    let existingDB;
    try {
        existingDB = JSON.parse(localStorage.getItem('popmed_db'));
        // Check for version to force update if necessary
        if (existingDB && (!existingDB.version || parseFloat(existingDB.version) < parseFloat(DB_VERSION))) {
            console.log(`Database version ${existingDB.version || '0'} out of date. Updating to ${DB_VERSION}...`);
            existingDB = null; // Force re-initialization
        }
    } catch (e) {
        console.error('DB Parse Error, resetting...', e);
        existingDB = null;
    }
    
    // Proactive Sync: Ensure users, developers, supervisor, inventory, medications and protocols are always up to date
    if (existingDB && typeof existingDB === 'object') {
        // MANDATORY SYNC: Always sync users to ensure passwords from data.js are applied
        existingDB.users = initialData.users;
        
        // Sync Developers and Supervisor
        existingDB.developers = initialData.developers;
        existingDB.supervisor = initialData.supervisor;
        
        // Sync Clinical Data
        existingDB.medications = initialData.medications;
        existingDB.medicationProtocols = initialData.medicationProtocols;
        existingDB.ivSolutions = initialData.ivSolutions;
        existingDB.doctors = initialData.doctors;

        // Force Update Inventory Expiry to 2027-2029
        if (existingDB.inventory && Array.isArray(existingDB.inventory)) {
            existingDB.inventory.forEach((item, index) => {
                const isExpired = index < 2;
                if (!Array.isArray(item.lots) || item.lots.length === 0) {
                    const year = isExpired ? 2025 : (2027 + Math.floor(Math.random() * 3));
                    const month = Math.floor(Math.random() * 12) + 1;
                    const day = Math.floor(Math.random() * 28) + 1;
                    item.lots = [createInventoryLot(item.quantity || 500, `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`, item.batch)];
                }
                if (item.lots.length < 2) {
                    ensureInventoryLotDepth(item, 2 - item.lots.length);
                } else {
                    refreshInventoryDerivedFields(item);
                }
            });
        }
        
        // Force Re-initialize Patients if empty or needs refresh
        if (!existingDB.patients || existingDB.patients.length === 0) {
            existingDB.patients = generateInitialPatients(initialData);
        } else {
            // Ensure all existing patients are "occupied" and have valid medications for BCMA Unit 2 visibility
            existingDB.patients.forEach(p => {
                p.occupied = true;
                if (!p.medications || p.medications.length === 0) {
                    const temp = generateInitialPatients(initialData).find(tp => tp.bedNumber === p.bedNumber);
                    if (temp) p.medications = temp.medications;
                }
                if (Array.isArray(p.medications)) {
                    p.medications.forEach(med => {
                        if (!med.prescribingDoctor) {
                            med.prescribingDoctor = randomChoice(initialData.doctors);
                        }
                        if (!med.prescribedAt) {
                            med.prescribedAt = createRandomTodayTimestamp(new Date(), 20, 720);
                        }
                    });
                }
            });
        }
        
        // Date Synchronization Logic: Update all patient medication dates to current date
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        if (existingDB.patients && Array.isArray(existingDB.patients)) {
            let normalizedMissedCount = 0;
            existingDB.patients.forEach(patient => {
                if (patient.medications && Array.isArray(patient.medications)) {
                    patient.medications.forEach(med => {
                        const oldDue = new Date(med.timeDue);
                        // Preserve the time (hours, minutes) but update to current date
                        const newDue = new Date(startOfToday.getTime());
                        newDue.setHours(oldDue.getHours(), oldDue.getMinutes(), oldDue.getSeconds());
                        med.timeDue = newDue.toISOString();

                        if (!med.prescribedAt) {
                            med.prescribedAt = createRandomTodayTimestamp(now, 20, 720);
                        } else {
                            const oldPrescribed = new Date(med.prescribedAt);
                            const newPrescribed = new Date(startOfToday.getTime());
                            newPrescribed.setHours(oldPrescribed.getHours(), oldPrescribed.getMinutes(), oldPrescribed.getSeconds());
                            if (newPrescribed > newDue) {
                                newPrescribed.setTime(newDue.getTime() - ((10 + Math.floor(Math.random() * 90)) * 60000));
                            }
                            med.prescribedAt = newPrescribed.toISOString();
                        }

                        if (med.status === 'Missed') {
                            normalizedMissedCount++;
                            if (normalizedMissedCount > 6 && med.nurseId === 'System') {
                                med.status = 'Pending';
                                med.justification = null;
                                med.remarks = '';
                                med.timeAdministered = null;
                                med.timeDue = new Date(now.getTime() + (30 + Math.floor(Math.random() * 240)) * 60000).toISOString();
                            }
                        }
                    });
                }
            });
        }
        
        // Add missing medications to inventory
        const allMedNames = [
            ...initialData.medications.oral,
            ...initialData.medications.iv,
            ...initialData.medications.injection,
            ...initialData.medications.emergency,
            ...initialData.medications.others,
            ...initialData.ivSolutions
        ];

        allMedNames.forEach(name => {
            const exists = existingDB.inventory.find(i => i.name === name);
            if (!exists) {
                const isControlled = name.toLowerCase().includes('controlled drug') || name.toLowerCase().includes('morphine') || name.toLowerCase().includes('pethidine');
                const isHighAlert = name.toLowerCase().includes('high alert') || name.toLowerCase().includes('potassium') || name.toLowerCase().includes('insulin');
                
                existingDB.inventory.push({
                    id: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    name,
                    barcode: `BC-${Math.floor(Math.random() * 9000000) + 1000000}`,
                    batch: `LOT-${Math.floor(Math.random() * 9000) + 1000}`,
                    expiry: new Date(Date.now() + (Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
                    quantity: 500,
                    parLevel: 50,
                    temperature: (22 + (Math.random() * 4 - 2)).toFixed(1),
                    unusable: false,
                    isControlled: isControlled,
                    isHighAlert: isHighAlert,
                    isIVSolution: initialData.ivSolutions.includes(name),
                    lots: [createInventoryLot(500)]
                });
                ensureInventoryLotDepth(existingDB.inventory[existingDB.inventory.length - 1], 1);
            }
        });

        localStorage.setItem('popmed_db', JSON.stringify(existingDB));
        console.log('POPMED Database Synced Successfully');
    }

    if (!existingDB) { 
        // Set Version
        initialData.version = DB_VERSION;
        
        // Create initial inventory with enhanced metadata
        const allMedNames = [
            ...initialData.medications.oral,
            ...initialData.medications.iv,
            ...initialData.medications.injection,
            ...initialData.medications.emergency,
            ...initialData.medications.others,
            ...initialData.ivSolutions
        ];

        initialData.inventory = allMedNames.map((name, index) => {
            const isControlled = name.toLowerCase().includes('controlled drug') || name.toLowerCase().includes('morphine') || name.toLowerCase().includes('pethidine');
            const isHighAlert = name.toLowerCase().includes('high alert') || name.toLowerCase().includes('potassium') || name.toLowerCase().includes('insulin');
            
            // Set all to 2027-2029 except first two
            const isExpired = index < 2; 
            const year = isExpired ? 2025 : (2027 + Math.floor(Math.random() * 3));
            const month = Math.floor(Math.random() * 12) + 1;
            const day = Math.floor(Math.random() * 28) + 1;

            return {
                id: `INV-${index + 1000}`,
                name,
                barcode: `BC-${1000000 + index}`,
                batch: `LOT-${Math.floor(Math.random() * 9000) + 1000}`,
                expiry: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
                expiryDate: `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`,
                quantity: 500,
                parLevel: 50,
                temperature: (22 + (Math.random() * 4 - 2)).toFixed(1),
                unusable: false,
                isControlled: isControlled,
                isHighAlert: isHighAlert,
                isIVSolution: initialData.ivSolutions.includes(name),
                lots: [createInventoryLot(500, `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`)]
            };
        });

        initialData.inventory.forEach(item => ensureInventoryLotDepth(item, 1));

        initialData.patients = generateInitialPatients(initialData);
        localStorage.setItem('popmed_db', JSON.stringify(initialData));
    }
}

function syncReferenceData(db, options = {}) {
    if (!db || typeof db !== 'object') return db;

    db.users = initialData.users;
    db.developers = initialData.developers;
    db.supervisor = initialData.supervisor;
    db.medications = initialData.medications;
    db.medicationProtocols = initialData.medicationProtocols;
    db.ivSolutions = initialData.ivSolutions;
    db.doctors = initialData.doctors;
    normalizeOperationalData(db);

    if (options.persist) {
        localStorage.setItem('popmed_db', JSON.stringify(db));
    }

    return db;
}

function getDB() {
    try {
        const data = localStorage.getItem('popmed_db');
        if (!data) {
            initializeDB();
            return syncReferenceData(JSON.parse(localStorage.getItem('popmed_db')), { persist: true });
        }
        const parsed = JSON.parse(data);
        return syncReferenceData(parsed, { persist: true });
    } catch (e) {
        console.error('Database Retrieval Error:', e);
        localStorage.removeItem('popmed_db');
        initializeDB();
        return syncReferenceData(structuredClone(initialData), { persist: true });
    }
}

function updateDB(data) {
    localStorage.setItem('popmed_db', JSON.stringify(data));
    window.dispatchEvent(new Event('dbUpdated'));
}

// Helper to force reset database if needed
function hardResetDB() {
    if (confirm('CRITICAL: This will erase all patient records, logs, and custom inventory settings. The system will restore clinical defaults. Proceed?')) {
        localStorage.clear(); // Clear everything including session data
        sessionStorage.clear();
        location.reload();
    }
}

initializeDB();
