// GST State Codes for India
const STATE_CODES = {
  "27": "Maharashtra",
  "01": "Jammu & Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "25": "Daman & Diu",
  "26": "Dadra & Nagar Haveli",
  "28": "Andhra Pradesh",
  "29": "Karnataka",
  "30": "Goa",
  "31": "Lakshadweep",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "34": "Puducherry",
  "35": "Andaman & Nicobar Islands",
  "36": "Telangana",
  "37": "Andhra Pradesh (New)",
  "38": "Ladakh",
};

// GST Rate Configuration
const GST_RATES = {
  STANDARD: {
    CGST: 9,
    SGST: 9,
    IGST: 18
  }
};

// Helper function to get state code from state name
const getStateCodeFromName = (stateName) => {
  console.log('🔍 [getStateCodeFromName] Attempting to get state code for:', stateName);

  if (!stateName) {
    console.log('⚠️ [getStateCodeFromName] No state name provided');
    return null;
  }

  const normalizedStateName = stateName.toLowerCase().trim();
  console.log('🔄 [getStateCodeFromName] Normalized state name:', normalizedStateName);

  const entry = Object.entries(STATE_CODES).find(([_, name]) =>
    name.toLowerCase() === normalizedStateName
  );

  if (entry) {
    console.log('✅ [getStateCodeFromName] Found state code:', entry[0], 'for state:', entry[1]);
    return entry[0];
  } else {
    console.log('❌ [getStateCodeFromName] No matching state code found for:', stateName);
    return null;
  }
};

// Keep this function for future use but it's not used in current GST calculation
const shouldApplyCGSTAndSGST = (customerStateCode, companyStateCode = "27") => {
  return customerStateCode === companyStateCode;
};

// Helper function to calculate GST amounts
const calculateGSTAmounts = (baseAmount, customerStateCode, companyStateCode = "27") => {
  console.group('💰 [calculateGSTAmounts] Starting GST calculation');
  console.log('📊 Input parameters:', {
    baseAmount: baseAmount?.toFixed(2),
    customerStateCode,
    customerState: STATE_CODES[customerStateCode] || 'Unknown State',
    companyStateCode,
    companyState: STATE_CODES[companyStateCode] || 'Unknown State'
  });

  const { CGST, SGST, IGST } = GST_RATES.STANDARD;

  // Check if customer and company are in the same state (intra-state)
  const isIntraState = customerStateCode && parseInt(customerStateCode) === 27;

  console.log('🔍 [calculateGSTAmounts] State comparison:', {
    customerStateCode,
    customerState: STATE_CODES[customerStateCode] || 'Unknown',
    companyStateCode,
    companyState: STATE_CODES[companyStateCode] || 'Unknown',
    isIntraState,
    transactionType: isIntraState ? 'Intra-state' : 'Inter-state'
  });

  if (isIntraState) {
    console.log('✅ [calculateGSTAmounts] Intra-state transaction - Applying CGST + SGST');
    const cgstAmount = (baseAmount * CGST) / 100;
    const sgstAmount = (baseAmount * SGST) / 100;
    const totalGST = cgstAmount + sgstAmount;

    const result = {
      cgstRate: CGST,
      sgstRate: SGST,
      igstRate: 0,
      cgstAmount,
      sgstAmount,
      igstAmount: 0,
      totalGST,
      isIntraState: true
    };

    console.log('📝 [calculateGSTAmounts] Calculation details:', {
      baseAmount: baseAmount?.toFixed(2),
      cgstAmount: cgstAmount?.toFixed(2),
      sgstAmount: sgstAmount?.toFixed(2),
      totalGST: totalGST?.toFixed(2)
    });
    console.groupEnd();
    return result;
  } else {
    console.log('ℹ️ [calculateGSTAmounts] Inter-state transaction - Applying IGST');
    const igstAmount = (baseAmount * IGST) / 100;

    const result = {
      cgstRate: 0,
      sgstRate: 0,
      igstRate: IGST,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount,
      totalGST: igstAmount,
      isIntraState: false
    };

    console.log('📝 [calculateGSTAmounts] Calculation details:', {
      baseAmount: baseAmount?.toFixed(2),
      igstAmount: igstAmount?.toFixed(2),
      totalGST: igstAmount?.toFixed(2)
    });
    console.groupEnd();
    return result;
  }
};

// Helper function to get state name from code
const getStateName = (stateCode) => {
  console.log('🔍 [getStateName] Looking up state name for code:', stateCode);
  const stateName = STATE_CODES[stateCode] || "Unknown State";
  console.log('📍 [getStateName] Result:', stateName);
  return stateName;
};

