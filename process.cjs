const fs = require('fs');
const path = require('path');

function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;
    
    const row = {};
    let inQuotes = false;
    let currentVal = '';
    let colIdx = 0;
    
    for (let j = 0; j < line.length; j++) {
      let char = line[j];
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) {
        row[headers[colIdx] || colIdx] = currentVal.trim();
        currentVal = '';
        colIdx++;
      } else {
        currentVal += char;
      }
    }
    row[headers[colIdx] || colIdx] = currentVal.trim();
    data.push(row);
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
    return 'NIT ' + city;
  }
  if (name.includes('Indian Institute of Information Technology')) {
    let city = name.split('Indian Institute of Information Technology')[1].trim();
    return 'IIIT ' + city;
  }
  return name;
}

function getShortBranchName(name) {
  if (name.includes('(')) return name.split('(')[0].trim();
  return name;
}

const placementContent = fs.readFileSync('../exhaustive_strategic_analysis_of_joint_seat_allocation_authority_josaa_institutions_placement_dynamics_branch_preferences_and_compensation_trajectories.csv', 'utf8');
const placementData = parseCSV(placementContent);
const placementMap = {};
placementData.forEach(row => {
  const inst = row['Institution'];
  const branch = row['Branch'];
  const key = (inst + '||' + branch).toLowerCase();
  placementMap[key] = {
    placementPercentage: row['Placement Percentage'],
    averagePackage: row['Average Package (LPA)'],
    medianPackage: row['Median Package (LPA)'],
    highestPackage: row['Highest Package']
  };
});

function processFile(inputFile, outputFile) {
  if (!fs.existsSync(inputFile)) {
    console.log(`File not found: ${inputFile}`);
    return;
  }
  const content = fs.readFileSync(inputFile, 'utf8');
  const josaaData = parseCSV(content);

  const processed = josaaData.map(row => {
    const shortInst = getShortInstituteName(row['Institute']);
    const shortBranch = getShortBranchName(row['Academic Program Name']);
    
    const pKey = (shortInst + '||' + shortBranch).toLowerCase();
    let finalPlacement = placementMap[pKey] || null;
    if (!finalPlacement) {
      const pKeyAlt = Object.keys(placementMap).find(k => k.includes(shortInst.toLowerCase()) && k.includes(shortBranch.toLowerCase().split(' ')[0]));
      if (pKeyAlt) finalPlacement = placementMap[pKeyAlt];
    }

    return {
      institute: shortInst,
      program: shortBranch,
      fullProgram: row['Academic Program Name'],
      quota: row['Quota'],
      seatType: row['Seat Type'],
      gender: row['Gender'],
      openingRank: parseInt(row['Opening Rank']) || row['Opening Rank'],
      closingRank: parseInt(row['Closing Rank']) || row['Closing Rank'],
      placement: finalPlacement || { placementPercentage: 'Not Available', averagePackage: 'Not Available', medianPackage: 'Not Available', highestPackage: 'Not Available' }
    };
  });

  const cleanedData = processed.filter(row => !isNaN(row.closingRank));
  fs.writeFileSync(path.join(__dirname, 'public', outputFile), JSON.stringify(cleanedData, null, 2));
  console.log(`Saved ${outputFile}`);
}

for (let i = 1; i <= 6; i++) {
  processFile(`../josaa_or_cr_2025_round${i}.csv`, `josaa_round${i}.json`);
}
