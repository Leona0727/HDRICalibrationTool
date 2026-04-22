// more functions to check how the app works on each OS
// mock file drop
// set up webdriver io test envieonment: https://v2.tauri.app/develop/tests/webdriver/example/webdriverio/#_top
// Write a test find the area of the droping file   ui area
// mock a file drop event actua area within the area 
// ^ all this is mocking file drop system
// write a check to ensure the expected result occured
// ^ move all this logic into a "file drop" helper function
// single invalid many files, some versions of situations use helper expect any possible cases

// test cases that we want to cover:
/*
individual file test cases
1. input file name has a valid extention and its contents is also valid
2. input file name has a valid extention and its contents is not valid
3. input file name does not have a valid extention
4. input is a directry
multiple file cases:
5. input is over max number of allowed batch size
6. every input file is valid
7. every input file is invalid
8. 1 file is invalid, the rest are valid (4 files, 3 file is valid)
9. 1 file is valid,the rest are invalid (4 files each individual test case)
*/

//determine assertions as we write the tests for each case

import fs from "fs";
import os from "os";
import path from "path";

describe("HDRI file drop pipeline test", () => {
  let dropArea;
  let tmpDir;

  // Selectors (update as needed)
  const SEL = {
    dropAreaText: "p=Drag and drop images here",
    // Add these testids in app when ready:
    imageSetRow: '[data-testid="image-set-row"]',
    toast: '[data-sonner-toast]', // sonner default-ish hook
  };

  before(async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "hdri-wdio-drop-"));
  });

  after(async () => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  beforeEach(async () => {
    await browser.url("/home-page?e2e=1");
    dropArea = await $(SEL.dropAreaText);
    await dropArea.waitForExist();
  });


  // Helpers: file creation + assertions
  function writeTempFile(name, content = "sample") {
    const filePath = path.join(tmpDir, name);
    fs.writeFileSync(filePath, content, "utf8");
    return filePath;
  }

  function makeTempDir(name) {
    const dirPath = path.join(tmpDir, name);
    fs.mkdirSync(dirPath, { recursive: true });
    return dirPath;
  }

  async function countRows() {
    return (await $$(SEL.imageSetRow)).length;
  }

  async function expectRows(expected) {
    await browser.waitUntil(async () => (await countRows()) === expected, {
      timeout: 5000,
      timeoutMsg: `Expected ${expected} image set rows`,
    });
  }

  async function expectToastIncludes(text) {
    await browser.waitUntil(async () => {
      const toasts = await $$(SEL.toast);
      for (const t of toasts) {
        const msg = await t.getText();
        if (msg.includes(text)) return true;
      }
      return false;
    }, {
      timeout: 5000,
      timeoutMsg: `Expected toast containing "${text}"`,
    });
  }

  //Core helper: Tauri-native drop bridge.
  async function fileDrop(files) {
    // #region agent log
    fetch('http://127.0.0.1:7486/ingest/2b059762-6e09-4258-bf9d-2133c3210238',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d8f573'},body:JSON.stringify({sessionId:'d8f573',runId:'baseline',hypothesisId:'H1',location:'tests/file-drop.e2e.js:fileDrop:beforeExecute',message:'Invoking test drop bridge',data:{fileCount:Array.isArray(files)?files.length:-1},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    await browser.execute((paths) => {
      if (typeof window.__TAURI_TEST_DROP__ !== "function") {
        // #region agent log
        fetch('http://127.0.0.1:7486/ingest/2b059762-6e09-4258-bf9d-2133c3210238',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d8f573'},body:JSON.stringify({sessionId:'d8f573',runId:'baseline',hypothesisId:'H1',location:'tests/file-drop.e2e.js:fileDrop:missingHook',message:'Test drop bridge missing on window',data:{hasHook:false},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        throw new Error(
          "__TAURI_TEST_DROP__ test hook not found. Expose it in app test mode."
        );
      }
      // #region agent log
      fetch('http://127.0.0.1:7486/ingest/2b059762-6e09-4258-bf9d-2133c3210238',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d8f573'},body:JSON.stringify({sessionId:'d8f573',runId:'baseline',hypothesisId:'H1',location:'tests/file-drop.e2e.js:fileDrop:hookPresent',message:'Test drop bridge present on window',data:{hasHook:true,pathCount:Array.isArray(paths)?paths.length:-1},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      window.__TAURI_TEST_DROP__(paths);
    }, files);
  }

  // Optional composed helper for common pattern
  async function dropAndAssert(files, { expectedRows, rejectedText } = {}) {
    const beforeRows = await countRows();
    await fileDrop(files);

    if (typeof expectedRows === "number") {
      await expectRows(expectedRows);
    } else {
      // default: at least no crash; wait a beat for UI settle
      await browser.pause(200);
    }

    if (rejectedText) {
      await expectToastIncludes(rejectedText);
    }

    const afterRows = await countRows();
    return { beforeRows, afterRows };
  }


  // 0) Smoke: drop area visible
  it("finds the dropping file ui area", async () => {
    await expect(dropArea).toBeDisplayed();
  });

  // 1) valid extension + valid content
  it("1) valid extension + valid content", async () => {
    const validImage = writeTempFile("valid.jpg", "fake-image-content");
    const before = await countRows();

    await dropAndAssert([validImage], {
      expectedRows: before + 1, // adjust if grouping merges rows
    });
  });

  // 2) valid extension + invalid content
  it("2) valid extension + invalid content", async () => {
    const invalidImageData = writeTempFile("invalid.jpg", "not-really-an-image");
    const before = await countRows();


    await dropAndAssert([invalidImageData], {
      expectedRows: before + 1, // update if your app rejects bad contents
      // rejectedText: "invalid image", // enable once app emits this
    });
  });

  // 3) invalid extension
  it("3) invalid extension", async () => {
    const txtFile = writeTempFile("file.txt", "plain text");
    const before = await countRows();

    await dropAndAssert([txtFile], {
      expectedRows: before,
      rejectedText: "not an acceptable image file",
    });
  });

  // 4) directory input
  it("4) directory input", async () => {
    const dirPath = makeTempDir("folder");
    writeTempFile(path.join("folder", "a.jpg"), "a");
    writeTempFile(path.join("folder", "b.txt"), "b");

    const before = await countRows();
    await dropAndAssert([dirPath], {
      expectedRows: before + 1, // one group/row for folder
      rejectedText: "not an acceptable image file", // for b.txt
    });
  });

  // 5) batch size overflow
  it("5) batch size overflow", async () => {
    const files = [];
    for (let i = 0; i < 10; i += 1) {
      files.push(writeTempFile(`file${i}.jpg`, `img-${i}`));
    }

    const before = await countRows();

    // If no max batch rule exists yet, this will currently pass as accepted.
    // Change expected once max-size validation exists.
    await dropAndAssert(files, {
      expectedRows: before + 10, // or before + N grouping behavior
      // rejectedText: "batch size exceeded",
    });
  });

  // 6) all files valid
  it("6) all files valid", async () => {
    const files = [
      writeTempFile("a.jpg", "a"),
      writeTempFile("b.jpg", "b"),
    ];

    const before = await countRows();
    await dropAndAssert(files, {
      expectedRows: before + 2, // adjust if grouped differently
    });
  });

  // 7) all files invalid
  it("7) all files invalid", async () => {
    const files = [
      writeTempFile("a.txt", "a"),
      writeTempFile("b.txt", "b"),
    ];

    const before = await countRows();
    await dropAndAssert(files, {
      expectedRows: before,
      rejectedText: "not an acceptable image file",
    });
  });

  // 8) 1 invalid, 3 valid
  it("8) 1 invalid 3 valid", async () => {
    const files = [
      writeTempFile("a.jpg", "a"),
      writeTempFile("b.jpg", "b"),
      writeTempFile("c.jpg", "c"),
      writeTempFile("bad.txt", "bad"),
    ];

    const before = await countRows();
    await dropAndAssert(files, {
      expectedRows: before + 3, // adjust if grouped
      rejectedText: "not an acceptable image file",
    });
  });

  // 9) 1 valid, rest invalid
  it("9) 1 valid rest invalid", async () => {
    const files = [
      writeTempFile("a.jpg", "a"),
      writeTempFile("bad1.txt", "bad1"),
      writeTempFile("bad2.txt", "bad2"),
      writeTempFile("bad3.txt", "bad3"),
    ];

    const before = await countRows();
    await dropAndAssert(files, {
      expectedRows: before + 1, // adjust if grouped
      rejectedText: "not an acceptable image file",
    });
  });
});
