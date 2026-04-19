// Cabinet 1: Medication Processing Unit

function processOrder(orderData) {
    const db = getDB();
    const inventoryItem = findInventoryItem(db, orderData.medicationName);

    // Auto checks
    if (!inventoryItem) {
        showNotification(`Clinical Error: ${orderData.medicationName} not found in inventory.`, 'error');
        return false;
    }

    if (inventoryItem.quantity <= 0) {
        showNotification(`Error: ${orderData.medicationName} is out of stock.`, 'error');
        return false;
    }

    // Duplicate check
    const patient = db.patients.find(p => p.bedNumber === parseInt(orderData.bedNumber));
    if (patient && patient.medications.some(m => m.name === orderData.medicationName && m.status === 'Pending')) {
        if (!confirm(`Warning: ${orderData.medicationName} is already pending for Bed ${orderData.bedNumber}. Proceed anyway?`)) {
            return false;
        }
    }

    // Process deduction
    inventoryItem.quantity -= 1;
    
    // Trigger Transfer Simulation before final processing
    triggerTransferSimulation(() => {
        // Create medication entry for Cabinet 2
        const medEntry = {
            id: `MED-${Date.now()}`,
            name: orderData.medicationName,
            dose: orderData.dose,
            route: orderData.route,
            frequency: orderData.frequency,
            timeDue: orderData.timeDue,
            status: 'Pending',
            nurseId: currentUser.id,
            timeDispensed: null,
            timeAdministered: null
        };

        // Update patient record
        if (!patient.occupied) {
            patient.occupied = true;
            patient.info = {
                name: orderData.patientName,
                mrn: orderData.mrn,
                bedNumber: orderData.bedNumber,
                doctor: orderData.doctor || 'Clinical Protocol Entry' 
            };
        }
        patient.medications.push(medEntry);

        updateDB(db);
        generateLog('TRANSFER_CABINET_2', currentUser.id, `Sent medicine: ${orderData.medicationName} to Bed ${orderData.bedNumber}`);
        showNotification(`Success: ${orderData.medicationName} sent to Patient Bed.`, 'success');
        
        // Refresh UI
        updateDashboard();
    });

    return true;
}

function reportMedicationIssue(invId, issue) {
    const db = getDB();
    const item = db.inventory.find(i => i.id === invId);
    if (item) {
        item.unusable = true;
        item.issueReport = issue;
        updateDB(db);
        generateLog('ISSUE_REPORTED', currentUser.id, `Reported ${item.name} as ${issue}. Marked as UNUSABLE.`);
        showNotification(`${item.name} marked as UNUSABLE.`, 'info');
    }
}
