/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Data directory path
const DATA_DIR = path.join(
  os.homedir(),
  'Library/Application Support/당근 랜덤 런치 조 편성기/data'
);
const ASSIGNMENTS_DIR = path.join(DATA_DIR, 'assignments');
const EDGE_WEIGHTS_PATH = path.join(DATA_DIR, 'edge-weights.json');

// Migration source files
const HISTORIES_PATH = path.join(__dirname, 'HISTORIES.md');
const CURRENT_MEMBERS_PATH = path.join(__dirname, 'CURRENT_MEMBERS.md');

/**
 * Parse CURRENT_MEMBERS.md to create nickname -> ID mapping
 */
function parseCurrentMembers() {
  const content = fs.readFileSync(CURRENT_MEMBERS_PATH, 'utf-8');
  const lines = content.trim().split('\n');

  const nicknameToId = {};

  lines.forEach(line => {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 2) {
      const id = parseInt(parts[0], 10);
      const nickname = parts[1];
      nicknameToId[nickname] = id;
    }
  });

  return nicknameToId;
}

/**
 * Parse HISTORIES.md to extract all round data
 */
function parseHistories() {
  const content = fs.readFileSync(HISTORIES_PATH, 'utf-8');
  const lines = content.trim().split('\n');

  const rounds = [];
  let currentRound = null;

  lines.forEach(line => {
    const trimmed = line.trim();

    // Check for date marker like [2025/08/05]
    const dateMatch = trimmed.match(/^\[(\d{4})\/(\d{2})\/(\d{2})\]$/);
    if (dateMatch) {
      if (currentRound && currentRound.groups.length > 0) {
        rounds.push(currentRound);
      }

      let year = parseInt(dateMatch[1], 10);
      const month = parseInt(dateMatch[2], 10);
      const day = parseInt(dateMatch[3], 10);

      // Fix year for dates in January (should be 2026)
      if (month === 1 && year === 2025) {
        year = 2026;
      }

      currentRound = {
        date: { year, month, day },
        groups: [],
      };
      return;
    }

    // Skip empty lines
    if (trimmed === '') {
      return;
    }

    // Parse group line (tab or space separated nicknames)
    if (currentRound) {
      const nicknames = trimmed.split(/\s+/).filter(n => n && n !== '');
      if (nicknames.length > 0) {
        currentRound.groups.push(nicknames);
      }
    }
  });

  // Don't forget the last round
  if (currentRound && currentRound.groups.length > 0) {
    rounds.push(currentRound);
  }

  return rounds;
}

/**
 * Convert nickname to ID, return null if not found (retired member)
 */
function nicknameToIdOrNull(nickname, nicknameToId) {
  // Handle some edge cases in the data
  const normalized = nickname.trim();

  // Handle trailing dots
  const withoutDot = normalized.replace(/\.$/, '');

  return nicknameToId[normalized] || nicknameToId[withoutDot] || null;
}

/**
 * Get edge key for two member IDs (always smaller-larger)
 */
function getEdgeKey(id1, id2) {
  const [smaller, larger] = id1 < id2 ? [id1, id2] : [id2, id1];
  return `${smaller}-${larger}`;
}

/**
 * Calculate edge updates from groups
 */
function calculateEdgeUpdates(groups) {
  const updates = [];

  groups.forEach(group => {
    const members = group.members;
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const key = getEdgeKey(members[i], members[j]);
        updates.push({ pair: key, incrementBy: 1 });
      }
    }
  });

  return updates;
}

/**
 * Main migration function
 */
function migrate() {
  console.log('Starting migration...\n');

  // Parse source files
  console.log('Parsing CURRENT_MEMBERS.md...');
  const nicknameToId = parseCurrentMembers();
  console.log(`Found ${Object.keys(nicknameToId).length} current members\n`);

  console.log('Parsing HISTORIES.md...');
  const rounds = parseHistories();
  console.log(`Found ${rounds.length} rounds of random lunch history\n`);

  // Process each round
  const edgeWeights = {};

  console.log('Processing rounds and creating assignments...\n');

  rounds.forEach((round, index) => {
    const { date, groups: groupNicknames } = round;

    // Convert nicknames to IDs
    const convertedGroups = [];
    let totalMembers = 0;
    let retiredMembers = 0;

    groupNicknames.forEach(nicknames => {
      const memberIds = nicknames
        .map(nickname => {
          const id = nicknameToIdOrNull(nickname, nicknameToId);
          if (!id) {
            retiredMembers++;
            console.log(`  - Skipping retired member: ${nickname}`);
          }
          return id;
        })
        .filter(id => id !== null);

      totalMembers += nicknames.length;

      // Only add group if it has at least 2 current members
      if (memberIds.length >= 2) {
        convertedGroups.push({ members: memberIds });
      }
    });

    console.log(
      `Round [${date.year}/${String(date.month).padStart(2, '0')}/${String(date.day).padStart(2, '0')}]:`
    );
    console.log(`  - Total members in history: ${totalMembers}`);
    console.log(`  - Retired members (skipped): ${retiredMembers}`);
    console.log(`  - Valid groups: ${convertedGroups.length}`);

    // Calculate participating members
    const participatingMembersSet = new Set();
    convertedGroups.forEach(group => {
      group.members.forEach(id => participatingMembersSet.add(id));
    });
    const participatingMembers = Array.from(participatingMembersSet).sort((a, b) => a - b);

    console.log(`  - Current members participating: ${participatingMembers.length}\n`);

    // Generate timestamp for Korea time 11:00 AM
    // Korea is UTC+9, so 11:00 AM KST = 02:00 AM UTC
    const timestamp = Date.UTC(date.year, date.month - 1, date.day, 2, 0, 0, 0);

    // Calculate edge updates
    const edgeUpdates = calculateEdgeUpdates(convertedGroups);

    // Update edge weights
    edgeUpdates.forEach(update => {
      edgeWeights[update.pair] = (edgeWeights[update.pair] || 0) + update.incrementBy;
    });

    // Create assignment file
    const assignment = {
      timestamp,
      groups: convertedGroups,
      participatingMembers,
      edgeUpdates,
    };

    // Save assignment
    const fileName = `assignment-${timestamp}.json`;
    const filePath = path.join(ASSIGNMENTS_DIR, fileName);
    fs.writeFileSync(filePath, JSON.stringify(assignment, null, 2), 'utf-8');
    console.log(`  ✓ Saved ${fileName}\n`);
  });

  // Save edge weights
  console.log('Saving edge weights...');
  fs.writeFileSync(EDGE_WEIGHTS_PATH, JSON.stringify(edgeWeights, null, 2), 'utf-8');
  console.log(`✓ Saved edge-weights.json with ${Object.keys(edgeWeights).length} edges\n`);

  console.log('Migration completed successfully!');
  console.log(`\nSummary:`);
  console.log(`- Processed ${rounds.length} rounds`);
  console.log(`- Created ${rounds.length} assignment files`);
  console.log(`- Calculated ${Object.keys(edgeWeights).length} edge weights`);
}

// Run migration
try {
  migrate();
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}
