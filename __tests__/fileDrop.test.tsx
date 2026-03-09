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

import React from "react"
import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

import Home from "./src/app/home-page/page.tsx"
import { mockFileDrop } from "./fileDrop.tsx"

const mockSet = vi.fn()
vi.mock("./src/app/home-page/(pipeline-configuration)/config-provider.tsx", () => ({
  useGlobalPipelineConfig: () => ({ config: { inputSets: [] }, set: mockSet })
}))

describe("File Drop Frontend 9 Cases", () => {

  beforeEach(() => {
    mockSet.mockClear()
  })

  it("1. single valid file", () => {
    render(<Home />)
    const dropzone = screen.getByTestId("dropzone")
    mockFileDrop(dropzone, [{ name: "good.hdr", content: "valid" }])
    expect(mockSet).toHaveBeenCalled()
  })

  it("2. single valid extension but invalid content", () => {
    render(<Home />)
    const dropzone = screen.getByTestId("dropzone")
    mockFileDrop(dropzone, [{ name: "good.hdr", content: "corrupt" }])
    expect(mockSet).not.toHaveBeenCalled()
  })

  it("3. single invalid extension", () => {
    render(<Home />)
    const dropzone = screen.getByTestId("dropzone")
    mockFileDrop(dropzone, [{ name: "bad.txt", content: "data" }])
    expect(mockSet).not.toHaveBeenCalled()
  })

  it("4. single directory input", () => {
    render(<Home />)
    const dropzone = screen.getByTestId("dropzone")
    mockFileDrop(dropzone, [{ name: "folder/", content: "" }])
    expect(mockSet).not.toHaveBeenCalled()
  })

  it("5. multiple files over max batch size", () => {
    render(<Home />)
    const dropzone = screen.getByTestId("dropzone")
    const files = Array(50).fill(0).map((_, i) => ({ name: `img${i}.hdr`, content: "valid" }))
    mockFileDrop(dropzone, files)
    expect(mockSet).not.toHaveBeenCalled() // assuming batch limit
  })

  it("6. multiple all valid files", () => {
    render(<Home />)
    const dropzone = screen.getByTestId("dropzone")
    const files = [
      { name: "1.hdr", content: "valid" },
      { name: "2.hdr", content: "valid" },
      { name: "3.hdr", content: "valid" }
    ]
    mockFileDrop(dropzone, files)
    expect(mockSet).toHaveBeenCalled()
  })

  it("7. multiple all invalid files", () => {
    render(<Home />)
    const dropzone = screen.getByTestId("dropzone")
    const files = [
      { name: "1.txt", content: "" },
      { name: "2.doc", content: "" }
    ]
    mockFileDrop(dropzone, files)
    expect(mockSet).not.toHaveBeenCalled()
  })

  it("8. 1 invalid, rest valid (4 files)", () => {
    render(<Home />)
    const dropzone = screen.getByTestId("dropzone")
    const files = [
      { name: "good1.hdr", content: "valid" },
      { name: "good2.hdr", content: "valid" },
      { name: "good3.hdr", content: "valid" },
      { name: "bad.txt", content: "" }
    ]
    mockFileDrop(dropzone, files)
    expect(mockSet).toHaveBeenCalled()
  })

  it("9. 1 valid, rest invalid (4 files)", () => {
    render(<Home />)
    const dropzone = screen.getByTestId("dropzone")
    const files = [
      { name: "good.hdr", content: "valid" },
      { name: "bad1.txt", content: "" },
      { name: "bad2.doc", content: "" },
      { name: "bad3.doc", content: "" }
    ]
    mockFileDrop(dropzone, files)
    expect(mockSet).toHaveBeenCalled()
  })

})