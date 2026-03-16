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

    await dropArea.waitForExist()

  })


  // helper function to simulate file drop
  async function fileDrop(files){

    const remote = []

    for(const file of files){

      const uploaded = await browser.uploadFile(file)

      remote.push(uploaded)

    }

    await dropArea.addValue(remote)

  }



  // 1 valid extension and valid content
  it("valid extension + valid content", async () => {

    const file = path.join(process.cwd(),"tests/assets/valid.cal")

    await fileDrop([file])

    const preview = await $("canvas")

    await expect(preview).toBeExisting()

  })



  // 2 valid extension invalid content
  it("valid extension + invalid content", async () => {

    const file = path.join(process.cwd(),"tests/assets/invalid.cal")

    await fileDrop([file])

    const error = await $(".error")

    await expect(error).toBeExisting()

  })



  // 3 invalid extension
  it("invalid extension", async () => {

    const file = path.join(process.cwd(),"tests/assets/file.txt")

    await fileDrop([file])

    const error = await $(".error")

    await expect(error).toBeExisting()

  })



  // 4 directory input
  it("directory input", async () => {

    const file = path.join(process.cwd(),"tests/assets/folder")

    await fileDrop([file])

    const error = await $(".error")

    await expect(error).toBeExisting()

  })



  // 5 over max batch size
  it("batch size overflow", async () => {

    const files = []

    for(let i=0;i<10;i++){

      files.push(
        path.join(process.cwd(),`tests/assets/file${i}.cal`)
      )

    }

    await fileDrop(files)

    const error = await $(".error")

    await expect(error).toBeExisting()

  })



  // 6 all valid
  it("all files valid", async () => {

    const files = [
      path.join(process.cwd(),"tests/assets/a.cal"),
      path.join(process.cwd(),"tests/assets/b.cal")
    ]

    await fileDrop(files)

    const preview = await $("canvas")

    await expect(preview).toBeExisting()

  })



  // 7 all invalid
  it("all files invalid", async () => {

    const files = [
      path.join(process.cwd(),"tests/assets/a.txt"),
      path.join(process.cwd(),"tests/assets/b.txt")
    ]

    await fileDrop(files)

    const error = await $(".error")

    await expect(error).toBeExisting()

  })



  // 8 one invalid rest valid
  it("1 invalid 3 valid", async () => {

    const files = [
      path.join(process.cwd(),"tests/assets/a.cal"),
      path.join(process.cwd(),"tests/assets/b.cal"),
      path.join(process.cwd(),"tests/assets/c.cal"),
      path.join(process.cwd(),"tests/assets/bad.txt")
    ]

    await fileDrop(files)

    const preview = await $("canvas")

    await expect(preview).toBeExisting()

  })



  // 9 one valid rest invalid
  it("1 valid rest invalid", async () => {

    const files = [
      path.join(process.cwd(),"tests/assets/a.cal"),
      path.join(process.cwd(),"tests/assets/bad1.txt"),
      path.join(process.cwd(),"tests/assets/bad2.txt"),
      path.join(process.cwd(),"tests/assets/bad3.txt")
    ]

    await fileDrop(files)

    const preview = await $("canvas")

    await expect(preview).toBeExisting()

  })

})
