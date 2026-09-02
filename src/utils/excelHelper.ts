import * as XLSX from 'xlsx';
import { ClientInfo } from '../types';

export const CLIENT_EXCEL_HEADERS = [
  { key: 'cid', label: 'Customer ID (CID)' },
  { key: 'name', label: 'Client Name' },
  { key: 'phone', label: 'Mobile Phone' },
  { key: 'userName', label: 'PPPoE Username' },
  { key: 'password', label: 'PPPoE Password' },
  { key: 'package', label: 'Subscribed Package' },
  { key: 'monthlyBill', label: 'Monthly Bill (BDT)' },
  { key: 'billType', label: 'Bill Payment Type' },
  { key: 'area', label: 'Area / Union' },
  { key: 'zoneName', label: 'Zone Name' },
  { key: 'popName', label: 'PoP Node' },
  { key: 'ipAddress', label: 'Assigned IP Address' },
  { key: 'ipType', label: 'IP Type' },
  { key: 'onuMac', label: 'ONU MAC Address' },
  { key: 'routerMac', label: 'WiFi Router MAC' },
  { key: 'onuOwner', label: 'ONU Ownership' },
  { key: 'opticalPower', label: 'Optical Rx Power (dBm)' },
  { key: 'nidNumber', label: 'NID / Smart Card No' },
  { key: 'email', label: 'Email Address' },
  { key: 'address', label: 'Physical Address / Village' },
  { key: 'gpsCoordinates', label: 'GPS Coordinates' },
  { key: 'status', label: 'Connection Status' },
  { key: 'remarks', label: 'Technician Remarks' },
];

