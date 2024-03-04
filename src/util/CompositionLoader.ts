import AsyncStorage from '@react-native-async-storage/async-storage';

import Compressor from './Compressor';
import Examples from '../constants/Examples';
import { Composition, CompositionNode } from '../types/redact';

// Manages the storage and retrieval of Composition json objects via AsyncStorage.
export default class CompositionLoader {
    // Stores a composition JSON, gzipped as a base64 string in AsyncStorage, using the given key for retrieval.
    static async stageLocal(utf8Content: string, storageKey: string) {
        const json = JSON.parse(utf8Content);

        validateCompositionJson(json);

        const compressed = Compressor.compress(json);
        await AsyncStorage.setItem(storageKey, compressed);
    }

    // Fetches a composition JSON from a URL and stores as a gzipped base64 string in AsyncStorage. The storage key is implicitly `url/{actualUrl}`.
    static async stageUrl(url: string): Promise<string> {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const urlObj = new URL(url);
        } catch (err) {
            try {
                const decoded = decodeURIComponent(url);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const urlObj = new URL(decoded);
                url = decoded;
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (err2) {
                throw err;
            }
        }

        let response = null;
        try {
            response = await fetch(url);
        } catch (err: any) {
            let msg = err instanceof Error ? err.message : err.toString();
            if (url !== '')
                msg =
                    msg +
                    ": it may be a CORS issue if the server does not send \"'Access-Control-Allow-Origin': '*'\" header.";
            throw new Error(msg);
        }

        const content = await response.json();

        validateCompositionJson(content);

        const compressed = Compressor.compress(content);
        const key = 'url/' + url;
        await AsyncStorage.setItem(key, compressed);

        return key;
    }

    // Loads a composition from AsyncStorage.
    // `examples/*` are loaded from in memory examples.
    // `url/*` are fetched from the URL unless they already exist in storage.
    // `*` others are simply loaded from storage, erroring it they don't exist.
    static async load(storageKey: string): Promise<Composition> {
        if (storageKey.startsWith('examples/')) {
            const example = Examples.get(storageKey);

            if (example) {
                return example;
            } else {
                throw new Error('No such example: ' + storageKey);
            }
        } else {
            const compressedJson = await AsyncStorage.getItem(storageKey);
            if (compressedJson) {
                const json = Compressor.decompress(compressedJson);
                return JSON.parse(json);
            } else if (storageKey.startsWith('url/')) {
                const key = await CompositionLoader.stageUrl(storageKey.replace('url/', ''));
                const compressedJson = await AsyncStorage.getItem(key);

                if (compressedJson) {
                    const json = Compressor.decompress(compressedJson);
                    return JSON.parse(json);
                } else {
                    throw new Error('Unable to load saved URL key.');
                }
            } else {
                throw new Error('Composition not found!');
            }
        }
    }
}

const validateCompositionJson = (comp: Composition) => {
    /* eslint-disable no-unused-expressions */
    try {
        comp.options.ticks_per_beat;
        validateCompositionNodeJson(comp.tree);
    } catch (err: any) {
        const msg = err instanceof Error ? err.message : err.toString();
        throw new Error('Invalid composition JSON format: ' + msg);
    }
};

const validateCompositionNodeJson = (node: CompositionNode) => {
    /* eslint-disable no-unused-expressions */
    try {
        node.element;
        node.start;
        node.end;
        node.seed;
        node.rendered;
        node.element;
        node.children?.forEach((child) => validateCompositionNodeJson(child));
    } catch (err: any) {
        const msg = err instanceof Error ? err.message : err.toString();
        throw new Error('Invalid composition JSON format: ' + msg);
    }
};
