// Initial Data for POPMED System
const initialData = {
    users: [
        { fullname: 'Ms. Arisya Elyana', id: 'Arisya_Elyana', password: 'Arisya123', role: 'Nurse' },
        { fullname: 'Mr. Shah Ikmal', id: 'Shah_Ikmal', password: 'Shah123', role: 'Nurse' },
        { fullname: 'Dr. Khairina Jupri', id: 'Khairina_Jupri', password: 'Khairina123', role: 'Medical Doctor' },
        { fullname: 'Dr. Shazreen', id: 'Shazreen_Arin', password: 'Arin123', role: 'Medical Doctor' },
        { fullname: 'Ms. Leeya Tahirah', id: 'Leeya_Tahirah', password: 'Leeya123', role: 'Nurse' },
        { fullname: 'Dr. Azri Jalil', id: 'Azri_Jalil', password: 'Azri123', role: 'Pharmacist' },
        { fullname: 'Dr. Azmir Ahmad', id: 'Azmir_Ahmad', password: 'Azmir123', role: 'Admin' }, 
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
        { name: 'Mr. Muhammad Shah Ikmal Junaidi', role: 'System Developer' },
        { name: 'Ms. Arisya Elyana Ahmad Fairuz', role: 'Project Coordinator & Architect' },
        { name: 'Ms. Nuraleeya Tahirah Mohammad', role: 'Clinical Workflow Analyst' },
        { name: 'Ms. Nurshazreen Aqeela Mat Zaib', role: 'Project Coordinator & Quality Lead' },
        { name: 'Ms. Siti Nurkhairina Amad Jupri', role: 'Clinical Workflow Designer' }
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
        'Assoc. Prof. Dr. Syamsul Ahmad Arifin',
        'Dr. Mohd Azri Abd Jalil',
        'Dr. Sarah Zulifli',
        'Dr. Shidqiyyah Abd Hamid',
        'Dr. Azmir Ahmad',
        'Assoc. Prof. Dr. Siti Noorkhairina Binti Sowtali',
        'Assoc. Prof. Dr. Sanisah Saidi',
        'Prof. Dr. Mohd Said Nurumal',
        'Prof. Dr. Salizar Mohamed Ludin',
        'Prof. Dr. Azlina Daud',
        'Prof. Dr. Siti Roshaidai',
        'Assoc. Prof. Dr. Kamil Che Hassan',
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
                citation: 'British National Formulary (BNF 86)'
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
                citation: 'MIMS Malaysia 2024'
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
                citation: 'BNF for Children 2023-2024'
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
                citation: 'MIMS Drug Reference 2024'
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
                citation: 'Clinical Pharmacokinetics (Lexicomp)'
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
                citation: 'BNF 86, Section 5.1.11'
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
                citation: 'Malaysia National Essential Medicine List (NEML)'
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
                citation: 'Diabetes Care Guidelines 2024'
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
                citation: 'IDF Clinical Practice Recommendations'
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
                citation: 'WHO Pain Management Ladder'
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
                citation: 'BNF 86, Section 4.7.2'
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
                citation: 'Heart Failure Society Guidelines'
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
                citation: 'Electrolyte Replacement Protocol 2024'
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
                citation: 'MIMS Malaysia Online 2024'
            }
        },
        'Ibuprofen 400mg Tablet': {
            diluent: 'Not Applicable', volume: 'Not Applicable',
            instructions: 'Administer with food to mitigate gastric mucosal irritation. Limit to 1.2g/day unless clinically supervised.',
            stability: 'Stable',
            he: { 
                reason: 'This medicine reduces pain and swelling (inflammation).', 
                sideEffects: 'It can cause stomach ache or heartburn. Taking it with food helps prevent this.', 
                citation: 'FDA Consumer Medication Guide' 
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
                citation: 'ADA Standards of Medical Care 2024' 
            }
        },
        'Amlodipine 5mg Tablet': {
            diluent: 'Not Applicable', volume: 'Not Applicable',
            instructions: 'Monitor blood pressure parameters. Avoid concurrent consumption of grapefruit juice.',
            stability: 'Stable',
            he: { 
                reason: 'This medicine helps lower your blood pressure and prevents chest pain (angina) by relaxing your blood vessels.', 
                sideEffects: 'Some people notice swelling in their ankles, feel a bit dizzy, or have a warm/flushed face.', 
                citation: 'AHA Hypertension Guidelines' 
            }
        },
        'Simvastatin 20mg Tablet': {
            diluent: 'Not Applicable', volume: 'Not Applicable',
            instructions: 'Optimal administration at nocte (evening). Avoid significant intake of grapefruit juice.',
            stability: 'Stable',
            he: { reason: 'HMG-CoA reductase inhibitor (statin) for hyperlipidemia.', sideEffects: 'Myalgia (muscle pain), weakness, hepatic transaminase elevation.', citation: 'ATP IV Cholesterol Guidelines' }
        },
        'Heparin 5,000 units/ml Injection': {
            isHighAlert: true,
            diluent: 'Not Applicable', volume: 'Not Applicable',
            instructions: 'Administer SC in abdominal adipose tissue. Avoid site massage. Monitor APTT for IV therapeutic use.',
            stability: 'Stable',
            he: { reason: 'Anticoagulant for prophylaxis and treatment of thromboembolic disorders.', sideEffects: 'Ecchymosis (bruising), hemorrhage (bleeding), injection site irritation.', citation: 'ACCP Antithrombotic Guidelines' }
        },
        'Enoxaparin 40mg/0.4ml Pre-filled Syringe': {
            isHighAlert: true,
            diluent: 'Not Applicable', volume: 'Not Applicable',
            instructions: 'Administer SC. Do not expel the nitrogen air bubble prior to injection.',
            stability: 'Stable',
            he: { reason: 'Low molecular weight heparin (LMWH) for DVT prophylaxis.', sideEffects: 'Hemorrhage, anemia, localized pain.', citation: 'Clinical Practice Guideline (LMWH)' }
        },
        'Pethidine 50mg/ml Injection (Controlled Drug)': {
            isHighAlert: true,
            diluent: '0.9% Sodium Chloride', volume: '10ml',
            instructions: 'HIGH ALERT: Opioid analgesic. Reconstitute and administer slowly over 3-5 minutes. Respiratory monitoring required.',
            stability: 'Stable',
            he: { reason: 'Strong painkiller for moderate to severe pain.', sideEffects: 'Drowsiness, nausea, dizziness, respiratory depression.', citation: 'BNF 86' }
        },
        'Atropine 0.5mg/ml Injection': {
            isHighAlert: true,
            diluent: 'Undiluted', volume: 'Not Applicable',
            instructions: 'EMERGENCY: Rapid IV bolus for symptomatic bradycardia. Monitor HR and rhythm.',
            stability: 'Stable',
            he: { reason: 'Increases heart rate during clinical bradycardia.', sideEffects: 'Dry mouth, blurred vision, tachycardia.', citation: 'ACLS 2024' }
        },
        'Adenosine 6mg/2ml Injection': {
            isHighAlert: true,
            diluent: 'Undiluted (Rapid Flush)', volume: 'Not Applicable',
            instructions: 'EMERGENCY: Rapid IV push (1-2 seconds) followed immediately by 20ml NS flush. Continuous ECG required.',
            stability: 'Stable',
            he: { reason: 'Used to restore normal heart rhythm in certain types of fast heartbeats.', sideEffects: 'Chest pressure, facial flushing, brief period of asystole.', citation: 'ACLS 2024' }
        },
        'Adrenaline 1mg/ml (1:1000) Injection': {
            isHighAlert: true,
            isLASA: true,
            lasaNote: 'SOUNDS LIKE: Ephedrine. DO NOT CONFUSE. Adrenaline is much more potent.',
            diluent: '0.9% Sodium Chloride for infusion', volume: '50ml',
            instructions: 'EMERGENCY PROTOCOL: IM for anaphylaxis, IV for cardiac arrest (dilution 1:10,000). Continuous hemodynamic monitoring required.',
            stability: 'Discard if solution exhibits brownish/pinkish discoloration',
            he: { reason: 'Sympathomimetic catecholamine for anaphylaxis and cardiac resuscitation.', sideEffects: 'Tachycardia, anxiety, palpitations.', citation: 'Advanced Cardiac Life Support (ACLS) 2024' }
        },
        'Aspirin 75mg Tablet': {
            diluent: 'Not Applicable', volume: 'Not Applicable',
            instructions: 'Administer with or post-prandial. Dispersible tablets may be dissolved in water.',
            stability: 'Stable',
            he: { reason: 'Antiplatelet agent for secondary prevention of cardiovascular events.', sideEffects: 'Dyspepsia, increased hemorrhagic risk.', citation: 'BNF 86, Section 2.9' }
        },
        'Clopidogrel 75mg Tablet': {
            diluent: 'Not Applicable', volume: 'Not Applicable',
            instructions: 'May be administered without regard to food. Monitor for clinical signs of hemorrhage.',
            stability: 'Stable',
            he: { 
                reason: 'P2Y12 inhibitor antiplatelet agent for thromboprophylaxis.', 
                sideEffects: 'Increased bleeding risk, easy bruising, gastrointestinal distress.', 
                citation: 'American Heart Association (AHA) Guidelines 2024' 
            }
        },
        'Bisoprolol 5mg Tablet': {
            diluent: 'Not Applicable', volume: 'Not Applicable',
            instructions: 'Administer in the morning. Avoid abrupt cessation to prevent rebound hypertension/tachycardia.',
            stability: 'Stable',
            he: { reason: 'Selective beta-1 blocker for hypertension and heart rate management.', sideEffects: 'Peripheral coldness, fatigue, bradycardia (slow heart rate).', citation: 'AHA Cardiovascular Guidelines' }
        },
        'Perindopril 4mg Tablet': {
            diluent: 'Not Applicable', volume: 'Not Applicable',
            instructions: 'Administer on an empty stomach, preferably 30 minutes pre-breakfast.',
            stability: 'Stable',
            he: { reason: 'ACE inhibitor for management of hypertension and congestive heart failure.', sideEffects: 'Unproductive dry cough, dizziness, hyperkalemia.', citation: 'NICE Guidelines (Hypertension)' }
        },
        'Gliclazide 80mg Tablet': {
            diluent: 'Not Applicable', volume: 'Not Applicable',
            instructions: 'Administer with breakfast. Educate patient on clinical signs of hypoglycemia.',
            stability: 'Stable',
            he: { reason: 'Sulfonylurea for glycemic management in Type 2 Diabetes.', sideEffects: 'Hypoglycemia, weight gain, GI distress.', citation: 'IDF Diabetes Guidelines' }
        },
        'Atropine 0.5mg/ml Injection': {
            diluent: 'Undiluted', volume: 'Not Applicable',
            instructions: 'Rapid IV bolus for symptomatic bradycardia. Monitor heart rate and pupillary response.',
            stability: 'Stable',
            he: { reason: 'Anticholinergic for treatment of symptomatic bradycardia and certain poisonings.', sideEffects: 'Xerostomia (dry mouth), blurred vision, tachycardia.', citation: 'ACLS 2024' }
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
                citation: 'Clinical Pharmacotherapy (Lexicomp) 2024' 
            }
        },
        'Noradrenaline 4mg/4ml Injection': {
            isHighAlert: true,
            diluent: '5% Dextrose (Standard)', volume: '50ml or 250ml',
            instructions: 'HIGH ALERT: Continuous infusion via pump. Hemodynamic monitoring every 2-5 minutes during titration.',
            stability: 'Photosensitive; protect from light',
            he: { reason: 'Alpha-adrenergic agonist vasopressor for septic shock management.', sideEffects: 'Severe hypertension, bradycardia, peripheral ischemia.', citation: 'Surviving Sepsis Campaign' }
        },
        'Amiodarone 150mg/3ml Injection': {
            isHighAlert: true,
            diluent: '5% Dextrose EXCLUSIVELY', volume: '100ml to 250ml',
            instructions: 'Contraindicated with 0.9% NaCl. Utilize non-PVC administration sets and inline filters if available. Monitor ECG and BP.',
            stability: 'Stable in 5% Dextrose',
            he: { 
                reason: 'Class III antiarrhythmic for life-threatening ventricular arrhythmias.', 
                sideEffects: 'Hypotension, bradycardia, hepatic dysfunction, thyroid abnormalities.', 
                citation: 'European Resuscitation Council (ERC) Guidelines 2024' 
            }
        },
        'Adenosine 6mg/2ml Injection': {
            diluent: 'Undiluted', volume: 'Not Applicable',
            instructions: 'Administer as rapid IV bolus (1-2 seconds) followed by immediate 20ml rapid saline flush.',
            stability: 'Contraindicated for refrigeration',
            he: { reason: 'Antiarrhythmic for conversion of PSVT to sinus rhythm.', sideEffects: 'Chest pressure, flushing, transient asystole.', citation: 'ACLS 2024' }
        },
        'Ondansetron 4mg/2ml Injection': {
            diluent: 'Undiluted or 0.9% Sodium Chloride', volume: '50ml',
            instructions: 'Administer over 2-5 minutes. Monitor for QT interval prolongation.',
            stability: 'Stable',
            he: { 
                reason: '5-HT3 receptor antagonist antiemetic for post-operative or chemo-induced nausea.', 
                sideEffects: 'Cephalalgia, constipation, dizziness, rare cardiac dysrhythmias.', 
                citation: 'MIMS Malaysia Drug Reference 2024' 
            }
        },
        'Metoclopramide 10mg/2ml Injection': {
            diluent: 'Undiluted', volume: 'Not Applicable',
            instructions: 'Administer via slow IV bolus over 1-2 minutes to mitigate transient acute anxiety.',
            stability: 'Stable',
            he: { reason: 'Dopamine antagonist prokinetic and antiemetic.', sideEffects: 'Drowsiness, restlessness, extrapyramidal symptoms.', citation: 'BNF 86' }
        },
        'Midazolam 5mg/5ml Injection (Sedative)': {
            isHighAlert: true,
            diluent: '0.9% Sodium Chloride or 5% Dextrose', volume: 'Variable',
            instructions: 'HIGH ALERT: Continuous respiratory rate and oxygen saturation monitoring mandatory.',
            stability: 'Stable', 
            he: { reason: 'Benzodiazepine for conscious sedation and anxiolysis.', sideEffects: 'Respiratory depression, sedation, anterograde amnesia.', citation: 'Clinical Sedation Guidelines' }
        },
        'Magnesium Sulphate (MgSO4) 50% Injection': {
            isHighAlert: true,
            diluent: '0.9% Sodium Chloride or 5% Dextrose', volume: '100ml to 250ml',
            instructions: 'HIGH ALERT: Monitor deep tendon reflexes (DTR), RR, and urine output. Frequent BP monitoring required.',
            stability: 'Stable',
            he: { reason: 'Management of hypomagnesemia and seizure prophylaxis in eclampsia.', sideEffects: 'Flushing, hypotension, neuromuscular blockade (weakness).', citation: 'Obstetric Emergency Protocols' }
        },
        'Calcium Gluconate 10% Injection': {
            diluent: '0.9% Sodium Chloride or 5% Dextrose', volume: '50ml to 100ml',
            instructions: 'Administer slowly (1.5-2ml/min). Monitor for bradycardia and extravasation site irritation.',
            stability: 'Stable',
            he: { reason: 'Treatment of hypocalcemia and cardiac stabilization in hyperkalemia.', sideEffects: 'Peripheral tingling, metallic taste, cardiac arrhythmias.', citation: 'Electrolyte Management' }
        },
        'Pethidine 50mg/ml Injection (Controlled Drug)': {
            diluent: '0.9% Sodium Chloride or Sterile Water', volume: '10ml',
            instructions: 'Dilute to 5-10mg/ml. Administer slowly over 2-3 minutes. Monitor RR and BP parameters.',
            stability: 'Stable',
            he: { 
                reason: 'Opioid analgesic for moderate to severe acute pain management.', 
                sideEffects: 'Nausea, vomiting, respiratory depression, neurotoxicity (in renal failure).', 
                citation: 'British National Formulary (BNF 86), Section 4.7.2' 
            }
        },

        // IV SOLUTIONS
        'Sodium Chloride 0.9% (Normal Saline) 500ml Infusion': {
            diluent: 'Premixed Formulation', volume: '500ml',
            instructions: 'Isotonic crystalloid. Monitor for clinical signs of fluid overload, particularly in geriatric or renal-impaired cohorts.',
            stability: 'Utilize immediately upon compromising seal',
            he: { reason: 'Fluid resuscitation and electrolyte restoration; utilized as a primary vehicle for IV therapeutics.', sideEffects: 'Fluid overload, hypernatremia, peripheral edema.', citation: 'MIMS Malaysia 2024' }
        },
        'Sodium Chloride 0.9% (Normal Saline) 1000ml Infusion': {
            diluent: 'Premixed Formulation', volume: '1000ml',
            instructions: 'Isotonic crystalloid. Monitor for clinical signs of fluid overload, particularly in geriatric or renal-impaired cohorts.',
            stability: 'Utilize immediately upon compromising seal',
            he: { reason: 'Fluid resuscitation and electrolyte restoration; utilized as a primary vehicle for IV therapeutics.', sideEffects: 'Fluid overload, hypernatremia, peripheral edema.', citation: 'MIMS Malaysia 2024' }
        },
        'Dextrose 5% in Water (D5W) 500ml Infusion': {
            diluent: 'Premixed Formulation', volume: '500ml',
            instructions: 'Isotonic/Hypotonic crystalloid in vivo. Provides metabolic calories and electrolyte-free water. Monitor blood glucose.',
            stability: 'Utilize immediately upon compromising seal',
            he: { reason: 'Hydration therapy and caloric supplementation.', sideEffects: 'Hyperglycemia, fluid overload, hyponatremia.', citation: 'BNF 86, Section 9.2.2' }
        },
        'Dextrose 10% in Water (D10W) 500ml Infusion': {
            diluent: 'Premixed Formulation', volume: '500ml',
            instructions: 'Hypertonic crystalloid. Central venous access recommended to prevent venous sclerosis. Monitor blood glucose.',
            stability: 'Utilize immediately upon compromising seal',
            he: { reason: 'Management of refractory hypoglycemia and augmented caloric intake.', sideEffects: 'Venous irritation, hyperglycemia, osmotic diuresis.', citation: 'Malaysia National Essential Medicine List (NEML)' }
        },
        'Dextrose 5% in 0.9% Sodium Chloride (D5NS) 500ml Infusion': {
            diluent: 'Premixed Formulation', volume: '500ml',
            instructions: 'Hypertonic crystalloid. Provides calories and maintains electrolyte homeostasis. Monitor for fluid overload.',
            stability: 'Utilize immediately upon compromising seal',
            he: { reason: 'Maintenance fluid providing both electrolyte and metabolic support.', sideEffects: 'Fluid overload, hypernatremia, hyperglycemia.', citation: 'Clinical Guidelines (KON IIUM)' }
        },
        'Compound Sodium Lactate (Hartmann’s Solution) 500ml Infusion': {
            diluent: 'Premixed Formulation', volume: '500ml',
            instructions: 'Isotonic balanced salt solution. Contains potassium; exercise caution in hyperkalemic states.',
            stability: 'Utilize immediately upon compromising seal',
            he: { reason: 'Physiological fluid replacement for trauma, surgery, or burns; mitigates metabolic acidosis.', sideEffects: 'Fluid overload, hyperkalemia (large volume administration).', citation: 'WHO Model Formulary 2024' }
        },
        'Ringer’s Lactate 500ml Infusion': {
            diluent: 'Premixed Formulation', volume: '500ml',
            instructions: 'Isotonic crystalloid. Monitor serum electrolytes and fluid balance parameters.',
            stability: 'Utilize immediately upon compromising seal',
            he: { reason: 'Crystalloid replacement for dehydration and perioperative fluid management.', sideEffects: 'Electrolyte derangement, fluid overload.', citation: 'MIMS Malaysia 2024' }
        },
        'Sodium Chloride 0.45% (Half Normal Saline) 500ml Infusion': {
            diluent: 'Premixed Formulation', volume: '500ml',
            instructions: 'Hypotonic crystalloid. Utilize with extreme caution to prevent hyponatremia and cerebral edema.',
            stability: 'Utilize immediately upon compromising seal',
            he: { reason: 'Management of intracellular dehydration and hypernatremic states.', sideEffects: 'Hyponatremia, cellular swelling (cerebral edema risk).', citation: 'BNF 86, Section 9.2.2' }
        },
        'Sterile Water for Injection (SWFI) 100ml': {
            diluent: 'Not Applicable', volume: '100ml',
            instructions: 'STRICTLY CONTRAINDICATED FOR DIRECT IV ADMINISTRATION. Used solely for reconstitution of pharmacological agents.',
            stability: 'Utilize immediately upon compromising seal',
            he: { reason: 'Sterile diluent for reconstitution and preparation of injectable medications.', sideEffects: 'Lethal hemolysis if administered directly IV.', citation: 'MIMS Malaysia 2024' }
        }
    }
};

