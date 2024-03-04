import { Buffer } from 'buffer';
import pako from 'pako';

export default class Compressor {
    // Compresses string content via gzip and outputs as a base64 string.
    static compress(content: string): string {
        return Buffer.from(pako.gzip(JSON.stringify(content))).toString('base64');
    }

    // Decompresses a base64 encoded gzipped string.
    static decompress(base64str: string): string {
        return pako.ungzip(Buffer.from(base64str, 'base64'), { to: 'string' });
    }
}
