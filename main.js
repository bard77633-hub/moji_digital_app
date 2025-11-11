document.addEventListener('DOMContentLoaded', () => {
    // 実行ボタンが押されたときの処理
    document.getElementById('decodeButton').addEventListener('click', () => {
        const hexInput = document.getElementById('hexInput').value;
        
        let byteArray;
        try {
            // 1. 16進数文字列をバイト配列(Uint8Array)に変換
            byteArray = hexToUint8Array(hexInput);
        } catch (error) {
            alert("入力エラー: " + error.message);
            return;
        }

        // 2. 各エンコーディングでデコードして結果を表示
        
        // ASCII (簡易版)
        decodeAscii(byteArray);

        // Shift_JIS
        decodeWithTextDecoder('shift_jis', byteArray, '#resultSjis');

        // EUC-JP
        decodeWithTextDecoder('euc-jp', byteArray, '#resultEucJp');

        // JIS (ISO-2022-JP)
        decodeWithTextDecoder('iso-2022-jp', byteArray, '#resultJis');

        // Unicode (UTF-8)
        decodeWithTextDecoder('utf-8', byteArray, '#resultUtf8');
    });
});

/**
 * 16進数文字列 (スペース区切り可) を Uint8Array (バイト配列) に変換する
 */
function hexToUint8Array(hexString) {
    // スペースや改行を除去
    const hex = hexString.replace(/\s+/g, '');
    
    // 入力が空の場合は空の配列を返す
    if (hex.length === 0) {
        return new Uint8Array(0);
    }
    
    if (hex.length % 2 !== 0) {
        throw new Error("16進数の文字列長が奇数です。2桁で1バイトを表してください。");
    }
    if (!/^[0-9a-fA-F]*$/.test(hex)) {
        throw new Error("16進数以外（0-9, a-f, A-F）の文字が含まれています。");
    }

    const array = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        array[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return array;
}

/**
 * TextDecoder API を使ってデコードし、結果をテーブルに表示する
 */
function decodeWithTextDecoder(encoding, byteArray, rowId) {
    const row = document.querySelector(rowId);
    const resultCell = row.querySelector('.resultString');
    const remarksCell = row.querySelector('.remarks');

    try {
        // TextDecoder オブジェクトを作成
        // fatal: true にすると、デコードできない文字があった場合にエラーをスローする
        // (文字化けを「エラー」として検出するために重要)
        const decoder = new TextDecoder(encoding, { fatal: true });
        
        // デコード実行
        const decodedString = decoder.decode(byteArray);
        
        resultCell.textContent = decodedString;
        remarksCell.textContent = 'デコード成功';

    } catch (error) {
        // デコード失敗時 (文字化けや不正なバイトシーケンス)
        resultCell.textContent = '（デコード失敗）';
        remarksCell.textContent = error.message;
        
        // 【参考】エラーを無視して強制デコード（文字化け状態を再現）したい場合は、
        // fatal: false (デフォルト) を使う
        // const permissiveDecoder = new TextDecoder(encoding, { fatal: false });
        // resultCell.textContent = permissiveDecoder.decode(byteArray);
        // remarksCell.textContent = `デコードエラー発生 (参考: ${error.message})`;
    }
}

/**
 * ASCIIとしてデコードする (簡易版)
 * 0x00-0x7F のみ対応。それ以外はエラー（または代替文字）
 */
function decodeAscii(byteArray) {
    const row = document.querySelector('#resultAscii');
    const resultCell = row.querySelector('.resultString');
    const remarksCell = row.querySelector('.remarks');

    let result = '';
    let hasError = false;
    
    for (const byte of byteArray) {
        if (byte > 0x7F) {
            // 0x7F を超えるバイトはASCIIではない
            result += ''; // 代替文字 ()
            hasError = true;
        } else {
            // 制御文字などもそのまま文字に変換（授業用としてはこれで十分と判断）
            result += String.fromCharCode(byte);
        }
    }

    resultCell.textContent = result;
    if (hasError) {
        remarksCell.textContent = 'ASCII範囲外(0x80以上)のバイトを含んでいます。';
    } else {
        remarksCell.textContent = 'デコード成功';
    }
}
