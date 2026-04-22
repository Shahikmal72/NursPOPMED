// Initial Data for POPMED System
const initialData = {
    users: [
        { fullname: 'Ms. Arisya Elyana', id: 'Arisya_Elyana', password: 'Arisya123', role: 'Nurse' },
        { fullname: 'Mr. Shah Ikmal', id: 'Shah_Ikmal', password: 'Shah123', role: 'Nurse' },
        { fullname: 'Ms. Leeya Tahirah', id: 'Leeya_Tahirah', password: 'Leeya123', role: 'Nurse' },
        { fullname: 'Mr. Danial Imran', id: 'Danial_Imran', password: 'Dan123', role: 'Nurse' },
        { fullname: 'Azri Jalil', id: 'Azri_Jalil', password: 'Azri123', role: 'Pharmacist' },
        { fullname: 'Dr. Syamsul Ahmad Arifin', id: 'Syamsul_Arifin', password: 'Doc123', role: 'Medical Doctor' },
        { fullname: 'Dr. Mohd Azri Abd Jalil', id: 'Azri_AbdJalil', password: 'Doc123', role: 'Medical Doctor' },
        { fullname: 'Dr. Sarah Zulifli', id: 'Sarah_Zulifli', password: 'Doc123', role: 'Medical Doctor' },
        { fullname: 'Dr. Shidqiyyah Abd Hamid', id: 'Shidqiyyah_Hamid', password: 'Doc123', role: 'Medical Doctor' },
        { fullname: 'Dr. Azmir Ahmad', id: 'Azmir_Ahmad', password: 'Azmir123', role: 'Admin' }, 
        { fullname: 'Dr. Siti Noorkhairina Binti Sowtali', id: 'Siti_Noorkhairina', password: 'Doc123', role: 'Medical Doctor' },
        { fullname: 'Dr. Sanisah Saidi', id: 'Sanisah_Saidi', password: 'Doc123', role: 'Medical Doctor' },
        { fullname: 'Dr. Mohd Said Nurumal', id: 'Mohd_Said', password: 'Doc123', role: 'Medical Doctor' },
        { fullname: 'Dr. Salizar Mohamed Ludin', id: 'Salizar_Ludin', password: 'Doc123', role: 'Medical Doctor' },
        { fullname: 'Dr. Azlina Daud', id: 'Azlina_Daud', password: 'Doc123', role: 'Medical Doctor' },
        { fullname: 'Dr. Siti Roshaidai', id: 'Siti_Roshaidai', password: 'Doc123', role: 'Medical Doctor' },
        { fullname: 'Dr. Kamil Che Hassan', id: 'Kamil_Hassan', password: 'Doc123', role: 'Medical Doctor' },
        { fullname: 'Dr. Khairina Jupri', id: 'Khairina_Jupri', password: 'Khairina123', role: 'Medical Doctor' },
        { fullname: 'Dr. Shazreen', id: 'Shazreen_Arin', password: 'Arin123', role: 'Medical Doctor' },
        { fullname: 'Dr. Hasanah Pairoh', id: 'Hasanah_Pairoh', password: 'Hasanah123', role: 'Admin' }, 
    ],
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
    developers: [
        { name: 'Muhammad Shah Ikmal Junaidi', role: 'System Developer' },
        { name: 'Arisya Elyana Ahmad Fairuz', role: 'Project Coordinator & Architect' },
        { name: 'Nuraleeya Tahirah Mohammad', role: 'Clinical Workflow Analyst' },
        { name: 'Nurshazreen Aqeela Mat Zaib', role: 'Project Coordinator & Quality Lead' },
        { name: 'Siti Nurkhairina Amad Jupri', role: 'Clinical Workflow Designer' }
    ],
    supervisor: {
        name: 'Dr. Mohd. Azri Abd. Jalil',
        designation: 'Innovation in Nursing Supervisor'
    },
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
    doctors: [
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
    ],
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

// Initialize localStorage if empty
const DB_VERSION = '2.2'; // Increment this to force a database update

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
            
            if (missedCount < 10) {
                status = 'Pending';
                timeDue = new Date(now.getTime() - (Math.floor(Math.random() * 240) + 60) * 60000);
                missedCount++;
            } else if (pendingCount < 40) {
                status = 'Pending';
                timeDue = new Date(now.getTime() + (Math.floor(Math.random() * 480) + 30) * 60000);
                pendingCount++;
            } else {
                const isPast = Math.random() < 0.2;
                if (isPast) {
                    timeDue = new Date(now.getTime() - (Math.floor(Math.random() * 120) + 10) * 60000);
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
                justification: missedCount <= 5 ? 'Patient refused medication' : null,
                remarks: missedCount <= 5 ? 'Initial simulation data' : '',
                nurseId: 'System',
                doctor: doctor,
                timeDispensed: null,
                timeAdministered: status === 'Missed' ? timeDue.toISOString() : null
            });
            if (status === 'Missed') {
                patientMeds[patientMeds.length - 1].status = 'Missed';
            }
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
        // Sync Users (preserve any dynamic data if added, but update base properties)
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
                const year = isExpired ? 2025 : (2027 + Math.floor(Math.random() * 3)); // 2027 to 2029
                const month = Math.floor(Math.random() * 12) + 1;
                const day = Math.floor(Math.random() * 28) + 1;
                item.expiryDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
                item.expiry = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
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
            });
        }
        
        // Date Synchronization Logic: Update all patient medication dates to current date
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        if (existingDB.patients && Array.isArray(existingDB.patients)) {
            existingDB.patients.forEach(patient => {
                if (patient.medications && Array.isArray(patient.medications)) {
                    patient.medications.forEach(med => {
                        const oldDue = new Date(med.timeDue);
                        // Preserve the time (hours, minutes) but update to current date
                        const newDue = new Date(startOfToday.getTime());
                        newDue.setHours(oldDue.getHours(), oldDue.getMinutes(), oldDue.getSeconds());
                        
                        // If the updated date is still in the past (more than 24h ago), 
                        // it means it was a multi-day simulation. For simplicity, 
                        // we just ensure they are all on the CURRENT date.
                        med.timeDue = newDue.toISOString();
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
            // Check if item exists in inventory (fuzzy check to avoid duplicates)
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
                    isIVSolution: initialData.ivSolutions.includes(name)
                });
            }
        });

        localStorage.setItem('popmed_db', JSON.stringify(existingDB));
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
                isIVSolution: initialData.ivSolutions.includes(name)
            };
        });

        initialData.patients = generateInitialPatients(initialData);
        localStorage.setItem('popmed_db', JSON.stringify(initialData));
    }
}

function getDB() {
    try {
        const data = localStorage.getItem('popmed_db');
        if (!data) {
            initializeDB();
            return JSON.parse(localStorage.getItem('popmed_db'));
        }
        return JSON.parse(data);
    } catch (e) {
        console.error('Database Retrieval Error:', e);
        localStorage.removeItem('popmed_db');
        initializeDB();
        return initialData;
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
