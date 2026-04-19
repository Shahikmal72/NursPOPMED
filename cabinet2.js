// Cabinet 2: Patient Dispensing

function dispenseMedication(bedNumber, medId) {
    const db = getDB();

    // Security Verification: Authorized for Dispensing
    if (!isAuthorizedForAction('MED_DISPENSING')) {
        showNotification('SECURITY DENIED: Your role is not authorized for medication dispensing.', 'error');
        generateLog('SECURITY_VIOLATION', currentUser.id, `Unauthorized dispensing attempt (Bed ${bedNumber})`);
        return false;
    }

    const patient = db.patients.find(p => p.bedNumber === bedNumber);
    const med = patient.medications.find(m => m.id === medId);

    if (med && med.status === 'Pending') {
        med.status = 'Dispensed';
        med.timeDispensed = new Date().toISOString();
        updateDB(db);
        generateLog('DISPENSED', currentUser.id, `Dispensed ${med.name} for Bed ${bedNumber}`);
        showNotification(`${med.name} marked as Dispensed.`, 'success');
        return true;
    }
    return false;
}

function administerMedication(bedNumber, medId) {
    const db = getDB();
    const patient = db.patients.find(p => p.bedNumber === bedNumber);
    const med = patient.medications.find(m => m.id === medId);

    if (med && med.status === 'Dispensed') {
        med.status = 'Administered';
        med.timeAdministered = new Date().toISOString();
        updateDB(db);
        generateLog('ADMINISTERED', currentUser.id, `Administered ${med.name} for Bed ${bedNumber}`);
        showNotification(`${med.name} marked as Administered.`, 'success');
        return true;
    }
    return false;
}

function terminatePatientRecord(bedNumber) {
    if (!confirm(`Are you sure you want to terminate the record for Bed ${bedNumber}? This will archive current data.`)) {
        return false;
    }

    const db = getDB();
    const patient = db.patients.find(p => p.bedNumber === bedNumber);
    
    if (patient) {
        // Log the termination and current patient status
        generateLog('TERMINATE_RECORD', currentUser.id, `Terminated record for Bed ${bedNumber} (${patient.info?.name || 'Empty'})`);
        
        // Reset patient
        patient.occupied = false;
        patient.info = null;
        patient.medications = [];
        
        updateDB(db);
        showNotification(`Bed ${bedNumber} record terminated and archived.`, 'info');
        return true;
    }
    return false;
}
