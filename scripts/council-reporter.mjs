/**
 * Council Reporter — Playwright reporter personalizado
 *
 * Después de cada corrida imprime El Consejo para cada test @unreviewed:
 * las 5 miradas obligatorias antes de graduar a @regression.
 *
 * También detecta tests @regression sin .council.md y los bloquea.
 *
 * Uso: agregado en playwright.config.base.ts como reporter.
 */

import { readFileSync, existsSync, writeFileSync, mkdirSync, appendFileSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';

const COUNCIL_POINTS = [
  { id: 'rompedor',  emoji: '🔴', label: 'Rompedor',     question: '¿Probaste caminos negativos, bordes, input inválido, doble clic? ¿O solo el happy path?' },
  { id: 'cobertura', emoji: '🟠', label: 'Cobertura',    question: '¿Quedó algún criterio del spec sin aserción?' },
  { id: 'aserciones',emoji: '🟡', label: 'Aserciones',   question: '¿Las aserciones verifican el resultado REAL o solo que "la página cargó"?' },
  { id: 'fuego',     emoji: '🔵', label: 'Prueba de fuego','question': '¿Rompiste a propósito el resultado esperado y el test se puso ROJO? (OBLIGATORIO)' },
  { id: 'fiabilidad',emoji: '⚪', label: 'Fiabilidad',   question: '¿Es flaky? ¿Tiene esperas duras? ¿Locators frágiles?' },
];

function extractTags(title) {
  return (title.match(/@\w+/g) || []).map(t => t.toLowerCase());
}

function councilPath(specFile, projectRoot) {
  // specs/smoke.spec.md → specs/smoke.council.md
  const specHeader = extractSpecHeader(specFile);
  if (!specHeader) return null;
  return join(projectRoot, specHeader.replace('.spec.md', '.council.md'));
}

function extractSpecHeader(specFile) {
  try {
    const lines = readFileSync(specFile, 'utf8').split('\n').slice(0, 5);
    const line = lines.find(l => l.trim().startsWith('// Spec:'));
    if (!line) return null;
    return line.replace('// Spec:', '').trim();
  } catch {
    return null;
  }
}

function councilComplete(councilFile) {
  if (!existsSync(councilFile)) return false;
  const content = readFileSync(councilFile, 'utf8');
  return COUNCIL_POINTS.every(p => {
    const rx = new RegExp(`\\*\\*${p.label}\\*\\*[^\\n]*\\n[^\\n]*\\[x\\]`, 'i');
    return rx.test(content);
  });
}

function createCouncilTemplate(councilFile, testTitle, specRelPath) {
  mkdirSync(dirname(councilFile), { recursive: true });
  const lines = [
    `# El Consejo — ${testTitle}`,
    `> Spec: ${specRelPath}`,
    `> Completá cada punto antes de cambiar @unreviewed → @regression.`,
    `> Marcá con [x] cuando el veredicto es APROBADO, [ ] si está pendiente.`,
    '',
    ...COUNCIL_POINTS.map(p => [
      `## ${p.emoji} **${p.label}**`,
      `_${p.question}_`,
      '',
      `- [ ] APROBADO`,
      `- Veredicto: _(escribí aquí qué probaste y qué encontraste)_`,
      '',
    ].join('\n')),
    '---',
    `> Cuando los 5 puntos estén [x], corré \`npm run check-council\` y graduá el test.`,
  ];
  writeFileSync(councilFile, lines.join('\n'));
}

export default class CouncilReporter {
  constructor(options, config) {
    this._config = config;
    this._results = [];
    this._projectRoot = config?.rootDir || process.cwd();
  }

  onTestEnd(test, result) {
    this._results.push({ test, result });
  }

  onEnd(result) {
    // ── Auto-update REGISTRO.md (regla: "tras cada corrida: una fila") ──
    this._appendRegistro(result);

    const unreviewed = this._results.filter(({ test }) =>
      extractTags(test.title).includes('@unreviewed')
    );
    const regression = this._results.filter(({ test }) =>
      extractTags(test.title).includes('@regression') && !extractTags(test.title).includes('@unreviewed')
    );

    if (unreviewed.length === 0 && regression.length === 0) return;

    console.log('\n' + '═'.repeat(70));
    console.log('  EL CONSEJO CRÍTICO — revisión obligatoria antes de graduar');
    console.log('═'.repeat(70));

    // ── Tests @unreviewed ──────────────────────────────────────────────
    if (unreviewed.length > 0) {
      console.log(`\n📋  Tests @unreviewed en esta corrida: ${unreviewed.length}\n`);

      for (const { test, result: r } of unreviewed) {
        const specFile = test.location?.file;
        const projectDir = this._findProjectDir(specFile);
        const specRelPath = specFile ? extractSpecHeader(specFile) : null;
        const cFile = specFile && projectDir ? councilPath(specFile, projectDir) : null;

        const status = r.status === 'passed' ? '✅' : r.status === 'failed' ? '❌' : '⚠️';
        console.log(`  ${status}  ${test.title}`);

        if (!specRelPath) {
          console.log(`     ⛔ Sin header "// Spec:" — corré npm run check-specs\n`);
          continue;
        }

        if (cFile && !existsSync(cFile)) {
          createCouncilTemplate(cFile, test.title, specRelPath);
          console.log(`     📝 Creado: ${cFile.replace(this._projectRoot + '/', '')}`);
        }

        if (cFile && councilComplete(cFile)) {
          console.log(`     ✅ Consejo completo — listo para graduar a @regression`);
        } else if (cFile) {
          console.log(`     ⏳ Consejo pendiente → completá: ${cFile.replace(this._projectRoot + '/', '')}`);
          COUNCIL_POINTS.forEach(p => {
            console.log(`        ${p.emoji} ${p.label}: ${p.question}`);
          });
        }
        console.log('');
      }
    }

    // ── Tests @regression sin Consejo ─────────────────────────────────
    const regressionSinConsejo = regression.filter(({ test }) => {
      const specFile = test.location?.file;
      const projectDir = this._findProjectDir(specFile);
      if (!specFile || !projectDir) return false;
      const cFile = councilPath(specFile, projectDir);
      return cFile && !councilComplete(cFile);
    });

    if (regressionSinConsejo.length > 0) {
      console.log(`\n🚨  Tests @regression SIN Consejo completo: ${regressionSinConsejo.length}`);
      console.log(`   Estos tests no debieron graduarse sin pasar El Consejo.\n`);
      for (const { test } of regressionSinConsejo) {
        console.log(`   ❌  ${test.title}`);
      }
      console.log('');
    }

    console.log('═'.repeat(70));
    console.log('  Corré: npm run check-council   para validar el estado completo');
    console.log('═'.repeat(70) + '\n');
  }

  _appendRegistro(runResult) {
    // Determina el proyecto desde el primer test con archivo
    const firstSpec = this._results.find(r => r.test.location?.file)?.test.location?.file;
    const projectDir = firstSpec ? this._findProjectDir(firstSpec) : null;
    if (!projectDir) return;

    const registroPath = join(projectDir, 'evidencias', 'REGISTRO.md');
    if (!existsSync(registroPath)) return;

    const total = this._results.length;
    const passed = this._results.filter(r => r.result.status === 'passed').length;
    const failed = this._results.filter(r => r.result.status === 'failed').length;
    const flaky  = this._results.filter(r => r.result.status === 'flaky').length;
    const resultado = failed > 0 ? '❌ FAIL' : flaky > 0 ? '⚠️ FLAKY' : '✅ PASS';

    const now = new Date();
    const fecha = now.toISOString().slice(0, 10);
    const hora  = now.toTimeString().slice(0, 5);

    // Detecta módulos únicos corridos
    const modulos = [...new Set(
      this._results.map(r => {
        const f = r.test.location?.file || '';
        const m = f.match(/tests\/regression\/([^/]+)\//);
        return m ? m[1] : basename(f).replace('.spec.ts', '');
      })
    )].join(', ');

    const row = `| ${fecha} ${hora} | ${modulos} | ${resultado} | ${passed} | ${failed}${flaky ? ` (${flaky} flaky)` : ''} | local: ${projectDir.split('/').slice(-1)[0]}/monocart-report/index.html |\n`;
    appendFileSync(registroPath, row);
    console.log(`\n📋 REGISTRO.md actualizado — ${fecha} ${hora} · ${resultado} (${passed}/${total})`);
  }

  _findProjectDir(specFile) {
    if (!specFile) return null;
    // Sube desde el archivo hasta encontrar playwright.config.ts
    let dir = dirname(specFile);
    for (let i = 0; i < 6; i++) {
      if (existsSync(join(dir, 'playwright.config.ts'))) return dir;
      const parent = dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
    return null;
  }
}
