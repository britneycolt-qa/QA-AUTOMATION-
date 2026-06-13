#!/usr/bin/env node
/**
 * Valida el estado de El Consejo para todos los tests del repo.
 *
 * Reglas:
 *   @unreviewed  → debe tener .council.md (aunque sea incompleto, avisa qué falta)
 *   @regression  → debe tener .council.md con los 5 puntos [x]  (bloquea si no)
 *
 * Uso: node scripts/check-council.mjs [proyecto]
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { globSync } from 'node:fs';

const ROOT = resolve(import.meta.dirname, '..');
const targetProject = process.argv[2];
const pattern = targetProject
  ? `projects/${targetProject}/tests/**/*.spec.ts`
  : 'projects/*/tests/**/*.spec.ts';

const COUNCIL_POINTS = [
  { id: 'rompedor',   emoji: '🔴', label: 'Rompedor'      },
  { id: 'cobertura',  emoji: '🟠', label: 'Cobertura'     },
  { id: 'aserciones', emoji: '🟡', label: 'Aserciones'    },
  { id: 'fuego',      emoji: '🔵', label: 'Prueba de fuego'},
  { id: 'fiabilidad', emoji: '⚪', label: 'Fiabilidad'    },
];

function extractTags(content) {
  return (content.match(/@\w+/g) || []).map(t => t.toLowerCase());
}

function extractSpecHeader(content) {
  const line = content.split('\n').slice(0, 5).find(l => l.trim().startsWith('// Spec:'));
  return line ? line.replace('// Spec:', '').trim() : null;
}

function findProjectDir(absSpecPath) {
  let dir = dirname(absSpecPath);
  for (let i = 0; i < 6; i++) {
    if (existsSync(join(dir, 'playwright.config.ts'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function checkCouncilPoints(councilFile) {
  const content = readFileSync(councilFile, 'utf8');
  // Divide el archivo en secciones por cada punto (## ... **Label**)
  // y busca [x] dentro de la sección correspondiente
  return COUNCIL_POINTS.map((p, i) => {
    const nextLabel = COUNCIL_POINTS[i + 1]?.label;
    // Extrae el texto desde el label hasta el próximo label (o fin de archivo)
    const sectionRx = nextLabel
      ? new RegExp(`\\*\\*${p.label}\\*\\*[\\s\\S]*?(?=\\*\\*${nextLabel}\\*\\*)`, 'i')
      : new RegExp(`\\*\\*${p.label}\\*\\*[\\s\\S]*$`, 'i');
    const section = content.match(sectionRx)?.[0] ?? '';
    return { ...p, approved: /\[x\]/i.test(section) };
  });
}

const files = globSync(pattern, { cwd: ROOT });

if (files.length === 0) {
  console.log('No se encontraron archivos .spec.ts.');
  process.exit(0);
}

let warnings = 0;
let errors = 0;

console.log('\n' + '═'.repeat(60));
console.log('  EL CONSEJO — estado de revisión');
console.log('═'.repeat(60) + '\n');

for (const relPath of files) {
  const absPath = join(ROOT, relPath);
  const content = readFileSync(absPath, 'utf8');
  const tags = extractTags(content);
  const isUnreviewed = tags.includes('@unreviewed');
  const isRegression = tags.includes('@regression') && !isUnreviewed;

  if (!isUnreviewed && !isRegression) continue;

  const specRelPath = extractSpecHeader(content);
  const projectDir = findProjectDir(absPath);

  if (!specRelPath || !projectDir) {
    console.log(`⛔ SIN SPEC  ${relPath}`);
    console.log(`   Corré npm run check-specs primero.\n`);
    errors++;
    continue;
  }

  const councilFile = join(projectDir, specRelPath.replace('.spec.md', '.council.md'));

  if (!existsSync(councilFile)) {
    if (isRegression) {
      console.log(`❌ @regression SIN CONSEJO  ${relPath}`);
      console.log(`   Falta: ${councilFile.replace(ROOT + '/', '')}`);
      console.log(`   Un test no puede estar en @regression sin El Consejo completo.\n`);
      errors++;
    } else {
      console.log(`⏳ @unreviewed sin consejo aún  ${relPath}`);
      console.log(`   Corré los tests para que se genere el template automáticamente.\n`);
      warnings++;
    }
    continue;
  }

  const points = checkCouncilPoints(councilFile);
  const allApproved = points.every(p => p.approved);
  const pending = points.filter(p => !p.approved);

  if (isRegression && !allApproved) {
    console.log(`❌ @regression CON CONSEJO INCOMPLETO  ${relPath}`);
    pending.forEach(p => console.log(`   ${p.emoji} ${p.label}: pendiente`));
    console.log('');
    errors++;
  } else if (isUnreviewed && !allApproved) {
    console.log(`⏳ @unreviewed — Consejo en progreso  ${relPath}`);
    pending.forEach(p => console.log(`   ${p.emoji} ${p.label}: pendiente`));
    const done = points.filter(p => p.approved);
    if (done.length > 0) done.forEach(p => console.log(`   ${p.emoji} ${p.label}: ✅`));
    console.log('');
    warnings++;
  } else if (allApproved && isUnreviewed) {
    console.log(`🎓 LISTO PARA GRADUAR  ${relPath}`);
    console.log(`   Todos los puntos aprobados → cambiá @unreviewed por @regression\n`);
  } else if (allApproved && isRegression) {
    console.log(`✅ @regression OK  ${relPath}\n`);
  }
}

console.log('═'.repeat(60));
if (errors > 0) {
  console.log(`\n${errors} error(es) bloqueante(s). Completá El Consejo antes de continuar.`);
  process.exit(1);
} else if (warnings > 0) {
  console.log(`\n${warnings} test(s) @unreviewed con consejo pendiente. No es bloqueante.`);
  process.exit(0);
} else {
  console.log('\nTodo en orden.');
  process.exit(0);
}
