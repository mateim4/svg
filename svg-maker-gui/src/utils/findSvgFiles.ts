// Recursively find all SVG files in a folder using the File System Access API (browser)
export async function findSvgFilesInFolder(folderHandle: FileSystemDirectoryHandle): Promise<string[]> {
  const svgFiles: string[] = [];
  async function traverse(dirHandle: FileSystemDirectoryHandle) {
  // Use values() for compatibility
  // @ts-ignore
  for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file' && entry.name.endsWith('.svg')) {
        const file = await entry.getFile();
        svgFiles.push(URL.createObjectURL(file));
      } else if (entry.kind === 'directory') {
        await traverse(entry as FileSystemDirectoryHandle);
      }
    }
  }
  await traverse(folderHandle);
  return svgFiles;
}
