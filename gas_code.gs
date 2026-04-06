// =====================================================
// Eterna Stone オーダーフォーム → Google スプレッドシート
// =====================================================
// 【使い方】
// 1. Google スプレッドシートを新規作成する
// 2. メニュー「拡張機能」→「Apps Script」を開く
// 3. このコードを丸ごとコピー&ペーストして保存
// 4. 「デプロイ」→「新しいデプロイ」をクリック
// 5. 種類：「ウェブアプリ」、アクセス：「全員」に設定してデプロイ
// 6. 発行されたURLを index.html の GAS_URL に貼り付ける
// =====================================================

// ★ 通知メールの送り先（自分のメールアドレスに変更してください）
const NOTIFY_EMAIL = 'life.is.sweet.satoko@gmail.com';

const HEADERS = [
  '受付日時',
  '旧姓お名前（ひらがな）',
  '生年月日',
  'メールアドレス',
  'プラン',
  'サイズ',
  '目的',
  '石の方向性',
  '送り先お名前',
  '郵便番号',
  '電話番号',
  '住所',
  'お支払い方法',
];

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // 1行目にヘッダーがなければ追加
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length)
        .setFontWeight('bold')
        .setBackground('#1a1730')
        .setFontColor('#c9a96e');
      sheet.setFrozenRows(1);
    }

    const data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date(),
      data.kana     || '',
      data.birthday || '',
      data.email    || '',
      data.plan     || '',
      data.size     || '',
      data.purpose  || '',
      data.stone    || '',
      data.shipName || '',
      data.postal   || '',
      data.phone    || '',
      data.address  || '',
      data.payment  || '',
    ]);

    // ── メール通知 ──────────────────────────────
    const subject = '【Eterna Stone】新しいオーダーが届きました';
    const body = `
新しいオーダーが届きました！
スプレッドシートをご確認ください。

──────────────────────
■ 受付日時：${new Date().toLocaleString('ja-JP')}
■ お名前（ひらがな）：${data.kana || ''}
■ 生年月日：${data.birthday || ''}
■ メールアドレス：${data.email || ''}
■ プラン：${data.plan || ''}
■ サイズ：${data.size || ''}
■ 目的：${data.purpose || ''}
■ 石の方向性：${data.stone || '（記載なし）'}
──────────────────────
■ 送り先お名前：${data.shipName || ''}
■ 郵便番号：${data.postal || ''}
■ 住所：${data.address || ''}
■ 電話番号：${data.phone || ''}
■ お支払い方法：${data.payment || ''}
──────────────────────

Eterna Stone 自動通知
`.trim();

    GmailApp.sendEmail(NOTIFY_EMAIL, subject, body);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// テスト用（Apps Script エディタから手動実行して動作確認できます）
function testPost() {
  const dummy = {
    postData: {
      contents: JSON.stringify({
        kana:     'やまだ はなこ',
        birthday: '1990-01-15',
        email:    'test@example.com',
        size:     '内径約 16cm',
        purpose:  '日常のお守り・エネルギー調整として',
        stone:    '落ち着いた青系が好きです',
        shipName: '山田 花子',
        postal:   '000-0000',
        phone:    '090-0000-0000',
        address:  '東京都渋谷区〇〇 1-2-3',
        payment:  '銀行振込',
      })
    }
  };
  const result = doPost(dummy);
  Logger.log(result.getContent());
}