// Helper function to validate state code
const isValidStateCode = (stateCode) => {
  console.log('🔍 [isValidStateCode] Validating state code:', stateCode);
  const isValid = STATE_CODES.hasOwnProperty(stateCode);
  console.log('✅ [isValidStateCode] Is valid:', isValid);
  return isValid;
};

// Helper function to extract state code from GST number or state name
const getCustomerStateCode = (customer) => {
  console.group('🔍 [getCustomerStateCode] Getting customer state code');
  console.log('📄 Customer details:', {
    hasGST: !!customer?.gstin,
    gstin: customer?.gstin,
    state: customer?.billingState
  });

  // First try to get from GST number
  if (customer?.gstin && customer.gstin.length >= 2) {
    const stateCode = customer.gstin.substring(0, 2);
    console.log('🔄 [getCustomerStateCode] Extracted state code from GST:', stateCode);

    if (isValidStateCode(stateCode)) {
      console.log('✅ [getCustomerStateCode] Valid state code from GST:', stateCode, '(', STATE_CODES[stateCode], ')');
      console.groupEnd();
      return stateCode;
    } else {
      console.log('⚠️ [getCustomerStateCode] Invalid state code from GST, trying state name');
    }
  } else {
    console.log('ℹ️ [getCustomerStateCode] No valid GST number found, trying state name');
  }

  // If no valid GST number, try to get from state name
  if (customer?.billingState) {
    const stateCode = getStateCodeFromName(customer.billingState);
    if (stateCode) {
      console.log('✅ [getCustomerStateCode] Found state code from state name:', stateCode, '(', STATE_CODES[stateCode], ')');
      console.groupEnd();
      return stateCode;
    } else {
      console.log('⚠️ [getCustomerStateCode] Could not find state code from state name');
    }
  } else {
    console.log('⚠️ [getCustomerStateCode] No state name provided');
  }

  console.log('❌ [getCustomerStateCode] Could not determine state code');
  console.groupEnd();
  return null;
};

// Helper function to extract company state code
const getCompanyStateCode = (company) => {
  console.group('🔍 [getCompanyStateCode] Getting company state code');
  console.log('🏢 Company details:', {
    hasGST: !!company?.gstin,
    gstin: company?.gstin,
    stateCode: company?.stateCode,
    state: company?.state
  });

  // First try to get from company's stateCode field
  if (company?.stateCode && isValidStateCode(company.stateCode)) {
    console.log('✅ [getCompanyStateCode] Valid state code from company:', company.stateCode, '(', STATE_CODES[company.stateCode], ')');
    console.groupEnd();
    return company.stateCode;
  }

  // Then try to get from GST number
  if (company?.gstin && company.gstin.length >= 2) {
    const stateCode = company.gstin.substring(0, 2);
    console.log('🔄 [getCompanyStateCode] Extracted state code from GST:', stateCode);

    if (isValidStateCode(stateCode)) {
      console.log('✅ [getCompanyStateCode] Valid state code from GST:', stateCode, '(', STATE_CODES[stateCode], ')');
      console.groupEnd();
      return stateCode;
    } else {
      console.log('⚠️ [getCompanyStateCode] Invalid state code from GST, trying state name');
    }
  } else {
    console.log('ℹ️ [getCompanyStateCode] No valid GST number found, trying state name');
  }

  // If no valid GST number, try to get from state name
  if (company?.state) {
    const stateCode = getStateCodeFromName(company.state);
    if (stateCode) {
      console.log('✅ [getCompanyStateCode] Found state code from state name:', stateCode, '(', STATE_CODES[stateCode], ')');
      console.groupEnd();
      return stateCode;
    } else {
      console.log('⚠️ [getCompanyStateCode] Could not find state code from state name');
    }
  } else {
    console.log('⚠️ [getCompanyStateCode] No state name provided');
  }

  console.log('❌ [getCompanyStateCode] Could not determine state code, defaulting to Maharashtra (27)');
  console.groupEnd();
  return "27"; // Default to Maharashtra if no state code found
};

module.exports = {
  STATE_CODES,
  GST_RATES,
  shouldApplyCGSTAndSGST, // kept but not used in current calculation
  calculateGSTAmounts,
  getStateName,
  isValidStateCode,
  getCustomerStateCode,
  getCompanyStateCode,
  getStateCodeFromName
}; 