const fs = require('fs');
const path = require('path');

function parseCSV(content) {
  const lines = content.trim().split('\n');
  const data = [];
  
  // Skip the first two rows (headers and empty row)
  for (let i = 2; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;
    
    const row = [];
    let inQuotes = false;
    let currentVal = '';
    
    for (let j = 0; j < line.length; j++) {
      let char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(currentVal.trim());
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    row.push(currentVal.trim());
    if (row.length >= 7) {
      data.push({
        Institute: row[0],
        Program: row[1],
        Quota: row[2],
        SeatType: row[3],
        Gender: row[4],
        OpeningRank: row[5],
        ClosingRank: row[6]
      });
    }
  }
  return data;
}

function getShortInstituteName(name) {
  name = name.replace(/\s+/g, ' ').trim();
  if (name.includes('Indian Institute of Technology')) {
    let city = name.split('Indian Institute of Technology')[1].trim();
    return 'IIT ' + city;
  }
  if (name.includes('National Institute of Technology')) {
    let city = name.split('National Institute of Technology')[1].trim();
    if (city.startsWith(',')) city = city.substring(1).trim();
    if (name.includes('Dr. B R Ambedkar')) return 'NIT Jalandhar';
    if (name.includes('Malaviya')) return 'MNIT Jaipur';
    if (name.includes('Maulana Azad')) return 'MANIT Bhopal';
    if (name.includes('Motilal Nehru')) return 'MNNIT Allahabad';
    return 'NIT ' + city;
  }
  if (name.includes('Indian Institute of Information Technology')) {
    let city = name.split('Indian Institute of Information Technology')[1].trim();
    if (city.startsWith(',')) city = city.substring(1).trim();
    return 'IIIT ' + city;
  }
  return name;
}

function getShortBranchName(name) {
  if (name.includes('(')) {
    return name.split('(')[0].trim();
  }
  return name;
}

let placementMap = {};
try {
  const placementContent = fs.readFileSync('../exhaustive_strategic_analysis_of_joint_seat_allocation_authority_josaa_institutions_placement_dynamics_branch_preferences_and_compensation_trajectories.csv', 'utf8');
  const placementLines = placementContent.trim().split('\n');
  const pHeaders = placementLines[0].split(',').map(h => h.trim());
  
  for (let i = 1; i < placementLines.length; i++) {
    let line = placementLines[i].trim();
    if (!line) continue;
    let row = {};
    let inQ = false, curr = '', col = 0;
    for (let j = 0; j < line.length; j++) {
      let char = line[j];
      if (char === '"') inQ = !inQ;
      else if (char === ',' && !inQ) {
        row[pHeaders[col] || col] = curr.trim();
        curr = '';
        col++;
      } else curr += char;
    }
    row[pHeaders[col] || col] = curr.trim();
    
    const key = (row['Institution'] + '||' + row['Branch']).toLowerCase();
    placementMap[key] = {
      placementPercentage: row['Placement Percentage'],
      averagePackage: row['Average Package (LPA)'],
      medianPackage: row['Median Package (LPA)'],
      highestPackage: row['Highest Package']
    };
  }
} catch (e) {
  console.log("Placement file not found or couldn't be parsed");
}

function processCSABFile(inputFile, outputFile) {
  if (!fs.existsSync(inputFile)) {
    console.log(`File not found: ${inputFile}`);
    return;
  }
  const content = fs.readFileSync(inputFile, 'utf8');
  const allData = parseCSV(content);

  const processedCSAB = allData.map(row => {
    const shortInst = getShortInstituteName(row.Institute);
    const shortBranch = getShortBranchName(row.Program);
    
    const pKey = (shortInst + '||' + shortBranch).toLowerCase();
    let finalPlacement = placementMap[pKey] || null;
    
    if (!finalPlacement) {
      const pKeyAlt = Object.keys(placementMap).find(k => 
        k.includes(shortInst.toLowerCase()) && k.includes(shortBranch.toLowerCase().split(' ')[0])
      );
      if (pKeyAlt) {
        finalPlacement = placementMap[pKeyAlt];
      }
    }
    
    let shortQuota = row.Quota;
    if (row.Quota === 'All India') shortQuota = 'AI';
    if (row.Quota === 'Home State') shortQuota = 'HS';
    if (row.Quota === 'Other State') shortQuota = 'OS';

    return {
      institute: shortInst,
      program: shortBranch,
      fullProgram: row.Program,
      quota: shortQuota,
      seatType: row.SeatType,
      gender: row.Gender,
      openingRank: parseInt(row.OpeningRank) || row.OpeningRank,
      closingRank: parseInt(row.ClosingRank) || row.ClosingRank,
      placement: finalPlacement || {
        placementPercentage: 'Not Available',
        averagePackage: 'Not Available',
        medianPackage: 'Not Available',
        highestPackage: 'Not Available'
      }
    };
  });

  const cleanedData = processedCSAB.filter(row => !isNaN(row.closingRank));
  fs.writeFileSync(path.join(__dirname, 'public', outputFile), JSON.stringify(cleanedData, null, 2));
  console.log(`Saved ${outputFile}`);
}

const csvFiles = [
  { in: '../admissions.csv', out: 'csab_round1.json' },
  { in: '../admissions (1).csv', out: 'csab_round2.json' },
  { in: '../admissions (2).csv', out: 'csab_round3.json' }
];

csvFiles.forEach(f => {
  processCSABFile(path.join(__dirname, f.in), f.out);
});
