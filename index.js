/*
 * Copyright 2020-present Cong Nguyen. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const fs = require('fs-extra');
const chalk = require('chalk');

const download = require('./utils/download.js');
const STICKERS_PACK_JSON = 'stickers-packs.json';
const SAVE_FOLDER = 'download';
const SAVE_PACKS_SUMMARY_TO = `${SAVE_FOLDER}/packs-summary`;
const SAVE_STICKERS_TO = `${SAVE_FOLDER}/stickers`;

/**
 * Check if folder is exist
 * */
function isExist(src) {
    return fs.existsSync(src);
}

function maybeMakeDirIfNotExist(dirName) {
    if (!isExist(dirName)) {
        fs.mkdirSync(dirName);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Download some summary data of sticker pack
 * e.g: thumbnail, sample stickers
 * */
async function downloadPack(pack) {
    return new Promise(async (resolve, reject) => {
        if (pack.thumbnail_image && pack.thumbnail_image.uri) {
            console.log(chalk.yellow("Start downloading pack: ", pack.id));

            const packDir = `${SAVE_PACKS_SUMMARY_TO}/${pack.id}`;

            // download the thumbnail
            maybeMakeDirIfNotExist(packDir);
            await download(pack.thumbnail_image.uri, `${packDir}/thumbnail_image.png`);

            // download stickers images
            maybeMakeDirIfNotExist(`${packDir}/stickers`);
            if (pack.stickers && pack.stickers.edges && pack.stickers.edges.length) {
                await Promise.all(pack.stickers.edges.map(async (nodeData) => {
                    // main image
                    if (nodeData.node.image && nodeData.node.image.uri && nodeData.node.image.uri.length > 0) {
                        await download(nodeData.node.image.uri, `${packDir}/stickers/${nodeData.node.id}.png`);
                    }

                    // sprite_image
                    if (nodeData.node.sprite_image && nodeData.node.sprite_image.uri && nodeData.node.sprite_image.uri.length > 0) {
                        await download(nodeData.node.sprite_image.uri, `${packDir}/stickers/${nodeData.node.id}_sprite_image.png`);
                    }

                    // padded_sprite_image
                    if (nodeData.node.padded_sprite_image && nodeData.node.padded_sprite_image.uri && nodeData.node.padded_sprite_image.uri.length > 0) {
                        await download(nodeData.node.padded_sprite_image.uri, `${packDir}/stickers/${nodeData.node.id}_padded_sprite_image.png`);
                    }
                }));
                resolve(true);
            } else {
                resolve(false);
            }
        } else {
            console.log(chalk.red('Invalid pack data. Please read REAME.md before using this.'));
            reject(false);
        }
    })
}

maybeMakeDirIfNotExist(SAVE_FOLDER);
maybeMakeDirIfNotExist(SAVE_PACKS_SUMMARY_TO);
maybeMakeDirIfNotExist(SAVE_STICKERS_TO);

let packsJson;
let _downloadedCount = 0;
(async () => {
    try {
        if (fs.existsSync(STICKERS_PACK_JSON)) {
            let packsData = fs.readFileSync(STICKERS_PACK_JSON);
            packsJson = JSON.parse(packsData);
            if (packsJson && packsJson.packs) {
                const allPacks = Object.values(packsJson.packs);

                for(let i = 0; i < allPacks.length; i++) {
                    if (i > 0) {
                        console.log('Sleep 10s before download next pack');
                        await sleep(10000);
                    }

                    await downloadPack(allPacks[i]);
                    _downloadedCount++;
                }

                console.log(chalk.green(`Saved ${_downloadedCount} packs successful.`));
            }
        } else {
            console.log(chalk.red("Stickers json file not found!"));
        }
    } catch(err) {
        console.error(err);
    }
})();