// Initialize localStorage if empty
function initializeDB() {
    let existingDB;
    try {
        existingDB = JSON.parse(localStorage.getItem('popmed_db'));
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
        
        // Refresh doctors for existing patients to ensure they align with the new list
        if (existingDB.patients && Array.isArray(existingDB.patients)) {
            existingDB.patients.forEach(patient => {
                if (patient.info && patient.info.doctor) {
                    // If the current doctor is not in the new list, assign a random one from the new list
                    if (!initialData.doctors.includes(patient.info.doctor)) {
                        patient.info.doctor = initialData.doctors[Math.floor(Math.random() * initialData.doctors.length)];
                    }
                }
                if (patient.medications && Array.isArray(patient.medications)) {
                    patient.medications.forEach(med => {
                        if (med.doctor && !initialData.doctors.includes(med.doctor)) {
                            med.doctor = patient.info.doctor;
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
        // Create initial inventory with enhanced metadata
        const allMedNames = [
            ...initialData.medications.oral,
            ...initialData.medications.iv,
            ...initialData.medications.injection,
            ...initialData.medications.emergency,
            ...initialData.medications.others
        ];

        initialData.inventory = allMedNames.map((name, index) => {
            const isControlled = name.toLowerCase().includes('controlled drug') || name.toLowerCase().includes('morphine') || name.toLowerCase().includes('pethidine');
            const isHighAlert = name.toLowerCase().includes('high alert') || name.toLowerCase().includes('potassium') || name.toLowerCase().includes('insulin');
            
            return {
                id: `INV-${index + 1000}`,
                name,
                barcode: `BC-${1000000 + index}`,
                batch: `LOT-${Math.floor(Math.random() * 9000) + 1000}`,
                expiry: new Date(Date.now() + (Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
                quantity: 500,
                parLevel: 50,
                temperature: (22 + (Math.random() * 4 - 2)).toFixed(1),
                unusable: false,
                isControlled: isControlled,
                isHighAlert: isHighAlert
            };
        });

        initialData.ivSolutions.forEach((name, index) => {
            initialData.inventory.push({
                id: `INV-IV-${index + 1000}`,
                name,
                barcode: `BC-IV-${2000000 + index}`,
                batch: `LOT-IV-${Math.floor(Math.random() * 9000) + 1000}`,
                expiry: new Date(Date.now() + (Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
                quantity: 200,
                parLevel: 20,
                temperature: (22 + (Math.random() * 4 - 2)).toFixed(1),
                unusable: false,
                isIVSolution: true,
                isControlled: false,
                isHighAlert: false
            });
        });

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

        // Initialize patients (Beds 1-25) with polypharmacy and BCMA readiness
        for (let i = 1; i <= 25; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const doctor = initialData.doctors[Math.floor(Math.random() * initialData.doctors.length)];
            const nurse = nurses[Math.floor(Math.random() * nurses.length)];
            const diagnosis = diagnoses[Math.floor(Math.random() * diagnoses.length)];
            const allergy = commonAllergies[Math.floor(Math.random() * commonAllergies.length)];
            
            // Polypharmacy: Generate 4-7 medications
            const medCount = Math.floor(Math.random() * 4) + 4; // 4 to 7
            const patientMeds = [];
            const shuffledMeds = [...allMedNames].sort(() => 0.5 - Math.random());
            
            for(let m=0; m < medCount; m++) {
                const medName = shuffledMeds[m];
                const invItem = initialData.inventory.find(inv => inv.name === medName);
                
                let route = 'Oral (PO)';
                if (initialData.medications.iv.includes(medName)) route = 'Intravenous (IV)';
                if (initialData.medications.injection.includes(medName)) route = 'Subcutaneous (SC)';
                if (initialData.medications.emergency.includes(medName)) route = 'Intravenous (IV)';

                patientMeds.push({
                    id: `MED-${Date.now()}-${i}-${m}`,
                    name: medName,
                    barcode: invItem ? invItem.barcode : `BC-UNK-${Date.now()}`,
                    dose: medName.includes('mg') ? medName.split(' ').filter(word => word.includes('mg'))[0] || '1 unit' : '1 unit',
                    route: route,
                    frequency: 'BD',
                    timeDue: new Date(Date.now() + (Math.random() * 24 * 60 * 60 * 1000)).toISOString(),
                    status: 'Pending',
                    nurseId: 'System',
                    doctor: doctor,
                    timeDispensed: null,
                    timeAdministered: null
                });
            }

            initialData.patients.push({
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