// Generates and downloads a rich .xlsx Excel workbook
export const exportClientsToExcel = (clients: ClientInfo[], fileNamePrefix = 'Delta_ISP_Mithapukur_Subscribers') => {
  const wb = XLSX.utils.book_new();

  // 1. Subscribers Sheet
  const clientRows = clients.map((c, index) => ({
    'SL': index + 1,
    'Customer ID (CID)': c.cid,
    'Client Name': c.name,
    'Mobile Phone': c.phone,
    'PPPoE Username': c.userName || c.cid.toLowerCase(),
    'PPPoE Password': c.password || '123456',
    'Package': c.package,
    'Monthly Bill (BDT)': c.monthlyBill || c.balance || 0,
    'Payment Type': c.billType || 'bKash',
    'Area / Union': c.area,
    'Zone Name': c.zoneName || 'Main Zone',
    'PoP Node': c.popName || 'Mithapukur HQ PoP',
    'IP Address': c.ipAddress,
    'IP Type': c.ipType || 'Real IP',
    'ONU MAC': c.onuMac,
    'Router MAC': c.routerMac || 'N/A',
    'ONU Ownership': c.onuOwner || 'Client',
    'Optical Rx (dBm)': c.opticalPower,
    'NID Number': c.nidNumber || '',
    'Email Address': c.email || '',
    'Physical Address': c.address || '',
    'GPS Lat-Lng': c.gpsCoordinates || '',
    'Status': c.status,
    'Remarks / Notes': c.remarks || '',
  }));

  const wsSubscribers = XLSX.utils.json_to_sheet(clientRows);

  // Set column widths for readability
  const colWidths = [
    { wch: 6 },  // SL
    { wch: 14 }, // CID
    { wch: 22 }, // Name
    { wch: 16 }, // Phone
    { wch: 18 }, // PPPoE User
    { wch: 16 }, // PPPoE Pass
    { wch: 18 }, // Package
    { wch: 16 }, // Monthly Bill
    { wch: 14 }, // Payment Type
    { wch: 24 }, // Area
    { wch: 18 }, // Zone Name
    { wch: 20 }, // PoP Node
    { wch: 18 }, // IP Address
    { wch: 14 }, // IP Type
    { wch: 20 }, // ONU MAC
    { wch: 20 }, // Router MAC
    { wch: 14 }, // ONU Owner
    { wch: 16 }, // Optical Power
    { wch: 18 }, // NID
    { wch: 24 }, // Email
    { wch: 28 }, // Address
    { wch: 22 }, // GPS
    { wch: 12 }, // Status
    { wch: 26 }, // Remarks
  ];
  wsSubscribers['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, wsSubscribers, 'Subscribers');

  // 2. Summary & Metrics Sheet
  const activeCount = clients.filter(c => c.status === 'Active').length;
  const suspendedCount = clients.filter(c => c.status === 'Suspended').length;
  const totalRevenue = clients.reduce((acc, c) => acc + (c.monthlyBill || c.balance || 0), 0);

  // Area distribution
  const areaCounts: Record<string, number> = {};
  clients.forEach(c => {
    areaCounts[c.area] = (areaCounts[c.area] || 0) + 1;
  });

  const summaryRows = [
    { 'Metric Name': 'Total Subscribers', 'Metric Value': clients.length },
    { 'Metric Name': 'Active Connections', 'Metric Value': activeCount },
    { 'Metric Name': 'Suspended / Due Connections', 'Metric Value': suspendedCount },
    { 'Metric Name': 'Estimated Total Monthly Revenue (BDT)', 'Metric Value': totalRevenue },
    { 'Metric Name': 'Export Date & Time', 'Metric Value': new Date().toLocaleString('en-GB') },
    { 'Metric Name': 'ISP Branch', 'Metric Value': 'Delta Internet Service (Mithapukur NOC)' },
    { 'Metric Name': '---', 'Metric Value': '---' },
    { 'Metric Name': 'AREA DISTRIBUTION SUMMARY', 'Metric Value': '' },
    ...Object.entries(areaCounts).map(([area, count]) => ({
      'Metric Name': area,
      'Metric Value': `${count} Subscribers`,
    }))
  ];

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 36 }, { wch: 28 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'NOC Summary & Metrics');

  // Export file
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${fileNamePrefix}_${dateStr}.xlsx`);
};

// Generates and downloads a clean, sample Excel template for importing
export const downloadClientExcelTemplate = () => {
  const wb = XLSX.utils.book_new();

  const templateRows = [
    {
      'Customer ID (CID)': 'CID-1051',
      'Client Name': 'Md. Rafiqul Islam (Sample)',
      'Mobile Phone': '01712-345678',
      'PPPoE Username': 'rafiq.mitha',
      'PPPoE Password': 'User@2026',
      'Package': 'Premium 30 Mbps',
      'Monthly Bill (BDT)': 1000,
      'Payment Type': 'bKash',
      'Area / Union': 'মিঠাপুকুর সদর (Mithapukur Sadar)',
      'Zone Name': 'Zone-A (Hospital Road)',
      'PoP Node': 'Mithapukur Main HQ PoP',
      'IP Address': '103.145.118.151',
      'IP Type': 'Real IP',
      'ONU MAC': 'F8:4D:89:12:34:56',
      'Router MAC': '00:1A:2B:3C:4D:5E',
      'ONU Ownership': 'Client',
      'Optical Rx (dBm)': '-19.5 dBm',
      'NID Number': '1992857463920',
      'Email Address': 'rafiq@deltamithapukur.com',
      'Physical Address': 'Bypass Road, Ward 4, Mithapukur',
      'GPS Lat-Lng': '25.5782, 89.2844',
      'Status': 'Active',
      'Remarks / Notes': 'New FTTH drop cable 120m installed',
    },
    {
      'Customer ID (CID)': 'CID-1052',
      'Client Name': 'Farzana Akter (Sample)',
      'Mobile Phone': '01890-123456',
      'PPPoE Username': 'farzana.paira',
      'PPPoE Password': 'User@2026',
      'Package': 'Home Standard 20 Mbps',
      'Monthly Bill (BDT)': 800,
      'Payment Type': 'Nagad',
      'Area / Union': 'পায়রাবন্দ (Pairaband)',
      'Zone Name': 'Zone-B (Pairaband Bazar)',
      'PoP Node': 'Pairaband Secondary PoP',
      'IP Address': '103.145.118.152',
      'IP Type': 'Shared IP',
      'ONU MAC': 'E4:95:6E:98:76:54',
      'Router MAC': '34:2C:C4:55:66:77',
      'ONU Ownership': 'Office',
      'Optical Rx (dBm)': '-21.2 dBm',
      'NID Number': '1994628391048',
      'Email Address': 'farzana@gmail.com',
      'Physical Address': 'Begum Rokeya Smriti Complex Road, Pairaband',
      'GPS Lat-Lng': '25.6120, 89.2980',
      'Status': 'Active',
      'Remarks / Notes': 'Dual-Band Router configured',
    }
  ];

  const ws = XLSX.utils.json_to_sheet(templateRows);

  const colWidths = [
    { wch: 16 }, // CID
    { wch: 24 }, // Name
    { wch: 16 }, // Phone
    { wch: 18 }, // PPPoE User
    { wch: 16 }, // PPPoE Pass
    { wch: 22 }, // Package
    { wch: 18 }, // Monthly Bill
    { wch: 14 }, // Payment Type
    { wch: 28 }, // Area
    { wch: 22 }, // Zone Name
    { wch: 22 }, // PoP Node
    { wch: 18 }, // IP Address
    { wch: 14 }, // IP Type
    { wch: 20 }, // ONU MAC
    { wch: 20 }, // Router MAC
    { wch: 14 }, // ONU Owner
    { wch: 16 }, // Optical Power
    { wch: 18 }, // NID
    { wch: 24 }, // Email
    { wch: 32 }, // Address
    { wch: 22 }, // GPS
    { wch: 12 }, // Status
    { wch: 28 }, // Remarks
  ];
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Client Import Template');
  XLSX.writeFile(wb, 'Delta_ISP_Client_Import_Template.xlsx');
};

// Generates and downloads a clean, sample CSV template for importing
export const downloadClientCsvTemplate = () => {
  const headers = [
    'CID',
    'Name',
    'Phone',
    'Address',
    'Area',
    'Package',
    'Email',
    'PPPoE Username',
    'PPPoE Password',
    'Monthly Bill',
    'IP Address',
    'ONU MAC',
    'Status'
  ];

  const sampleRows = [
    [
      'CID-1051',
      'Md. Rafiqul Islam',
      '01712-345678',
      'Bypass Road, Ward 4, Mithapukur',
      'মিঠাপুকুর সদর (Mithapukur Sadar)',
      'Premium 30 Mbps',
      'rafiq@deltamithapukur.com',
      'rafiq.mitha',
      'User@2026',
      '1000',
      '103.145.118.151',
      'F8:4D:89:12:34:56',
      'Active'
    ],
    [
      'CID-1052',
      'Farzana Akter',
      '01890-123456',
      'Begum Rokeya Smriti Complex Road, Pairaband',
      'পায়রাবন্দ (Pairaband)',
      'Home Standard 20 Mbps',
      'farzana@gmail.com',
      'farzana.paira',
      'User@2026',
      '800',
      '103.145.118.152',
      'E4:95:6E:98:76:54',
      'Active'
    ]
  ];

  const csvContent = [
    headers.map(h => `"${h}"`).join(','),
    ...sampleRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Delta_ISP_Client_Import_Template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Flexible helper to normalize column names from various Excel headers
const getField = (row: any, candidates: string[]): any => {
  for (const c of candidates) {
    if (row[c] !== undefined && row[c] !== null && String(row[c]).trim() !== '') {
      return String(row[c]).trim();
    }
  }
  // Try case-insensitive matching
  const keys = Object.keys(row);
  for (const c of candidates) {
    const matchedKey = keys.find(k => k.trim().toLowerCase() === c.trim().toLowerCase());
    if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null && String(row[matchedKey]).trim() !== '') {
      return String(row[matchedKey]).trim();
    }
  }
  return undefined;
};

// Parse Excel file buffer or array buffer to ClientInfo[]
export const parseClientExcelFile = async (file: File, existingClients: ClientInfo[] = []): Promise<{
  clients: ClientInfo[];
  errors: string[];
  totalRows: number;
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // First sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          resolve({ clients: [], errors: ['Uploaded Excel file contains no data rows.'], totalRows: 0 });
          return;
        }

        const parsedClients: ClientInfo[] = [];
        const errors: string[] = [];
        let autoCidIndex = existingClients.length + 1001;

        rawJson.forEach((row, idx) => {
          const rowNum = idx + 2; // +1 for 0-index, +1 for header row

          const rawName = getField(row, ['Client Name', 'Name', 'Customer Name', 'name', 'গ্রাহকের নাম']);
          const rawPhone = getField(row, ['Mobile Phone', 'Phone', 'Mobile', 'phone', 'মোবাইল']);
          
          if (!rawName && !rawPhone) {
            // Empty spacer row
            return;
          }

          let rawCid = getField(row, ['Customer ID (CID)', 'CID', 'Customer ID', 'cid', 'Client ID', 'আইডি']);
          if (!rawCid) {
            rawCid = `CID-${autoCidIndex++}`;
          }

          const rawPackage = getField(row, ['Package', 'Subscribed Package', 'Package Speed', 'package', 'প্যাকেজ']) || 'Standard 15 Mbps';
          const rawBillStr = getField(row, ['Monthly Bill (BDT)', 'Monthly Bill', 'Bill', 'Monthly Charge', 'monthlyBill', 'বিল']);
          const monthlyBill = rawBillStr ? parseFloat(rawBillStr.replace(/[^0-9.]/g, '')) || 800 : 800;

          const rawArea = getField(row, ['Area / Union', 'Area', 'Union', 'area', 'এলাকা']) || 'মিঠাপুকুর সদর (Mithapukur Sadar)';
          const rawZone = getField(row, ['Zone Name', 'Zone', 'zoneName', 'জোন']) || 'Zone-A (Main)';
          const rawPop = getField(row, ['PoP Node', 'PoP Name', 'PoP', 'popName', 'পপ']) || 'Mithapukur HQ PoP';

          const rawIp = getField(row, ['Assigned IP Address', 'IP Address', 'IP', 'ipAddress', 'আইপি']) || `103.145.118.${100 + (idx % 150)}`;
          const rawIpType = getField(row, ['IP Type', 'ipType']) || 'Real IP';

          const rawOnuMac = getField(row, ['ONU MAC Address', 'ONU MAC', 'onuMac', 'ম্যাক']) || `F8:4D:89:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}`;
          const rawRouterMac = getField(row, ['WiFi Router MAC', 'Router MAC', 'routerMac']) || 'N/A';
          const rawOnuOwner = getField(row, ['ONU Ownership', 'ONU Owner', 'onuOwner']) || 'Client';

          const rawOptPower = getField(row, ['Optical Rx Power (dBm)', 'Optical Power', 'Optical Rx (dBm)', 'opticalPower', 'অপটিক্যাল']) || '-19.8 dBm';
          const rawNid = getField(row, ['NID / Smart Card No', 'NID Number', 'NID', 'nidNumber', 'জাতীয় পরিচয়পত্র']) || '';
          const rawEmail = getField(row, ['Email Address', 'Email', 'email', 'ইমেইল']) || `${rawCid.toLowerCase()}@deltamithapukur.com`;
          const rawAddress = getField(row, ['Physical Address / Village', 'Physical Address', 'Address', 'address', 'ঠিকানা']) || 'Mithapukur, Rangpur';
          const rawGps = getField(row, ['GPS Coordinates', 'GPS Lat-Lng', 'GPS', 'gpsCoordinates']) || '25.5782, 89.2844';
          const rawStatusStr = getField(row, ['Connection Status', 'Status', 'status', 'স্ট্যাটাস']) || 'Active';
          const status: 'Active' | 'Suspended' = String(rawStatusStr).toLowerCase().includes('suspend') || String(rawStatusStr).toLowerCase().includes('inactive') ? 'Suspended' : 'Active';

          const rawUser = getField(row, ['PPPoE Username', 'Username', 'User Name', 'userName', 'ইউজারনেম']) || rawCid.toLowerCase();
          const rawPass = getField(row, ['PPPoE Password', 'Password', 'password', 'পাসওয়ার্ড']) || '123456';
          const rawBillType = getField(row, ['Bill Payment Type', 'Payment Type', 'Bill Type', 'billType']) || 'bKash';
          const rawRemarks = getField(row, ['Technician Remarks', 'Remarks / Notes', 'Remarks', 'remarks', 'মন্তব্য']) || 'Imported via Excel Batch Import';

          const clientObj: ClientInfo = {
            cid: rawCid,
            name: rawName || `Subscriber ${rawCid}`,
            phone: rawPhone || '01700-000000',
            email: rawEmail,
            address: rawAddress,
            area: rawArea,
            package: rawPackage,
            ipAddress: rawIp,
            onuMac: rawOnuMac,
            opticalPower: rawOptPower,
            balance: monthlyBill,
            status,
            userName: rawUser,
            password: rawPass,
            onuOwner: (rawOnuOwner === 'Office' ? 'Office' : 'Client'),
            popName: rawPop,
            zoneName: rawZone,
            monthlyBill,
            billType: (rawBillType === 'Nagad' || rawBillType === 'Cash' || rawBillType === 'Bank') ? rawBillType : 'bKash',
            routerMac: rawRouterMac,
            ipType: (rawIpType === 'Shared IP' || rawIpType === 'Static IP') ? rawIpType : 'Real IP',
            nidNumber: rawNid,
            gpsCoordinates: rawGps,
            remarks: rawRemarks,
          };

          parsedClients.push(clientObj);
        });

        resolve({
          clients: parsedClients,
          errors,
          totalRows: rawJson.length,
        });
      } catch (err: any) {
        reject(new Error(err?.message || 'Failed to read Excel file format.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read uploaded file.'));
    };

    reader.readAsArrayBuffer(file);
  });
};
