import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packagePath = path.join(root, 'package.json');
const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const currentVersion = packageData.assetVersion || '1.0.0';
const versionParts = currentVersion.split('.').map(Number);

if (
	versionParts.length !== 3 ||
	versionParts.some((part) => !Number.isInteger(part) || part < 0)
) {
	throw new Error(`assetVersion inválida: ${currentVersion}`);
}

versionParts[2] += 1;
const nextVersion = versionParts.join('.');
packageData.assetVersion = nextVersion;

fs.writeFileSync(packagePath, `${JSON.stringify(packageData, null, '\t')}\n`);
console.log(`Assets actualizados: v${currentVersion} → v${nextVersion}`);
