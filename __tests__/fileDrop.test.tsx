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

import path from "path"

describe("HDRI file drop pipeline test", () => {

  let dropArea

  beforeEach(async () => {
    // open tauri window
    await browser.url("/")

    // find drop area
    dropArea = await $('[data-testid="dropzone-root"]')

    await dropArea.waitForExist({ timeout: 5000 })
  })

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Simulates a file drop event on the dropzone area
   * Handles file upload for WebdriverIO and triggers the drop event
   * 
   * @param files - Array of file paths to drop
   */
  async function simulateFileDrop(files: string[]) {
    const remote = []

    for (const file of files) {
      const uploaded = await browser.uploadFile(file)
      remote.push(uploaded)
    }

    await dropArea.addValue(remote)
  }

  /**
   * Checks if a toast/error notification exists
   * @returns Promise<boolean> - true if error toast is found
   */
  async function hasErrorNotification(): Promise<boolean> {
    try {
      const error = await $('[role="alert"][class*="error"]')
      await error.waitForExist({ timeout: 3000 })
      return true
    } catch {
      return false
    }
  }

  /**
   * Checks if a canvas preview exists (indicating successful file load)
   * @returns Promise<boolean> - true if canvas is found
   */
  async function hasCanvasPreview(): Promise<boolean> {
    try {
      const canvas = await $("canvas")
      await canvas.waitForExist({ timeout: 5000 })
      return true
    } catch {
      return false
    }
  }

  /**
   * Gets the current error message from the notification
   * @returns Promise<string> - error message text
   */
  async function getErrorMessage(): Promise<string> {
    try {
      const error = await $('[role="alert"][class*="error"]')
      return await error.getText()
    } catch {
      return ""
    }
  }

  /**
   * Clears the current file/state for the next test
   */
  async function clearState() {
    try {
      const clearBtn = await $('[data-testid="clear-button"]')
      if (await clearBtn.isExisting()) {
        await clearBtn.click()
        await browser.pause(500)
      }
    } catch {
      // Button may not exist, that's ok
    }
  }

  // ============================================================================
  // INDIVIDUAL FILE TEST CASES
  // ============================================================================

  /**
   * TEST CASE 1: Valid extension + Valid content
   * Expected: Canvas preview should render successfully
   */
  it("TC1: valid extension + valid content", async () => {
    const file = path.join(process.cwd(), "tests/assets/valid.cal")

    await simulateFileDrop([file])

    const hasPreview = await hasCanvasPreview()
    expect(hasPreview).toBe(true)

    const hasError = await hasErrorNotification()
    expect(hasError).toBe(false)

    await clearState()
  })

  /**
   * TEST CASE 2: Valid extension + Invalid content
   * Expected: Error notification should appear, no canvas
   */
  it("TC2: valid extension + invalid content", async () => {
    const file = path.join(process.cwd(), "tests/assets/invalid.cal")

    await simulateFileDrop([file])

    const hasError = await hasErrorNotification()
    expect(hasError).toBe(true)

    const hasPreview = await hasCanvasPreview()
    expect(hasPreview).toBe(false)

    const errorMsg = await getErrorMessage()
    expect(errorMsg).toContain("invalid")

    await clearState()
  })

  /**
   * TEST CASE 3: Invalid extension
   * Expected: Error notification should appear with extension error message
   */
  it("TC3: invalid extension", async () => {
    const file = path.join(process.cwd(), "tests/assets/file.txt")

    await simulateFileDrop([file])

    const hasError = await hasErrorNotification()
    expect(hasError).toBe(true)

    const hasPreview = await hasCanvasPreview()
    expect(hasPreview).toBe(false)

    const errorMsg = await getErrorMessage()
    expect(errorMsg).toContain("extension")

    await clearState()
  })

  /**
   * TEST CASE 4: Directory input
   * Expected: Error notification should appear, no canvas
   */
  it("TC4: directory input", async () => {
    const file = path.join(process.cwd(), "tests/assets/folder")

    await simulateFileDrop([file])

    const hasError = await hasErrorNotification()
    expect(hasError).toBe(true)

    const hasPreview = await hasCanvasPreview()
    expect(hasPreview).toBe(false)

    const errorMsg = await getErrorMessage()
    expect(errorMsg).toContain("directory")

    await clearState()
  })

  // ============================================================================
  // MULTIPLE FILE TEST CASES
  // ============================================================================

  /**
   * TEST CASE 5: Over max batch size (> 5 files)
   * Expected: Error notification indicating batch size exceeded
   */
  it("TC5: batch size overflow (> 5 files)", async () => {
    const files = []

    // Create 10 file paths (over max of 5)
    for (let i = 0; i < 10; i++) {
      files.push(
        path.join(process.cwd(), `tests/assets/file${i}.cal`)
      )
    }

    await simulateFileDrop(files)

    const hasError = await hasErrorNotification()
    expect(hasError).toBe(true)

    const hasPreview = await hasCanvasPreview()
    expect(hasPreview).toBe(false)

    const errorMsg = await getErrorMessage()
    expect(errorMsg).toContain("batch")

    await clearState()
  })

  /**
   * TEST CASE 6: All files valid
   * Expected: Canvas preview renders, no error notifications
   */
  it("TC6: all files valid (multiple)", async () => {
    const files = [
      path.join(process.cwd(), "tests/assets/a.cal"),
      path.join(process.cwd(), "tests/assets/b.cal"),
      path.join(process.cwd(), "tests/assets/c.cal")
    ]

    await simulateFileDrop(files)

    const hasPreview = await hasCanvasPreview()
    expect(hasPreview).toBe(true)

    const hasError = await hasErrorNotification()
    expect(hasError).toBe(false)

    await clearState()
  })

  /**
   * TEST CASE 7: All files invalid
   * Expected: Error notification, no canvas
   */
  it("TC7: all files invalid (multiple)", async () => {
    const files = [
      path.join(process.cwd(), "tests/assets/a.txt"),
      path.join(process.cwd(), "tests/assets/b.txt"),
      path.join(process.cwd(), "tests/assets/c.txt")
    ]

    await simulateFileDrop(files)

    const hasError = await hasErrorNotification()
    expect(hasError).toBe(true)

    const hasPreview = await hasCanvasPreview()
    expect(hasPreview).toBe(false)

    await clearState()
  })

  /**
   * TEST CASE 8: 1 invalid, 3 valid
   * Expected: Canvas preview should render with valid files, invalid file ignored
   */
  it("TC8: 1 invalid + 3 valid (4 files total)", async () => {
    const files = [
      path.join(process.cwd(), "tests/assets/a.cal"),
      path.join(process.cwd(), "tests/assets/b.cal"),
      path.join(process.cwd(), "tests/assets/c.cal"),
      path.join(process.cwd(), "tests/assets/bad.txt")
    ]

    await simulateFileDrop(files)

    // Should render successfully with valid files
    const hasPreview = await hasCanvasPreview()
    expect(hasPreview).toBe(true)

    // May show warning about invalid file, but not critical error
    const errorMsg = await getErrorMessage()
    expect(errorMsg).not.toContain("all files invalid")

    await clearState()
  })

  /**
   * TEST CASE 9: 1 valid, 3 invalid
   * Expected: Canvas preview should render with the one valid file
   */
  it("TC9: 1 valid + 3 invalid (4 files total)", async () => {
    const files = [
      path.join(process.cwd(), "tests/assets/a.cal"),
      path.join(process.cwd(), "tests/assets/bad1.txt"),
      path.join(process.cwd(), "tests/assets/bad2.txt"),
      path.join(process.cwd(), "tests/assets/bad3.txt")
    ]

    await simulateFileDrop(files)

    // Should render successfully with the one valid file
    const hasPreview = await hasCanvasPreview()
    expect(hasPreview).toBe(true)

    const errorMsg = await getErrorMessage()
    expect(errorMsg).not.toContain("no valid files")

    await clearState()
  })

  // ============================================================================
  // OS-SPECIFIC TEST CASES (if needed)
  // ============================================================================

  /**
   * Cross-platform file drop test - tests that file drop works consistently
   * across Windows, macOS, and Linux
   */
  it("should handle file drop on all operating systems", async () => {
    const file = path.join(process.cwd(), "tests/assets/valid.cal")

    // This test runs on all OS - WebdriverIO handles OS differences
    await simulateFileDrop([file])

    const hasPreview = await hasCanvasPreview()
    expect(hasPreview).toBe(true)

    await clearState()
  })

})
