// Cabinet 3: IV Solution Storage

function requestIVAccess(requestData) {
    const db = getDB();

    // Security Verification: Authorized for IV Preparation
    if (!isAuthorizedForAction('IV_PREPARATION')) {
        showNotification('SECURITY DENIED: Your role is not authorized for IV medication preparation.', 'error');
        generateLog('SECURITY_VIOLATION', currentUser.id, `Unauthorized IV prep attempt for ${requestData.medicationToDilute} (Bed ${requestData.bedNumber})`);
        return false;
    }

    const solutionItem = findInventoryItem(db, requestData.solutionType);

    if (!solutionItem) {
        showNotification(`Clinical Error: ${requestData.solutionType} not found in inventory.`, 'error');
        return false;
    }

    if (solutionItem.quantity <= 0) {
        showNotification(`Error: ${requestData.solutionType} is out of stock.`, 'error');
        return false;
    }

    // Deduct stock
    solutionItem.quantity -= 1;

    // Trigger Preparation Simulation for Cabinet 3
    triggerPreparationSimulation(() => {
        const requestLog = {
            id: `REQ-${Date.now()}`,
            timestamp: new Date().toISOString(),
            nurseId: currentUser.id,
            patientName: requestData.patientName,
            bedNumber: requestData.bedNumber,
            medicationToDilute: requestData.medicationToDilute,
            solutionType: requestData.solutionType,
            quantity: 1
        };

        db.ivRequests.push(requestLog);
        updateDB(db);
        generateLog('IV_ACCESS', currentUser.id, `Accessed IV Room: Prepared ${requestData.solutionType} for ${requestData.medicationToDilute} (Bed ${requestData.bedNumber})`);
        showNotification(`Success: ${requestData.solutionType} ready for Bed ${requestData.bedNumber}.`, 'success');
        
        // Refresh UI
        updateDashboard();
    }, requestData.solutionType, requestData.medicationToDilute);

    return true;
}
