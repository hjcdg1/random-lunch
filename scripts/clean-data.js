/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Target data directory (where the app stores data)
const DATA_DIR = path.join(
  os.homedir(),
  'Library/Application Support/당근 랜덤 런치 조 편성기/data'
);

/**
 * Check if data directory exists
 */
function dataDirectoryExists() {
  return fs.existsSync(DATA_DIR);
}

/**
 * Remove data directory recursively
 */
function cleanData() {
  try {
    fs.rmSync(DATA_DIR, { recursive: true, force: true });
    console.log('✓ Data directory removed successfully');
  } catch (error) {
    console.error('Failed to remove data directory:', error);
    throw error;
  }
}

/**
 * Main function
 */
function main() {
  console.log('당근 랜덤 런치 조 편성기 - 데이터 삭제\n');

  // Check if data directory exists
  console.log('Checking for existing data...');
  if (!dataDirectoryExists()) {
    console.log('✓ No data found. Nothing to clean.\n');
    return;
  }

  console.log(`✓ Data directory found: ${DATA_DIR}\n`);

  // Remove data directory
  console.log('Removing all data...');
  cleanData();

  console.log('\n✅ 모든 데이터가 삭제되었습니다!');
  console.log('\n다음 항목들이 삭제되었습니다:');
  console.log('  - 모든 조 편성 이력 파일');
  console.log('  - 엣지 가중치 데이터');
  console.log('  - 설정 파일');
  console.log('\n새로운 초기 데이터를 설정하려면 다음 명령을 실행하세요:');
  console.log('  npm run init-data\n');
}

// Run main function
try {
  main();
} catch (error) {
  console.error('\n❌ 데이터 삭제 중 오류가 발생했습니다:', error.message);
  process.exit(1);
}
