import fs from 'node:fs/promises';
import path from 'node:path';
import toml from '@ltd/j-toml';

const REPO = 'ezequielgk/Kore-Recipes';
const BRANCH = 'master';

function slugify(text) {
  if (!text) return '';
  return text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

async function fetchRecipes() {
  console.log('Fetching recipes tree from GitHub...');
  const treeUrl = `https://api.github.com/repos/${REPO}/git/trees/${BRANCH}?recursive=1`;
  const response = await fetch(treeUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch tree: ${response.statusText}`);
  }
  const data = await response.json();

  const tomlFiles = data.tree.filter((item) => {
    return item.type === 'blob' && 
           item.path.startsWith('recipes/') && 
           item.path.endsWith('.toml');
  });

  const packagesMap = new Map();
  const categoryCounts = {};

  console.log(`Found ${tomlFiles.length} recipes. Fetching contents...`);

  for (const file of tomlFiles) {
    const rawUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${file.path}`;
    const rawRes = await fetch(rawUrl);
    if (!rawRes.ok) {
      console.warn(`Failed to fetch ${file.path}`);
      continue;
    }
    const content = await rawRes.text();
    try {
      const parsed = toml.parse(content);
      
      const origin = file.path.startsWith('recipes/official/') ? 'official' : 'community';
      const pathParts = file.path.split('/');
      const pathCategory = pathParts.length > 3 ? pathParts[2] : '';
      
      let pkgName = parsed.package_name;
      if (!pkgName) continue; // Skip corrupt rows

      let name = parsed.name;
      if (!name) name = pkgName.charAt(0).toUpperCase() + pkgName.slice(1);

      let description = parsed.description;
      if (!description) description = "No description available.";

      let category = parsed.category;
      if (!category) {
        if (pathCategory) {
          category = pathCategory.charAt(0).toUpperCase() + pathCategory.slice(1);
        } else {
          category = "Utility";
        }
      }

      let formats = parsed.formats;
      if (!formats || !Array.isArray(formats) || formats.length === 0) {
        formats = ["tarball"];
      }
      
      const slug = slugify(pkgName);

      const pkg = {
        name,
        package_name: pkgName,
        slug: slug,
        url_template: parsed.url_template,
        description,
        terminal: !!parsed.terminal,
        formats,
        category,
        icon_url: parsed.icon_url || null,
        screenshots: Array.isArray(parsed.screenshots) ? parsed.screenshots : [],
        metadata: {
          maintainer: parsed.metadata?.maintainer || 'Unknown',
          license: parsed.metadata?.license || 'Unknown'
        },
        origin
      };

      if (!packagesMap.has(slug)) {
        packagesMap.set(slug, pkg);
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    } catch (e) {
      console.error(`Error parsing TOML for ${file.path}:`, e);
    }
  }

  const packages = Array.from(packagesMap.values());
  const categories = Object.keys(categoryCounts).map(name => ({
    name,
    count: categoryCounts[name]
  })).sort((a, b) => b.count - a.count);

  const dataDir = path.join(process.cwd(), 'src', 'data');
  await fs.mkdir(dataDir, { recursive: true });

  await fs.writeFile(
    path.join(dataDir, 'packages.json'),
    JSON.stringify(packages, null, 2)
  );

  await fs.writeFile(
    path.join(dataDir, 'categories.json'),
    JSON.stringify(categories, null, 2)
  );

  console.log(`Successfully generated data for ${packages.length} packages across ${categories.length} categories.`);
}

fetchRecipes().catch(console.error);
