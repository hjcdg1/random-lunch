/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Target data directory (where the app stores data)
const DATA_DIR = path.join(
  os.homedir(),
  'Library/Application Support/당근 랜덤 런치 조 편성기/data'
);
const ASSIGNMENTS_DIR = path.join(DATA_DIR, 'assignments');
const EDGE_WEIGHTS_PATH = path.join(DATA_DIR, 'edge-weights.json');

// Source data directory (migration results)
const SOURCE_DIR = path.join(__dirname, '../migration/result');
const SOURCE_ASSIGNMENTS_DIR = path.join(SOURCE_DIR, 'assignments');
const SOURCE_EDGE_WEIGHTS_PATH = path.join(SOURCE_DIR, 'edge-weights.json');

/**
 * Check if the data directory already has data
 */
function hasExistingData() {
  try {
    // Check if assignments directory exists and has files
    if (fs.existsSync(ASSIGNMENTS_DIR)) {
      const files = fs.readdirSync(ASSIGNMENTS_DIR);
      const assignmentFiles = files.filter(f => f.startsWith('assignment-') && f.endsWith('.json'));
      if (assignmentFiles.length > 0) {
        return true;
      }
    }

    // Check if edge-weights.json exists and is not empty
    if (fs.existsSync(EDGE_WEIGHTS_PATH)) {
      const content = fs.readFileSync(EDGE_WEIGHTS_PATH, 'utf-8');
      const data = JSON.parse(content);
      if (Object.keys(data).length > 0) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking existing data:', error);
    return false;
  }
}

/**
 * Initialize data directories
 */
function initializeDirectories() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.mkdirSync(ASSIGNMENTS_DIR, { recursive: true });
    console.log('✓ Created data directories');
  } catch (error) {
    console.error('Failed to create data directories:', error);
    throw error;
  }
}

/**
 * Copy migration result files to data directory
 */
function copyInitialData() {
  try {
    // Copy assignment files
    const assignmentFiles = fs.readdirSync(SOURCE_ASSIGNMENTS_DIR);
    let copiedCount = 0;

    assignmentFiles.forEach(file => {
      if (file.startsWith('assignment-') && file.endsWith('.json')) {
        const sourcePath = path.join(SOURCE_ASSIGNMENTS_DIR, file);
        const targetPath = path.join(ASSIGNMENTS_DIR, file);
        fs.copyFileSync(sourcePath, targetPath);
        copiedCount++;
      }
    });

    console.log(`✓ Copied ${copiedCount} assignment files`);

    // Copy edge weights
    fs.copyFileSync(SOURCE_EDGE_WEIGHTS_PATH, EDGE_WEIGHTS_PATH);
    console.log('✓ Copied edge-weights.json');
  } catch (error) {
    console.error('Failed to copy data:', error);
    throw error;
  }
}

/**
 * Main function
 */
function main() {
  console.log('당근 랜덤 런치 조 편성기 - 초기 데이터 설정\n');

  // Check for existing data
  console.log('Checking for existing data...');
  if (hasExistingData()) {
    console.error('\n❌ 초기화 실패: 이미 데이터가 존재합니다.');
    console.error('\n기존 데이터가 있는 상태에서는 초기화를 진행할 수 없습니다.');
    console.error('기존 데이터를 유지하려면 이 명령을 실행하지 마세요.');
    console.error('기존 데이터를 삭제하고 초기화하려면 다음 디렉토리를 수동으로 삭제하세요:');
    console.error(`  ${DATA_DIR}\n`);
    process.exit(1);
  }

  console.log('✓ No existing data found\n');

  // Initialize directories
  console.log('Creating data directories...');
  initializeDirectories();

  // Copy initial data
  console.log('\nCopying initial data from migration results...');
  copyInitialData();

  console.log('\n✅ 초기 데이터 설정이 완료되었습니다!');
  console.log('\n과거 17번의 랜덤 런치 이력이 적용되었습니다.');
  console.log('이제 프로그램을 실행하면 과거 이력을 기반으로 조 편성을 할 수 있습니다.\n');
}

// Run main function
try {
  main();
} catch (error) {
  console.error('\n❌ 초기화 중 오류가 발생했습니다:', error.message);
  process.exit(1);
}
