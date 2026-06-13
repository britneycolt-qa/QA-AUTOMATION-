#!/usr/bin/env node
/**
 * Verifica que cada .spec.ts tenga:
 *   1. Un header "// Spec: <ruta>.spec.md" en las primeras 5 líneas
 *   2. Que el .spec.md referenciado exista en disco
 *
 * Uso: node scripts/check-specs.mjs [proyecto]
 *   node scripts/check-specs.mjs            → todos los proyectos
 *   node scripts/check-specs.mjs _template  → solo ese proyecto
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { globSync } from 'node:fs';

const ROOT = resolve(import.meta.dirname, '..');
const targetProject = process.argv[2];
const pattern = targetProject
  ? `projects/${targetProject}/tests/**/*.spec.ts`
  : 'projects/*/tests/**/*.spec.ts';

const files = globSync(pattern, { cwd: ROOT });

if (files.length === 0) {
  console.log('No se encontraron archivos .spec.ts.');
  process.exit(0);
}

let errors = 0;

for (const relPath of files) {
  const absPath = join(ROOT, relPath);
  const lines = readFileSync(absPath, 'utf8').split('\n').slice(0, 5);
  const headerLine = lines.find(l => l.trim().startsWith('// Spec:'));

  if (!headerLine) {
    console.error(`❌ SIN HEADER  ${relPath}`);
    console.error(`   Falta: // Spec: specs/<flujo>.spec.md en las primeras 5 líneas\n`);
    errors++;
    continue;
  }

  const specRelPath = headerLine.replace('// Spec:', '').trim();
  // El .spec.md se resuelve relativo al directorio del proyecto (projects/<c>/)
  const projectDir = relPath.split('/').slice(0, 2).join('/');
  const specAbsPath = join(ROOT, projectDir, specRelPath);

  if (!existsSync(specAbsPath)) {
    console.error(`❌ SPEC FALTANTE  ${relPath}`);
    console.error(`   Header apunta a: ${specRelPath}`);
    console.error(`   Ruta esperada:   ${specAbsPath}\n`);
    errors++;
    continue;
  }

  console.log(`✅  ${relPath}  →  ${specRelPath}`);
}

console.log('');
if (errors > 0) {
  console.error(`${errors} error(es) encontrado(s). Cada .spec.ts necesita su .spec.md antes de poder correr.`);
  process.exit(1);
} else {
  console.log(`Todos los tests tienen su spec. El flujo spec-driven está completo.`);
}
