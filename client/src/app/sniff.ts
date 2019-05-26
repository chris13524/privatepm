export type CONTENT_TYPE = "image/png" | "image/jpeg" | "image/x-icon" | "image/gif" | "image/tiff" | "image/bmp" | "image/webp" |
  "application/x-tar" | "application/x-bzip2" | "application/x-lzip" | "application/zip" | "application/vnd.rar" | "application/x-xar" | "application/x-7z-compressed" | "application/gzip" | "application/x-xz" | "application/lz4" /*?*/ |
  "executable/elf" | "executable/exe" | // made up
  "application/pdf" |
  "audio/mpeg" | "audio/flac" | "audio/midi" /*?*/ |
  "video/ogg" | "video/webm" | "video/mp4" |
  "iso" | "application/x-apple-diskimage" |
  "font/woff" | "font/woff2" |
  "text/xml" |
  "text/plain";

// https://en.wikipedia.org/wiki/List_of_file_signatures
const MAPPING: { [key: string]: CONTENT_TYPE } = {
  "89504E470D0A1A0A": "image/png",
  "FFD8FFDB": "image/jpeg",
  "FFD8FFE000104A4649460001": "image/jpeg",
  "FFD8FFEE": "image/jpeg",
  "00000100": "image/x-icon",
  "474946383761": "image/gif",
  "474946383961": "image/gif",
  "49 49 2A 00": "image/tiff",
  "4D4D002A": "image/tiff",
  "424D": "image/bmp",
  "52494646????????57454250": "image/webp",
  
  "1F9D": "application/x-tar", // "often"
  "1FA0": "application/x-tar", // "often"
  "425A68": "application/x-bzip2",
  "4C5A4950": "application/x-lzip",
  "504B0304": "application/zip",
  "504B0506": "application/zip",
  "504B0708": "application/zip",
  "526172211A0700": "application/vnd.rar",
  "526172211A070100": "application/vnd.rar",
  "78617221": "application/x-xar",
  "7573746172003030": "application/x-tar",
  "7573746172202000": "application/x-tar",
  "377ABCAF271C": "application/x-7z-compressed",
  "1F8B": "application/gzip",
  "FD377A585A0000": "application/x-xz",
  "04224D18": "application/lz4",
  
  "7F454C46": "executable/elf",
  "4D5A": "executable/exe",
  
  "255044462d": "application/pdf",
  
  "FFFB": "audio/mpeg",
  "494433": "audio/mpeg",
  "664C6143": "audio/flac",
  "4D546864": "audio/midi",
  
  "4F676753": "video/ogg",
  "1A45DFA3": "video/webm",
  "667479704D534E56": "video/mp4",
  "6674797069736F6D": "video/mp4",
  
  "4344303031": "iso",
  "7801730D626260": "application/x-apple-diskimage",
  
  "774F4646": "font/woff",
  "774F4632": "font/woff2",
  
  "3c3f786d6c20": "text/xml",
  "": "text/plain"
};

export function sniffType(message: string): CONTENT_TYPE {
  const hexMessage = toUTF8Array(message);
  outer: for (const key in MAPPING) {
    const keyBytes = [];
    for (let i = 0; i < key.length; i += 2) {
      keyBytes.push(parseInt(key.substr(i, 2), 16));
    }
    
    if (keyBytes.length > hexMessage.length) continue;
    
    for (let i = 0; i < keyBytes.length; i++) {
      if (keyBytes[i] == "??") continue;
      if (keyBytes[i] != hexMessage[i]) {
        continue outer;
      }
    }
    
    return MAPPING[key];
  }
}

export function toUTF8Array(str) {
  const byteArray = new Uint8Array(str.length);
  for (let i = 0; i < str.length; ++i) {
    byteArray[i] = str.charCodeAt(i) & 0xff;
  }
  return byteArray;
}

export function isImage(contentType: CONTENT_TYPE): boolean {
  return contentType.startsWith("image/");
}
