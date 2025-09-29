const fs = require("fs").promises;
const path = require("path");
const { exec } = require("child_process");

const staticSrcPath = path.join(__dirname, ".next/static");
const staticDestPath = path.join(__dirname, ".next/standalone/.next/static");

const publicSrcPath = path.join(__dirname, "public");
const publicDestPath = path.join(__dirname, ".next/standalone/public");

const deployDir = path.join(__dirname, "deploy");
const archiveName = "next-app.tar.gz";

async function copyAssets(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const items = await fs.readdir(src, { withFileTypes: true });

  const promises = items.map(async (item) => {
    const srcPath = path.join(src, item.name);
    const destPath = path.join(dest, item.name);
    if (item.isDirectory()) {
      return copyAssets(srcPath, destPath);
    } else {
      return fs.copyFile(srcPath, destPath);
    }
  });

  await Promise.all(promises);
}

async function prepareDeployment() {
  const greenTick = `\x1b[32m\u2713\x1b[0m`;
  const redCross = `\x1b[31m\u274C\x1b[0m`;

  try {
    console.log("📁 Copying static and public assets...");
    await copyAssets(staticSrcPath, staticDestPath);
    await copyAssets(publicSrcPath, publicDestPath);
    console.log(`${greenTick} Assets copied successfully`);

    console.log("🚚 Preparing deploy folder...");
    await fs.rm(deployDir, { recursive: true, force: true });
    await fs.mkdir(deployDir, { recursive: true });

    await fs.cp(path.join(__dirname, ".next/standalone"), deployDir, {
      recursive: true,
    });
    console.log(`${greenTick} Standalone app copied to deploy folder`);

    const tarCmd = `tar -czf ${archiveName} -C ${deployDir} .`;
    console.log("📦 Creating tarball...");
    exec(tarCmd, (err, stdout, stderr) => {
      if (err) {
        console.error(`${redCross} Tarball creation failed:`, stderr);
      } else {
        console.log(`${greenTick} Tarball created: ${archiveName}`);
      }
    });
  } catch (err) {
    console.error(`${redCross} Deployment preparation failed:`, err);
  }
}

prepareDeployment();
