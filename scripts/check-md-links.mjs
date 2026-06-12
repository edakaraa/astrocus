import fs from "fs";
import path from "path";

const root = process.cwd();
const mdFiles = [];

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    if (name === "node_modules" || name === ".git") continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (name.endsWith(".md")) mdFiles.push(p);
  }
}

walk(root);

/** GitHub / VS Code markdown preview heading slug (approx.) */
function slugifyHeading(title) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function collectAnchors(text) {
  const anchors = new Set();

  for (const m of text.matchAll(/id=["']([^"']+)["']/g)) {
    anchors.add(m[1]);
  }
  for (const m of text.matchAll(/href="#([^"]+)"/g)) {
    anchors.add(m[1]);
  }

  const used = new Set();
  for (const m of text.matchAll(/^#{1,6}\s+(.+)$/gm)) {
    let title = m[1]
      .replace(/`[^`]*`/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/<[^>]+>/g, "")
      .trim();
    let slug = slugifyHeading(title);
    while (used.has(slug)) {
      slug = `${slug}-1`;
    }
    used.add(slug);
    anchors.add(slug);
  }

  return anchors;
}

const broken = [];

for (const file of mdFiles) {
  const dir = path.dirname(file);
  const text = fs.readFileSync(file, "utf8");
  const localAnchors = collectAnchors(text);
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let m;
  while ((m = re.exec(text))) {
    const raw = m[2].trim();
    if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("mailto:")) continue;

    const hashIdx = raw.indexOf("#");
    const filePart = hashIdx === -1 ? raw : raw.slice(0, hashIdx);
    const anchor = hashIdx === -1 ? "" : raw.slice(hashIdx + 1);

    if (!filePart) {
      if (anchor && !localAnchors.has(anchor)) {
        broken.push({ file: rel(file), link: raw, reason: `missing anchor #${anchor}` });
      }
      continue;
    }

    const resolved = path.normalize(path.join(dir, filePart));
    if (!fs.existsSync(resolved)) {
      broken.push({ file: rel(file), link: raw, resolved: rel(resolved), reason: "file not found" });
      continue;
    }

    if (anchor && resolved.endsWith(".md")) {
      const targetText = fs.readFileSync(resolved, "utf8");
      const targetAnchors = collectAnchors(targetText);
      if (!targetAnchors.has(anchor)) {
        broken.push({ file: rel(file), link: raw, reason: `missing anchor #${anchor} in ${rel(resolved)}` });
      }
    }
  }
}

function rel(p) {
  return path.relative(root, p).replace(/\\/g, "/");
}

if (broken.length) {
  console.log("BROKEN LINKS:", broken.length);
  for (const b of broken) console.log(JSON.stringify(b));
  process.exit(1);
}
console.log(`OK: ${mdFiles.length} markdown files, no broken links.`);
