const fs = require('fs');
const readline = require('readline');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '../public/fuentes/Base_de_datos_Casen_2022_18_marzo_2024.csv');
const OUTPUT_FILE = path.join(__dirname, '../public/data/comuna-stats.json');

// Ensure output directory exists
const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function processLineByLine() {
  const fileStream = fs.createReadStream(INPUT_FILE);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let header = null;
  let indices = {};

  // Aggregation map: comuna_code -> { sum_income, count_income, count_poverty, total_count }
  const comunas = {};

  console.log('Starting processing...');
  let lineCount = 0;

  for await (const line of rl) {
    lineCount++;
    if (lineCount % 10000 === 0) process.stdout.write(`\rProcessed ${lineCount} lines...`);

    // Parse CSV line (semicolon separated)
    const parts = line.split(';');

    if (!header) {
      header = parts;
      // Find indices
      indices.comuna = header.indexOf('e9com_cod');
      indices.income = header.indexOf('ytot'); // Ingreso total
      indices.pobreza = header.indexOf('pobreza'); // 1=Extrema, 2=No extrema, 3=No pobre
      indices.exp = header.indexOf('expr'); // Factor de expansión (regional/comunal projection)

      console.log('\nIndices found:', indices);
      if (indices.comuna === -1 || indices.income === -1 || indices.pobreza === -1) {
        console.error('Critical columns missing!');
        process.exit(1);
      }
      continue;
    }

    const comunaCode = parts[indices.comuna];
    const incomeStr = parts[indices.income];
    const pobrezaStr = parts[indices.pobreza];
    const expStr = parts[indices.exp];

    if (!comunaCode) continue;

    // Initialize comuna stats if needed
    if (!comunas[comunaCode]) {
      comunas[comunaCode] = {
        sum_income: 0,
        count_income: 0,
        count_poverty: 0,
        total_count: 0,
        weighted_sum_income: 0,
        weighted_total: 0,
        weighted_poverty: 0
      };
    }

    const stats = comunas[comunaCode];
    const expansionFactor = parseFloat(expStr) || 1;

    // Income processing
    if (incomeStr && incomeStr !== '') {
      const income = parseFloat(incomeStr);
      if (!isNaN(income)) {
        stats.sum_income += income;
        stats.count_income++;
        stats.weighted_sum_income += (income * expansionFactor);
      }
    }

    // Poverty processing
    // CASEN: 1 = Pobreza extrema, 2 = Pobreza no extrema, 3 = No pobre
    if (pobrezaStr && pobrezaStr !== '') {
      const pobreza = parseInt(pobrezaStr, 10);
      stats.total_count++;
      stats.weighted_total += expansionFactor;

      if (pobreza === 1 || pobreza === 2) {
        stats.count_poverty++;
        stats.weighted_poverty += expansionFactor;
      }
    }
  }

  console.log('\n\nAggregation complete. calculating final stats...');

  const finalOutput = {};

  for (const [code, data] of Object.entries(comunas)) {
    // We use weighted averages for better accuracy if expansion factor is present
    const avgIncome = data.weighted_total > 0
      ? Math.round(data.weighted_sum_income / data.weighted_total)
      : 0;

    const povertyRate = data.weighted_total > 0
      ? (data.weighted_poverty / data.weighted_total)
      : 0;

    finalOutput[code] = {
      avg_income: avgIncome,
      poverty_rate: parseFloat(povertyRate.toFixed(4)),
      sample_size: data.total_count
    };
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalOutput, null, 2));
  console.log(`\nStats saved to ${OUTPUT_FILE}`);
  console.log(`Total Comunas processed: ${Object.keys(finalOutput).length}`);
}

processLineByLine().catch(err => console.error(err));
